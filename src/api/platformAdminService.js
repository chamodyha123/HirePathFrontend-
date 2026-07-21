import api from "./axios";

const unwrapList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.$values)) {
    return data.$values;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.data?.$values)) {
    return data.data.$values;
  }

  return [];
};

const normalizeCompany = (company = {}) => ({
  ...company,

  id:
    company.id ??
    company.companyId ??
    company.registrationId ??
    null,

  companyName:
    company.companyName ??
    company.name ??
    company.businessName ??
    "",

  status:
    company.status ??
    company.registrationStatus ??
    "",

  email:
    company.email ??
    company.contactEmail ??
    company.companyEmail ??
    "",

  phoneNumber:
    company.phoneNumber ??
    company.phone ??
    company.contactNumber ??
    "",

  address:
    company.address ??
    company.companyAddress ??
    "",
});

const normalizeRegistration = (registration = {}) => ({
  ...registration,

  id:
    registration.id ??
    registration.registrationId ??
    registration.companyRegistrationId ??
    null,

  registrationId:
    registration.registrationId ??
    registration.companyRegistrationId ??
    registration.id ??
    null,

  companyName:
    registration.companyName ??
    registration.name ??
    registration.businessName ??
    "",

  contactName:
    registration.contactName ??
    registration.representativeName ??
    registration.adminName ??
    "",

  email:
    registration.email ??
    registration.contactEmail ??
    registration.companyEmail ??
    "",

  phoneNumber:
    registration.phoneNumber ??
    registration.phone ??
    registration.contactNumber ??
    "",

  status:
    registration.status ??
    registration.registrationStatus ??
    "Pending",

  submittedAt:
    registration.submittedAt ??
    registration.createdAt ??
    registration.requestedAt ??
    null,
});

const normalizeUser = (user = {}) => {
  const roleValues = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(user.Roles)
      ? user.Roles
      : Array.isArray(user.roles?.$values)
        ? user.roles.$values
        : Array.isArray(user.Roles?.$values)
          ? user.Roles.$values
          : user.role || user.Role
            ? [user.role ?? user.Role]
            : [];

  const status =
    user.status ??
    user.Status ??
    user.accountStatus ??
    user.AccountStatus ??
    "";

  const normalizedStatus =
    String(status).toLowerCase() === "suspended"
      ? "Suspended"
      : "Active";

  return {
    ...user,

    id:
      user.id ??
      user.Id ??
      user.userId ??
      user.UserId ??
      null,

    fullName:
      user.fullName ??
      user.FullName ??
      user.name ??
      user.Name ??
      user.userName ??
      user.UserName ??
      "",

    userName:
      user.userName ??
      user.UserName ??
      user.username ??
      user.Username ??
      "",

    email:
      user.email ??
      user.Email ??
      "",

    phoneNumber:
      user.phoneNumber ??
      user.PhoneNumber ??
      "",

    emailConfirmed:
      user.emailConfirmed ??
      user.EmailConfirmed ??
      false,

    roles: roleValues,

    role:
      user.role ??
      user.Role ??
      roleValues[0] ??
      "Unassigned",

    status: normalizedStatus,

    isActive:
      normalizedStatus === "Active",

    isSuspended:
      normalizedStatus === "Suspended",
  };
};

const getErrorMessage = (error) => {
  if (!error?.response) {
    return "Cannot connect to the backend server.";
  }

  return (
    error.response?.data?.message ||
    error.response?.data?.title ||
    error.response?.data?.error ||
    "The request could not be completed."
  );
};

