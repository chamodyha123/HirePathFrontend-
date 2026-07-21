import { useCallback, useEffect, useRef, useState } from "react";
import platformAdminService from "../../api/platformAdminService";

function normalizePendingCompany(item = {}) {
  return {
    ...item,

    id:
      item.id ??
      item.registrationId ??
      item.companyRegistrationId ??
      null,

    companyName:
      item.companyName ??
      item.businessName ??
      item.organizationName ??
      item.name ??
      "Unnamed Company",

    businessRegistrationNumber:
      item.businessRegistrationNumber ??
      item.registrationNumber ??
      item.legalRegistrationNumber ??
      item.brNumber ??
      "Not provided",

    representativeName:
      item.representativeName ??
      item.companyAdminName ??
      item.contactPersonName ??
      item.ownerName ??
      item.fullName ??
      "Not provided",

    companyEmail:
      item.companyEmail ??
      item.representativeEmail ??
      item.contactEmail ??
      item.email ??
      "Not provided",

    status: String(
      item.status ??
        item.registrationStatus ??
        item.requestStatus ??
        "Pending"
    ),
  };
}

function extractList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.$values)) {
    return data.$values;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.$values)) {
    return data.data.$values;
  }

  return [];
}

function getErrorMessage(error) {
  if (!error?.response) {
    return "Cannot connect to the backend server.";
  }

  const statusCode = error.response.status;

  if (statusCode === 400) {
    return (
      error.response?.data?.message ||
      error.response?.data?.title ||
      "The request is invalid."
    );
  }

  if (statusCode === 401) {
    return "Your login session has expired. Please log in again.";
  }

  if (statusCode === 403) {
    return "You do not have permission to review company requests.";
  }

  if (statusCode === 404) {
    return (
      error.response?.data?.message ||
      "The company registration request or API endpoint was not found."
    );
  }

  if (statusCode === 409) {
    return (
      error.response?.data?.message ||
      "This company registration request has already been reviewed."
    );
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.response?.data?.error ||
    "The operation could not be completed."
  );
}

