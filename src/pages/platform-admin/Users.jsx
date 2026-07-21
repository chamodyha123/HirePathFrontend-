import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import platformAdminService from "../../api/platformAdminService";

const AVAILABLE_ROLES = [
  "Candidate",
  "Recruiter",
  "HiringManager",
  "CompanyAdmin",
];

function normalizeStatus(status, isActive, isLocked) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase();

  if (
    value === "active" ||
    value === "enabled" ||
    value === "approved"
  ) {
    return "Active";
  }

  if (
    value === "suspended" ||
    value === "blocked" ||
    value === "disabled" ||
    value === "inactive" ||
    value === "locked"
  ) {
    return "Suspended";
  }

  if (isLocked === true || isActive === false) {
    return "Suspended";
  }

  return "Active";
}

function normalizeRole(role) {
  if (Array.isArray(role)) {
    return role[0] ?? "Unassigned";
  }

  if (Array.isArray(role?.$values)) {
    return role.$values[0] ?? "Unassigned";
  }

  return role ?? "Unassigned";
}

function normalizeUser(user = {}) {
  const lockoutEnd =
    user.lockoutEnd ??
    user.LockoutEnd ??
    null;

  const isLocked =
    lockoutEnd &&
    new Date(lockoutEnd).getTime() >
      Date.now();

  return {
    ...user,

    id:
      user.id ??
      user.userId ??
      user.UserId ??
      null,

    fullName:
      user.fullName ??
      user.FullName ??
      user.name ??
      user.Name ??
      "Unnamed User",

    userName:
      user.userName ??
      user.UserName ??
      user.username ??
      user.Username ??
      "Not provided",

    email:
      user.email ??
      user.Email ??
      "Not provided",

    phoneNumber:
      user.phoneNumber ??
      user.PhoneNumber ??
      "Not provided",

    emailConfirmed:
      user.emailConfirmed ??
      user.EmailConfirmed ??
      false,

    role: normalizeRole(
      user.role ??
        user.Role ??
        user.roles ??
        user.Roles
    ),

    status: normalizeStatus(
      user.status ??
        user.Status ??
        user.accountStatus ??
        user.AccountStatus,
      user.isActive ??
        user.IsActive ??
        user.enabled ??
        user.Enabled,
      isLocked
    ),
  };
}

function extractUsers(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.$values)) {
    return data.$values;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.users)) {
    return data.users;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.$values)) {
    return data.data.$values;
  }

  if (Array.isArray(data?.data?.items)) {
    return data.data.items;
  }

  return [];
}

function getErrorMessage(error) {
  if (!error?.response) {
    return (
      "Cannot connect to the HirePath backend. " +
      "Make sure the API is running."
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
      "You do not have permission to manage users."
    );
  }

  if (statusCode === 404) {
    return (
      error.response?.data?.message ||
      "The requested user or endpoint was not found."
    );
  }

  if (statusCode === 409) {
    return (
      error.response?.data?.message ||
      "The requested operation conflicts with the current user state."
    );
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.response?.data?.error ||
    "The operation could not be completed."
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [
    processingUserId,
    setProcessingUserId,
  ] = useState(null);

  const [processingAction, setProcessingAction] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [roleFilter, setRoleFilter] =
    useState("All");

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [viewLoading, setViewLoading] =
    useState(false);

  const [roleUser, setRoleUser] =
    useState(null);

  const [selectedRole, setSelectedRole] =
    useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await platformAdminService.getAllUsers();

      const normalizedUsers = extractUsers(
        response
      )
        .map(normalizeUser)
        .filter((user) => user.id !== null);

      setUsers(normalizedUsers);
    } catch (requestError) {
      console.error(
        "Failed to load users:",
        requestError
      );

      setUsers([]);
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setLoading(false);
    }
  }, []);