const platformAdminService = {
  // ==================================================
  // DASHBOARD
  // ==================================================

  getDashboardStats: async () => {
    const response = await api.get(
      "/platform-admin/dashboard"
    );

    return response.data;
  },

  getRecentActivity: async () => {
    try {
      const response = await api.get(
        "/platform-admin/activity"
      );

      return unwrapList(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }

      throw error;
    }
  },

  // ==================================================
  // COMPANIES
  // ==================================================

  getAllCompanies: async () => {
    const response = await api.get(
      "/platform-admin/companies"
    );

    return unwrapList(response.data).map(
      normalizeCompany
    );
  },

  getPendingCompanies: async () => {
    const response = await api.get(
      "/platform-admin/companies/pending"
    );

    return unwrapList(response.data).map(
      normalizeCompany
    );
  },

  getCompanyById: async (companyId) => {
    if (!companyId) {
      throw new Error("Company ID is required.");
    }

    const response = await api.get(
      `/platform-admin/companies/${companyId}`
    );

    return normalizeCompany(response.data);
  },

  requestCompanyInformation: async (
    companyId,
    message
  ) => {
    if (!companyId) {
      throw new Error("Company ID is required.");
    }

    if (!message?.trim()) {
      throw new Error(
        "Information request message is required."
      );
    }

    const response = await api.put(
      `/platform-admin/companies/${companyId}/request-information`,
      {
        message: message.trim(),
      }
    );

    return response.data;
  },

  suspendCompany: async (companyId) => {
    if (!companyId) {
      throw new Error("Company ID is required.");
    }

    const response = await api.put(
      `/platform-admin/companies/${companyId}/suspend`
    );

    return response.data;
  },

  activateCompany: async (companyId) => {
    if (!companyId) {
      throw new Error("Company ID is required.");
    }

    const response = await api.put(
      `/platform-admin/companies/${companyId}/activate`
    );

    return response.data;
  },

  // ==================================================
  // COMPANY REGISTRATION REQUESTS
  // ==================================================

  getRegistrationRequests: async (
    status = null
  ) => {
    const response = await api.get(
      "/platform-admin/companies/registrations",
      {
        params: status
          ? {
              status,
            }
          : undefined,
      }
    );

    return unwrapList(response.data).map(
      normalizeRegistration
    );
  },

  getPendingRegistrationRequests: async () => {
    const response = await api.get(
      "/platform-admin/companies/registrations",
      {
        params: {
          status: "Pending",
        },
      }
    );

    return unwrapList(response.data).map(
      normalizeRegistration
    );
  },

  approveRegistration: async (
    registrationId,
    note = null
  ) => {
    if (!registrationId) {
      throw new Error(
        "Registration ID is required."
      );
    }

    const response = await api.put(
      `/platform-admin/companies/registrations/${registrationId}/approve`,
      {
        note: note?.trim() || null,
      }
    );

    return response.data;
  },

  rejectRegistration: async (
    registrationId,
    note
  ) => {
    if (!registrationId) {
      throw new Error(
        "Registration ID is required."
      );
    }

    if (!note?.trim()) {
      throw new Error(
        "Rejection reason is required."
      );
    }

    const response = await api.put(
      `/platform-admin/companies/registrations/${registrationId}/reject`,
      {
        note: note.trim(),
      }
    );

    return response.data;
  },

  // Backward-compatible aliases.
  approveCompany: async (
    registrationId,
    adminNotes = null
  ) => {
    return platformAdminService.approveRegistration(
      registrationId,
      adminNotes
    );
  },

  rejectCompany: async (
    registrationId,
    rejectionReason
  ) => {
    return platformAdminService.rejectRegistration(
      registrationId,
      rejectionReason
    );
  },

  // ==================================================
  // USERS
  // ==================================================

  getAllUsers: async () => {
    const response = await api.get(
      "/platform-admin/users"
    );

    return unwrapList(response.data).map(
      normalizeUser
    );
  },

  getUserById: async (userId) => {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await api.get(
      `/platform-admin/users/${userId}`
    );

    return normalizeUser(response.data);
  },

  suspendUser: async (userId) => {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await api.put(
      `/platform-admin/users/${userId}/suspend`
    );

    return response.data;
  },

  activateUser: async (userId) => {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await api.put(
      `/platform-admin/users/${userId}/activate`
    );

    return response.data;
  },

  changeUserRole: async (
    userId,
    role
  ) => {
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!role?.trim()) {
      throw new Error("User role is required.");
    }

    const response = await api.put(
      `/platform-admin/users/${userId}/role`,
      {
        role: role.trim(),
      }
    );

    return response.data;
  },

  // ==================================================
  // ANALYTICS
  // ==================================================

getAnalyticsData: async () => {
  try {
    const response = await api.get(
      "/platform-admin/analytics"
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    throw error;
  }
},
  // ==================================================
  // HELPERS
  // ==================================================

  getErrorMessage,
};

export default platformAdminService;