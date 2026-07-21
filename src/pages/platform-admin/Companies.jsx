import { useCallback, useEffect, useRef, useState } from "react";
import platformAdminService from "../../api/platformAdminService";

function normalizeStatus(status) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase();

  if (
    value === "approved" ||
    value === "active" ||
    value === "activated"
  ) {
    return "Approved";
  }

  if (
    value === "suspended" ||
    value === "inactive" ||
    value === "disabled"
  ) {
    return "Suspended";
  }

  if (value === "pending") {
    return "Pending";
  }

  if (value === "rejected") {
    return "Rejected";
  }

  return status || "Unknown";
}

function normalizeCompany(company = {}) {
  return {
    ...company,

    id:
      company.id ??
      company.companyId ??
      null,

    companyName:
      company.companyName ??
      company.businessName ??
      company.organizationName ??
      company.name ??
      "Unnamed Company",

    companyEmail:
      company.companyEmail ??
      company.contactEmail ??
      company.email ??
      "Not provided",

    industry:
      company.industry ??
      company.industryType ??
      company.sector ??
      "General Corporate",

    businessRegistrationNumber:
      company.businessRegistrationNumber ??
      company.registrationNumber ??
      company.legalRegistrationNumber ??
      company.brNumber ??
      "Not provided",

    representativeName:
      company.representativeName ??
      company.companyAdminName ??
      company.contactPersonName ??
      company.ownerName ??
      "Not provided",

    status: normalizeStatus(
      company.status ??
        company.companyStatus ??
        company.accountStatus
    ),
  };
}

function extractCompanies(data) {
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
    return (
      "Cannot connect to the backend server. " +
      "Make sure the HirePath backend is running."
    );
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
    return (
      "Your login session has expired. " +
      "Please log in again."
    );
  }

  if (statusCode === 403) {
    return (
      "You do not have permission to manage companies."
    );
  }

  if (statusCode === 404) {
    return (
      error.response?.data?.message ||
      "The requested company or API endpoint was not found."
    );
  }

  if (statusCode === 409) {
    return (
      error.response?.data?.message ||
      "The company status has already been changed."
    );
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.response?.data?.error ||
    "The operation could not be completed."
  );
}

function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [actionCompanyId, setActionCompanyId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isMountedRef = useRef(true);

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await platformAdminService.getAllCompanies();

      if (!isMountedRef.current) return;

      const normalizedCompanies = extractCompanies(response)
        .map(normalizeCompany)
        .filter((company) => {
          return (
            company.id !== null &&
            (company.status === "Approved" ||
              company.status === "Suspended")
          );
        });

      setCompanies(normalizedCompanies);
    } catch (requestError) {
      console.error(
        "Failed to load companies:",
        requestError
      );

      if (!isMountedRef.current) return;

      setCompanies([]);
      setError(getErrorMessage(requestError));
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Synchronous execution cleanups prevent set-state-in-effect warning
    const timerId = setTimeout(() => {
      void loadCompanies();
    }, 0);

    return () => {
      isMountedRef.current = false;
      clearTimeout(timerId);
    };
  }, [loadCompanies]);

  const handleCompanyStatus = async (company) => {
    if (!company?.id) {
      setError("Invalid company ID.");
      return;
    }

    const currentStatus = normalizeStatus(company.status);

    const shouldSuspend = currentStatus === "Approved";
    const shouldActivate = currentStatus === "Suspended";

    if (!shouldSuspend && !shouldActivate) {
      setError(
        "Only approved or suspended companies can be updated."
      );
      return;
    }

    const confirmationMessage = shouldSuspend
      ? `Are you sure you want to suspend ${company.companyName}?`
      : `Are you sure you want to activate ${company.companyName}?`;

    const confirmed = window.confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    try {
      setActionCompanyId(company.id);
      setError("");
      setSuccess("");

      if (shouldSuspend) {
        await platformAdminService.suspendCompany(company.id);

        if (!isMountedRef.current) return;

        setSuccess(
          `${company.companyName} was suspended successfully.`
        );
      } else {
        await platformAdminService.activateCompany(company.id);

        if (!isMountedRef.current) return;

        setSuccess(
          `${company.companyName} was activated successfully.`
        );
      }

      await loadCompanies();
    } catch (requestError) {
      console.error(
        "Failed to update company status:",
        requestError
      );

      if (!isMountedRef.current) return;

      setError(getErrorMessage(requestError));
      await loadCompanies();
    } finally {
      if (isMountedRef.current) {
        setActionCompanyId(null);
      }
    }
  };

  const getStatusStyle = (status) => {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === "Approved") {
      return {
        backgroundColor: "#d1fae5",
        color: "#065f46",
        border: "1px solid #a7f3d0",
      };
    }

    if (normalizedStatus === "Suspended") {
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        border: "1px solid #fecaca",
      };
    }

    return {
      backgroundColor: "#e2e8f0",
      color: "#334155",
      border: "1px solid #cbd5e1",
    };
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "var(--dark-text, #0f172a)",
        }}
      >
        Loading companies from the database...
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
            Corporate Accounts Directory
          </h3>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Approved and suspended companies loaded directly from the HirePath database.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCompanies}
          disabled={loading || actionCompanyId !== null}
          style={{
            padding: "9px 16px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#334155",
            fontWeight: "700",
            cursor:
              loading || actionCompanyId !== null
                ? "not-allowed"
                : "pointer",
            opacity:
              loading || actionCompanyId !== null
                ? 0.6
                : 1,
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
            color: "#991b1b",
            background: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
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
            color: "#065f46",
            background: "#d1fae5",
            border: "1px solid #a7f3d0",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {success}
        </div>
      )}

      {companies.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#64748b",
            background: "#f8fafc",
            border: "1px dashed #cbd5e1",
            borderRadius: "10px",
          }}
        >
          No approved or suspended companies were found in the database.
        </div>
      ) : (
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
              minWidth: "950px",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                <th>Company Title</th>
                <th>Legal BR ID</th>
                <th>Industry Sector</th>
                <th>Representative</th>
                <th>Corporate Email</th>
                <th>Status</th>

                <th
                  style={{
                    textAlign: "right",
                  }}
                >
                  Administrative Control
                </th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => {
                const status = normalizeStatus(company.status);
                const isProcessing = actionCompanyId === company.id;
                const canSuspend = status === "Approved";
                const canActivate = status === "Suspended";

                return (
                  <tr key={company.id}>
                    <td>
                      <strong>{company.companyName}</strong>
                    </td>

                    <td>
                      <code>{company.businessRegistrationNumber}</code>
                    </td>

                    <td>{company.industry}</td>

                    <td>{company.representativeName}</td>

                    <td>{company.companyEmail}</td>

                    <td>
                      <span
                        style={{
                          ...getStatusStyle(status),
                          display: "inline-block",
                          padding: "5px 10px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700",
                        }}
                      >
                        {status}
                      </span>
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleCompanyStatus(company)}
                        disabled={isProcessing}
                        style={{
                          width: "auto",
                          minWidth: "110px",
                          margin: 0,
                          padding: "8px 14px",
                          border: "none",
                          borderRadius: "8px",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: isProcessing
                            ? "not-allowed"
                            : "pointer",
                          opacity: isProcessing ? 0.65 : 1,
                          background: canSuspend
                            ? "#ef4444"
                            : canActivate
                              ? "linear-gradient(135deg, #2563eb, #7c3aed)"
                              : "#94a3b8",
                        }}
                      >
                        {isProcessing
                          ? "Processing..."
                          : canSuspend
                            ? "Suspend"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Companies;