useEffect(() => {
  let isMounted = true;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await platformAdminService.getAllUsers();

      if (!isMounted) {
        return;
      }

      const normalizedUsers = extractUsers(
        response
      )
        .map(normalizeUser)
        .filter((user) => user.id !== null);

      setUsers(normalizedUsers);
    } catch (requestError) {
      console.error(
        "Failed to load users:",
        requestError
      );

      if (!isMounted) {
        return;
      }

      setUsers([]);
      setError(
        getErrorMessage(requestError)
      );
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  fetchUsers();

  return () => {
    isMounted = false;
  };
}, []);

  const handleViewUser = async (user) => {
    try {
      setViewLoading(true);
      setError("");
      setSuccess("");

      const response =
        await platformAdminService.getUserById(
          user.id
        );

      setSelectedUser(
        normalizeUser(response)
      );
    } catch (requestError) {
      console.error(
        "Failed to load user details:",
        requestError
      );

      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setViewLoading(false);
    }
  };

  const toggleUserStatus = async (user) => {
    if (!user?.id) {
      setError("Invalid user ID.");
      return;
    }

    const shouldSuspend =
      user.status === "Active";

    const actionText = shouldSuspend
      ? "suspend"
      : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} ${user.fullName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingUserId(user.id);
      setProcessingAction(
        shouldSuspend
          ? "suspend"
          : "activate"
      );

      setError("");
      setSuccess("");

      if (shouldSuspend) {
        await platformAdminService.suspendUser(
          user.id
        );

        setSuccess(
          `${user.fullName} was suspended successfully.`
        );
      } else {
        await platformAdminService.activateUser(
          user.id
        );

        setSuccess(
          `${user.fullName} was activated successfully.`
        );
      }

      await loadUsers();
    } catch (requestError) {
      console.error(
        "Failed to update user status:",
        requestError
      );

      setError(
        getErrorMessage(requestError)
      );

      await loadUsers();
    } finally {
      setProcessingUserId(null);
      setProcessingAction("");
    }
  };

  const openRoleModal = (user) => {
    setRoleUser(user);
    setSelectedRole(user.role);
    setError("");
    setSuccess("");
  };

  const handleUpdateRole = async () => {
    if (!roleUser?.id) {
      setError("Invalid user ID.");
      return;
    }

    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    const confirmed = window.confirm(
      `Change ${roleUser.fullName}'s role to ${selectedRole}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingUserId(roleUser.id);
      setProcessingAction("role");
      setError("");
      setSuccess("");

      await platformAdminService.updateUserRole(
        roleUser.id,
        selectedRole
      );

      setSuccess(
        `${roleUser.fullName}'s role was changed to ${selectedRole}.`
      );

      setRoleUser(null);
      setSelectedRole("");

      await loadUsers();
    } catch (requestError) {
      console.error(
        "Failed to update user role:",
        requestError
      );

      setError(
        getErrorMessage(requestError)
      );
    } finally {
      setProcessingUserId(null);
      setProcessingAction("");
    }
  };

  const handleDeleteUser = async (user) => {
    if (!user?.id) {
      setError("Invalid user ID.");
      return;
    }

    const confirmed = window.confirm(
      `Permanently delete ${user.fullName}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    const secondConfirmation =
      window.confirm(
        `Final confirmation: Delete ${user.fullName}'s account and related Identity records?`
      );

    if (!secondConfirmation) {
      return;
    }

    try {
      setProcessingUserId(user.id);
      setProcessingAction("delete");
      setError("");
      setSuccess("");

      await platformAdminService.deleteUser(
        user.id
      );

      setSuccess(
        `${user.fullName} was deleted successfully.`
      );

      if (
        selectedUser?.id === user.id
      ) {
        setSelectedUser(null);
      }

      await loadUsers();
    } catch (requestError) {
      console.error(
        "Failed to delete user:",
        requestError
      );

      setError(
        getErrorMessage(requestError)
      );

      await loadUsers();
    } finally {
      setProcessingUserId(null);
      setProcessingAction("");
    }
  };

  const roles = useMemo(() => {
    const uniqueRoles = users
      .map((user) => user.role)
      .filter(
        (role) =>
          role &&
          role !== "Unknown" &&
          role !== "Unassigned"
      );

    return [
      "All",
      ...new Set(uniqueRoles),
    ];
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const fullName = String(
        user.fullName ?? ""
      ).toLowerCase();

      const email = String(
        user.email ?? ""
      ).toLowerCase();

      const userName = String(
        user.userName ?? ""
      ).toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        fullName.includes(
          normalizedSearch
        ) ||
        email.includes(
          normalizedSearch
        ) ||
        userName.includes(
          normalizedSearch
        );

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      return (
        matchesSearch &&
        matchesRole
      );
    });
  }, [
    users,
    searchTerm,
    roleFilter,
  ]);

  if (loading) {
    return (
      <div className="users-page-loading">
        Loading registered user accounts from the
        database...
        <UsersStyles />
      </div>
    );
  }

  return (
    <div className="users-page">
      <UsersStyles />

      <div className="users-header">
        <div>
          <span className="users-eyebrow">
            PLATFORM IDENTITY MANAGEMENT
          </span>

          <h1>
            Global User Accounts Directory
          </h1>

          <p>
            View account details, manage roles,
            suspend access, reactivate accounts and
            permanently delete eligible users.
          </p>
        </div>

        <button
          type="button"
          className="users-refresh-button"
          onClick={loadUsers}
          disabled={
            loading ||
            processingUserId !== null
          }
        >
          Refresh Users
        </button>
      </div>

      {error && (
        <div className="users-alert users-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="users-alert users-alert-success">
          {success}
        </div>
      )}

      <div className="users-toolbar">
        <input
          type="text"
          placeholder="Search by name, username or email..."
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(
              event.target.value
            )
          }
        />

        <select
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(
              event.target.value
            )
          }
        >
          {roles.map((role) => (
            <option
              key={role}
              value={role}
            >
              {role === "All"
                ? "All Platform Roles"
                : role}
            </option>
          ))}
        </select>
      </div>

      <div className="users-summary">
        <div>
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>

        <div>
          <span>Active Users</span>
          <strong>
            {
              users.filter(
                (user) =>
                  user.status === "Active"
              ).length
            }
          </strong>
        </div>

        <div>
          <span>Suspended Users</span>
          <strong>
            {
              users.filter(
                (user) =>
                  user.status ===
                  "Suspended"
              ).length
            }
          </strong>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="users-empty">
          No registered users were found in the
          database.
        </div>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Account</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Status</th>
                <th className="users-actions-heading">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const isActive =
                  user.status === "Active";

                const isProcessing =
                  processingUserId ===
                  user.id;

                const isAdmin =
                  String(user.role)
                    .toLowerCase() ===
                  "admin";

                return (
                  <tr key={user.id}>
                    <td>
                      <div className="users-account-cell">
                        <div className="users-avatar">
                          {String(
                            user.fullName
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {user.fullName}
                          </strong>

                          <span>
                            User ID: {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <code>
                        @{user.userName}
                      </code>
                    </td>

                    <td>{user.email}</td>

                    <td>
                      <span className="users-role-badge">
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`users-status-badge ${
                          isActive
                            ? "active"
                            : "suspended"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <div className="users-action-group">
                        <button
                          type="button"
                          className="users-action-button view"
                          onClick={() =>
                            handleViewUser(user)
                          }
                          disabled={isProcessing}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="users-action-button role"
                          onClick={() =>
                            openRoleModal(user)
                          }
                          disabled={
                            isProcessing ||
                            isAdmin
                          }
                          title={
                            isAdmin
                              ? "Admin role cannot be changed here."
                              : "Change user role"
                          }
                        >
                          Role
                        </button>

                        <button
                          type="button"
                          className={`users-action-button ${
                            isActive
                              ? "suspend"
                              : "activate"
                          }`}
                          onClick={() =>
                            toggleUserStatus(
                              user
                            )
                          }
                          disabled={isProcessing}
                        >
                          {isProcessing &&
                          (processingAction ===
                            "suspend" ||
                            processingAction ===
                              "activate")
                            ? "Working..."
                            : isActive
                              ? "Block"
                              : "Unblock"}
                        </button>

                        <button
                          type="button"
                          className="users-action-button delete"
                          onClick={() =>
                            handleDeleteUser(
                              user
                            )
                          }
                          disabled={
                            isProcessing ||
                            isAdmin
                          }
                          title={
                            isAdmin
                              ? "Admin accounts cannot be deleted."
                              : "Delete user permanently"
                          }
                        >
                          {isProcessing &&
                          processingAction ===
                            "delete"
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="users-no-results"
                  >
                    No accounts match the selected
                    search or role filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <div
          className="users-modal-backdrop"
          onClick={() =>
            setSelectedUser(null)
          }
        >
          <div
            className="users-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="users-modal-header">
              <div>
                <span>USER DETAILS</span>
                <h2>
                  {selectedUser.fullName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                ×
              </button>
            </div>

            <div className="users-details-grid">
              <div>
                <span>User ID</span>
                <strong>
                  {selectedUser.id}
                </strong>
              </div>

              <div>
                <span>Full Name</span>
                <strong>
                  {selectedUser.fullName}
                </strong>
              </div>

              <div>
                <span>Username</span>
                <strong>
                  @{selectedUser.userName}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {selectedUser.email}
                </strong>
              </div>

              <div>
                <span>Phone Number</span>
                <strong>
                  {selectedUser.phoneNumber}
                </strong>
              </div>

              <div>
                <span>Role</span>
                <strong>
                  {selectedUser.role}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedUser.status}
                </strong>
              </div>

              <div>
                <span>Email Confirmed</span>
                <strong>
                  {selectedUser.emailConfirmed
                    ? "Yes"
                    : "No"}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewLoading && (
        <div className="users-loading-overlay">
          Loading user details...
        </div>
      )}

      {roleUser && (
        <div
          className="users-modal-backdrop"
          onClick={() =>
            setRoleUser(null)
          }
        >
          <div
            className="users-role-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="users-modal-header">
              <div>
                <span>CHANGE SYSTEM ROLE</span>
                <h2>{roleUser.fullName}</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setRoleUser(null)
                }
              >
                ×
              </button>
            </div>

            <label>
              Select new role
            </label>

            <select
              value={selectedRole}
              onChange={(event) =>
                setSelectedRole(
                  event.target.value
                )
              }
            >
              <option value="">
                Select role
              </option>

              {AVAILABLE_ROLES.map(
                (role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role}
                  </option>
                )
              )}
            </select>

            <div className="users-modal-actions">
              <button
                type="button"
                className="cancel"
                onClick={() =>
                  setRoleUser(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="save"
                onClick={handleUpdateRole}
                disabled={
                  processingUserId !== null ||
                  !selectedRole
                }
              >
                {processingAction === "role"
                  ? "Updating..."
                  : "Update Role"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UsersStyles() {
  return (
    <style>{`
      .users-page {
        width: 100%;
        box-sizing: border-box;
        padding: 28px;
        color: #e5e7eb;
        background:
          radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 35%),
          radial-gradient(circle at top right, rgba(124, 58, 237, 0.1), transparent 35%),
          #0f172a;
        border-radius: 18px;
      }

      .users-page-loading {
        min-height: 300px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #cbd5e1;
        background: #0f172a;
        border-radius: 18px;
      }

      .users-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        margin-bottom: 22px;
      }

      .users-eyebrow {
        color: #38bdf8;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.12em;
      }

      .users-header h1 {
        margin: 7px 0 7px;
        color: #f8fafc;
        font-size: clamp(24px, 3vw, 33px);
      }

      .users-header p {
        max-width: 760px;
        margin: 0;
        color: #94a3b8;
        font-size: 14px;
        line-height: 1.6;
      }

      .users-refresh-button {
        padding: 10px 16px;
        color: #e2e8f0;
        font-weight: 700;
        cursor: pointer;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
      }

      .users-refresh-button:hover:not(:disabled) {
        border-color: #38bdf8;
      }

      .users-refresh-button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .users-alert {
        margin-bottom: 16px;
        padding: 13px 15px;
        font-size: 13px;
        border-radius: 10px;
      }

      .users-alert-error {
        color: #fecaca;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.38);
      }

      .users-alert-success {
        color: #a7f3d0;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.38);
      }

      .users-toolbar {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 18px;
      }

      .users-toolbar input,
      .users-toolbar select,
      .users-role-modal select {
        box-sizing: border-box;
        padding: 11px 13px;
        color: #e2e8f0;
        background: #111c31;
        border: 1px solid #334155;
        border-radius: 10px;
        outline: none;
      }

      .users-toolbar input {
        flex: 2;
        min-width: 260px;
      }

      .users-toolbar select {
        flex: 1;
        min-width: 190px;
      }

      .users-toolbar input:focus,
      .users-toolbar select:focus,
      .users-role-modal select:focus {
        border-color: #38bdf8;
        box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.1);
      }

      .users-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 18px;
      }

      .users-summary div {
        padding: 15px 17px;
        background: rgba(30, 41, 59, 0.78);
        border: 1px solid #334155;
        border-radius: 12px;
      }

      .users-summary span {
        display: block;
        margin-bottom: 5px;
        color: #94a3b8;
        font-size: 11px;
        text-transform: uppercase;
      }

      .users-summary strong {
        color: #f8fafc;
        font-size: 22px;
      }

      .users-table-wrapper {
        overflow-x: auto;
        background: #111827;
        border: 1px solid #273449;
        border-radius: 14px;
      }

      .users-table {
        width: 100%;
        min-width: 1100px;
        border-collapse: collapse;
      }

      .users-table th {
        padding: 14px 16px;
        color: #94a3b8;
        font-size: 11px;
        letter-spacing: 0.06em;
        text-align: left;
        text-transform: uppercase;
        background: #172033;
        border-bottom: 1px solid #273449;
      }

      .users-table td {
        padding: 15px 16px;
        color: #cbd5e1;
        font-size: 13px;
        border-bottom: 1px solid #223047;
      }

      .users-table tbody tr:hover {
        background: rgba(51, 65, 85, 0.22);
      }

      .users-actions-heading {
        text-align: right !important;
      }

      .users-account-cell {
        display: flex;
        align-items: center;
        gap: 11px;
      }

      .users-account-cell > div:last-child {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .users-account-cell span {
        color: #64748b;
        font-size: 10px;
      }

      .users-avatar {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: white;
        font-weight: 800;
        background: linear-gradient(135deg, #2563eb, #7c3aed);
        border-radius: 11px;
      }

      .users-table code {
        color: #67e8f9;
      }

      .users-role-badge {
        display: inline-block;
        padding: 5px 9px;
        color: #c4b5fd;
        font-size: 11px;
        font-weight: 700;
        background: rgba(124, 58, 237, 0.12);
        border: 1px solid rgba(124, 58, 237, 0.3);
        border-radius: 999px;
      }

      .users-status-badge {
        display: inline-block;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 800;
        border-radius: 999px;
      }

      .users-status-badge.active {
        color: #6ee7b7;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.34);
      }

      .users-status-badge.suspended {
        color: #fca5a5;
        background: rgba(239, 68, 68, 0.12);
        border: 1px solid rgba(239, 68, 68, 0.34);
      }

      .users-action-group {
        display: flex;
        justify-content: flex-end;
        gap: 7px;
        flex-wrap: wrap;
      }

      .users-action-button {
        min-width: 66px;
        padding: 7px 10px;
        color: white;
        font-size: 11px;
        font-weight: 800;
        cursor: pointer;
        border: 0;
        border-radius: 8px;
        transition: transform 0.15s, opacity 0.15s;
      }

      .users-action-button:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      .users-action-button:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }

      .users-action-button.view {
        background: #0284c7;
      }

      .users-action-button.role {
        background: #7c3aed;
      }

      .users-action-button.suspend {
        background: #d97706;
      }

      .users-action-button.activate {
        background: #059669;
      }

      .users-action-button.delete {
        background: #dc2626;
      }

      .users-empty,
      .users-no-results {
        padding: 38px 20px !important;
        color: #94a3b8 !important;
        text-align: center !important;
      }

      .users-modal-backdrop {
        position: fixed;
        z-index: 9999;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 18px;
        background: rgba(2, 6, 23, 0.78);
        backdrop-filter: blur(4px);
      }

      .users-modal,
      .users-role-modal {
        width: min(560px, 100%);
        padding: 24px;
        color: #e2e8f0;
        background: #111827;
        border: 1px solid #334155;
        border-radius: 16px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42);
      }

      .users-role-modal {
        width: min(430px, 100%);
      }

      .users-modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 15px;
        margin-bottom: 20px;
      }

      .users-modal-header span {
        color: #38bdf8;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.12em;
      }

      .users-modal-header h2 {
        margin: 5px 0 0;
        color: #f8fafc;
        font-size: 21px;
      }

      .users-modal-header > button {
        width: 34px;
        height: 34px;
        color: #94a3b8;
        font-size: 24px;
        cursor: pointer;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 9px;
      }

      .users-details-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }

      .users-details-grid div {
        padding: 13px;
        background: #172033;
        border: 1px solid #29364c;
        border-radius: 10px;
      }

      .users-details-grid span {
        display: block;
        margin-bottom: 5px;
        color: #64748b;
        font-size: 10px;
        text-transform: uppercase;
      }

      .users-details-grid strong {
        color: #e2e8f0;
        font-size: 13px;
        overflow-wrap: anywhere;
      }

      .users-role-modal label {
        display: block;
        margin-bottom: 8px;
        color: #cbd5e1;
        font-size: 12px;
        font-weight: 700;
      }

      .users-role-modal select {
        width: 100%;
      }

      .users-modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 9px;
        margin-top: 20px;
      }

      .users-modal-actions button {
        padding: 9px 14px;
        color: white;
        font-weight: 700;
        cursor: pointer;
        border: 0;
        border-radius: 9px;
      }

      .users-modal-actions .cancel {
        background: #475569;
      }

      .users-modal-actions .save {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
      }

      .users-modal-actions button:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .users-loading-overlay {
        position: fixed;
        z-index: 10000;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        background: rgba(2, 6, 23, 0.7);
      }

      @media (max-width: 700px) {
        .users-page {
          padding: 20px 14px;
        }

        .users-summary {
          grid-template-columns: 1fr;
        }

        .users-details-grid {
          grid-template-columns: 1fr;
        }

        .users-refresh-button {
          width: 100%;
        }
      }
    `}</style>
  );
}

export default Users;