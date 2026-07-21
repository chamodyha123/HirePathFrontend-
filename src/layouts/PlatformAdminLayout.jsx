import { Outlet } from "react-router-dom";
import PlatformAdminSidebar from "../components/platform-admin/PlatformAdminSidebar";

function getAdminName() {
  const userJson = localStorage.getItem("user");

  if (!userJson) {
    return "System Admin";
  }

  try {
    const user = JSON.parse(userJson);

    return (
      user?.fullName ||
      user?.name ||
      user?.userName ||
      user?.username ||
      user?.email ||
      "System Admin"
    );
  } catch (error) {
    console.error("Unable to read logged-in admin details:", error);
    return "System Admin";
  }
}

function PlatformAdminLayout() {
  const adminName = getAdminName();

  return (
    <div
      className="dashboard-container auth-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "stretch",
        padding: 0,
      }}
    >
      <PlatformAdminSidebar />

      <main
        className="content-area"
        style={{
          flex: 1,
          minWidth: 0,
          padding: "40px",
          overflowY: "auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "32px",
            paddingBottom: "20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "var(--white)",
                fontSize: "26px",
                fontWeight: 700,
                letterSpacing: "-0.5px",
              }}
            >
              🛡️ Platform Infrastructure Control
            </h2>

            <p
              style={{
                margin: "4px 0 0",
                color: "var(--muted)",
                fontSize: "14px",
              }}
            >
              HirePath Core Systems Administration
            </p>
          </div>

          <div
            style={{
              maxWidth: "360px",
              padding: "10px 20px",
              overflow: "hidden",
              color: "var(--cyan)",
              fontSize: "14px",
              fontWeight: 800,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              background: "var(--glass)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
            }}
            title={adminName}
          >
            ⚡ Authorized Account: {adminName}
          </div>
        </header>

        <section style={{ width: "100%" }}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default PlatformAdminLayout;