function PendingCompanies() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isMountedRef = useRef(true);

  const notifyPlatformAdminDataChanged = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("platform-admin-data-changed", {
        detail: {
          source: "pending-companies",
          timestamp: Date.now(),
        },
      })
    );
  }, []);

  const loadPending = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await platformAdminService.getPendingCompanies();

      if (!isMountedRef.current) {
        return;
      }

      const pendingList = extractList(data)
        .map(normalizePendingCompany)
        .filter((company) => {
          const status = String(company.status)
            .trim()
            .toLowerCase();

          return (
            company.id !== null &&
            (status === "pending" || status === "")
          );
        });

      setPending(pendingList);
    } catch (requestError) {
      console.error(
        "Failed to load pending companies:",
        requestError
      );

      if (!isMountedRef.current) {
        return;
      }

      setPending([]);
      setError(getErrorMessage(requestError));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const timerId = setTimeout(() => {
      void loadPending();
    }, 0);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timerId);
    };
  }, [loadPending]);

  const processRequest = async (company, action) => {
    if (!company?.id) {
      setError("Invalid company registration ID.");
      return;
    }

    if (action === "approve") {
      const confirmed = window.confirm(
        `Approve ${company.companyName}?`
      );

      if (!confirmed) {
        return;
      }

      try {
        setProcessingId(company.id);
        setError("");
        setSuccess("");

        await platformAdminService.approveCompany(
          company.id
        );

        if (!isMountedRef.current) {
          return;
        }

        setSuccess(
          `${company.companyName} was approved successfully.`
        );

        notifyPlatformAdminDataChanged();
        await loadPending();
      } catch (requestError) {
        console.error(
          "Failed to approve company:",
          requestError
        );

        if (!isMountedRef.current) {
          return;
        }

        setError(getErrorMessage(requestError));
        await loadPending();
      } finally {
        if (isMountedRef.current) {
          setProcessingId(null);
        }
      }

      return;
    }

    const rejectionReason = window.prompt(
      `Enter the rejection reason for ${company.companyName}:`
    );

    if (rejectionReason === null) {
      return;
    }

    if (!rejectionReason.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    try {
      setProcessingId(company.id);
      setError("");
      setSuccess("");

      await platformAdminService.rejectCompany(
        company.id,
        rejectionReason.trim()
      );

      if (!isMountedRef.current) {
        return;
      }

      setSuccess(
        `${company.companyName} was rejected successfully.`
      );

      notifyPlatformAdminDataChanged();
      await loadPending();
    } catch (requestError) {
      console.error(
        "Failed to reject company:",
        requestError
      );

      if (!isMountedRef.current) {
        return;
      }

      setError(getErrorMessage(requestError));
      await loadPending();
    } finally {
      if (isMountedRef.current) {
        setProcessingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "240px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--dark-text, #0f172a)",
          textAlign: "center",
        }}
      >
        Loading pending company requests from the database...
      </div>
    );
  }

  return (
    <div
      className="card"
      style={{
        padding: "24px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 6px 0",
              color: "var(--dark-text, #0f172a)",
            }}
          >
            Pending Verification Pipelines ({pending.length})
          </h3>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Company registration requests waiting for
            Platform Admin approval.
          </p>
        </div>

        <button
          type="button"
          onClick={loadPending}
          disabled={processingId !== null}
          style={{
            padding: "9px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#334155",
            fontWeight: "700",
            cursor:
              processingId !== null
                ? "not-allowed"
                : "pointer",
            opacity:
              processingId !== null ? 0.6 : 1,
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#fee2e2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 14px",
            borderRadius: "8px",
            background: "#d1fae5",
            color: "#065f46",
            border: "1px solid #a7f3d0",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      <div
        style={{
          width: "100%",
          overflowX: "auto",
        }}
      >
        <table
          className="tracker-table"
          style={{
            width: "100%",
            minWidth: "900px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Organization</th>
              <th>Legal BR ID</th>
              <th>Representative Name</th>
              <th>Email Address</th>

              <th
                style={{
                  textAlign: "right",
                }}
              >
                Authorization
              </th>
            </tr>
          </thead>

          <tbody>
            {pending.map((company) => {
              const isProcessing =
                processingId === company.id;

              return (
                <tr key={company.id}>
                  <td>
                    <strong>
                      {company.companyName}
                    </strong>
                  </td>

                  <td>
                    <code>
                      {
                        company.businessRegistrationNumber
                      }
                    </code>
                  </td>

                  <td>
                    {company.representativeName}
                  </td>

                  <td>
                    {company.companyEmail}
                  </td>

                  <td
                    style={{
                      textAlign: "right",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          processRequest(
                            company,
                            "approve"
                          )
                        }
                        disabled={isProcessing}
                        className="auth-btn"
                        style={{
                          padding: "7px 13px",
                          width: "auto",
                          minWidth: "90px",
                          fontSize: "13px",
                          margin: 0,
                          border: "none",
                          borderRadius: "7px",
                          background: "#10b981",
                          color: "#ffffff",
                          fontWeight: "700",
                          cursor: isProcessing
                            ? "not-allowed"
                            : "pointer",
                          opacity: isProcessing
                            ? 0.65
                            : 1,
                        }}
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          processRequest(
                            company,
                            "reject"
                          )
                        }
                        disabled={isProcessing}
                        className="auth-btn"
                        style={{
                          padding: "7px 13px",
                          width: "auto",
                          minWidth: "85px",
                          fontSize: "13px",
                          margin: 0,
                          border: "none",
                          borderRadius: "7px",
                          background: "#ef4444",
                          color: "#ffffff",
                          fontWeight: "700",
                          cursor: isProcessing
                            ? "not-allowed"
                            : "pointer",
                          opacity: isProcessing
                            ? 0.65
                            : 1,
                        }}
                      >
                        {isProcessing
                          ? "Processing..."
                          : "Reject"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {pending.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    color:
                      "var(--muted, #64748b)",
                    padding: "32px 20px",
                  }}
                >
                  No business entities are waiting in
                  the validation queue.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingCompanies;