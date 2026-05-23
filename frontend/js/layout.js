function getLoggedInUser() {
  return JSON.parse(localStorage.getItem("loggedInUser"));
}

function formatRole(user) {
  if (!user) return "Guest";

  if (user.admin) {
    return (user.adminPermission || "ADMIN").replaceAll("_", " ");
  }

  if (user.role) {
    return user.role.replaceAll("_", " ");
  }

  return "User";
}

function getDashboardPath(user) {
  const root = document.body.dataset.root || ".";

  if (!user || !user.admin) {
    return `${root}/pages/user/profile.html`;
  }

  switch (user.adminPermission) {
    case "ADMIN_MANAGER":
      return `${root}/pages/admin/admin-manager-dashboard.html`;
    case "USER_MANAGER":
      return `${root}/pages/admin/user-manager-dashboard.html`;
    case "MOVIE_MANAGER":
      return `${root}/pages/admin/movie-manager-dashboard.html`;
    case "TICKET_MANAGER":
      return `${root}/pages/admin/ticket-manager-dashboard.html`;
    case "PAYMENT_MANAGER":
      return `${root}/pages/admin/payment-manager-dashboard.html`;
    case "REVIEW_MANAGER":
      return `${root}/pages/admin/review-manager-dashboard.html`;
    default:
      return `${root}/pages/user/profile.html`;
  }
}

function getAdminSidebarLinks(user) {
  const root = document.body.dataset.root || ".";
  if (!user || !user.admin) return [];

  switch (user.adminPermission) {
    case "ADMIN_MANAGER":
      return [
        { label: "Dashboard", href: `${root}/pages/admin/admin-manager-dashboard.html` },
        { label: "Add Admin", href: `${root}/pages/admin/add-admin.html` },
        { label: "Admin List", href: `${root}/pages/admin/admin-list.html` },
        { label: "Update Admin", href: `${root}/pages/admin/update-admin.html` },
        { label: "Permission", href: `${root}/pages/admin/permission-control.html` },
        { label: "Reports", href: `${root}/pages/admin/reports.html` }
      ];
    case "USER_MANAGER":
      return [
        { label: "Dashboard", href: `${root}/pages/admin/user-manager-dashboard.html` },
        { label: "User List", href: `${root}/pages/user/user-list.html` }
      ];
    case "MOVIE_MANAGER":
      return [
        { label: "Dashboard", href: `${root}/pages/admin/movie-manager-dashboard.html` }
      ];
    case "TICKET_MANAGER":
      return [
        { label: "Dashboard", href: `${root}/pages/admin/ticket-manager-dashboard.html` }
      ];
    case "PAYMENT_MANAGER":
      return [
        { label: "Dashboard", href: `${root}/pages/admin/payment-manager-dashboard.html` }
      ];
    case "REVIEW_MANAGER":
      return [
        { label: "Dashboard", href: `${root}/pages/admin/review-manager-dashboard.html` }
      ];
    default:
      return [
        { label: "Dashboard", href: getDashboardPath(user) }
      ];
  }
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  window.location.href = `${document.body.dataset.root}/pages/user/login.html`;
}

function renderHeader() {
  const root = document.body.dataset.root || ".";
  const user = getLoggedInUser();
  const header = document.getElementById("siteHeader");
  if (!header) return;

  let navLinks = `<a href="${root}/index.html">Home</a>`;

  if (!user) {
    navLinks += `
      <a href="${root}/pages/user/register.html">Register</a>
      <a href="${root}/pages/user/login.html">Login</a>
    `;
  } else if (user.admin) {
    navLinks += `
      <a href="${getDashboardPath(user)}">Dashboard</a>
      <a href="#" id="logoutLink">Logout</a>
    `;
  } else {
    navLinks += `
      <a href="${root}/pages/user/profile.html">Profile</a>
      <a href="#" id="logoutLink">Logout</a>
    `;
  }

  const profileImageHtml = user && user.profileImage
    ? `<img src="${user.profileImage}" alt="Profile" class="header-profile-image">`
    : `<div class="header-profile-placeholder">${user ? user.fullName.charAt(0).toUpperCase() : "G"}</div>`;

  header.innerHTML = `
    <header class="site-header">
      <div class="header-left">
        <div class="brand">
          <a href="${root}/index.html">Movie Ticket Platform</a>
        </div>
      </div>

      <div class="header-right">
        <nav class="nav-links header-nav">
          ${navLinks}
        </nav>

        ${user ? `
          <div class="logged-user-box horizontal-user-box">
            ${profileImageHtml}
            <div class="logged-user-text">
              <div><b>${user.fullName}</b></div>
              <div class="logged-role">${formatRole(user)}</div>
            </div>
          </div>
        ` : ``}
      </div>
    </header>
  `;
}

function renderSidebar() {
  const sidebar = document.getElementById("siteSidebar");
  const user = getLoggedInUser();

  if (!sidebar) return;

  if (!user || !user.admin) {
    sidebar.innerHTML = "";
    sidebar.style.display = "none";
    return;
  }

  const links = getAdminSidebarLinks(user);
  const collapsed = localStorage.getItem("adminSidebarCollapsed") === "true";
  const currentPath = window.location.pathname;

  sidebar.style.display = "block";
  sidebar.className = collapsed ? "admin-sidebar collapsed" : "admin-sidebar";

  sidebar.innerHTML = `
    <div class="sidebar-inner">
      <div class="sidebar-top">
        <div class="sidebar-title">${formatRole(user)}</div>
        <button id="sidebarToggleBtn" class="sidebar-toggle-btn" type="button">☰</button>
      </div>

      <div class="sidebar-links">
        ${links.map(link => `
          <a href="${link.href}" class="sidebar-link ${currentPath.includes(link.href.split("/pages/")[1]) ? "active" : ""}">
            <span class="sidebar-icon-dot"></span>
            <span class="sidebar-link-text">${link.label}</span>
          </a>
        `).join("")}
      </div>
    </div>
  `;
}

function renderFooter() {
  const root = document.body.dataset.root || ".";
  const user = getLoggedInUser();
  const footer = document.getElementById("siteFooter");
  if (!footer) return;

  let footerLinks = `<a href="${root}/index.html">Home</a>`;

  if (!user) {
    footerLinks += `
      <a href="${root}/pages/user/register.html">Register</a>
      <a href="${root}/pages/user/login.html">Login</a>
    `;
  } else if (user.admin) {
    footerLinks += `
      <a href="${getDashboardPath(user)}">Dashboard</a>
    `;
  } else {
    footerLinks += `
      <a href="${root}/pages/user/profile.html">Profile</a>
    `;
  }

  footer.innerHTML = `
    <footer class="site-footer">
      <div class="footer-shell">
        <div class="footer-top">
          <div class="footer-brand">
            <h3>Movie Ticket Platform</h3>
            <p>Red and black cinema styled booking and management system.</p>
          </div>

          <div class="footer-nav">
            ${footerLinks}
          </div>
        </div>

        <div class="footer-bottom">
          © 2026 Movie Ticket Platform. All rights reserved.
        </div>
      </div>
    </footer>
  `;
}

function bindEvents() {
  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      logoutUser();
    });
  }

  const sidebarToggleBtn = document.getElementById("sidebarToggleBtn");
  const siteSidebar = document.getElementById("siteSidebar");

  if (sidebarToggleBtn && siteSidebar) {
    sidebarToggleBtn.addEventListener("click", function () {
      const isCollapsed = siteSidebar.classList.toggle("collapsed");
      localStorage.setItem("adminSidebarCollapsed", isCollapsed ? "true" : "false");
    });
  }
}

function renderLayout() {
  renderHeader();
  renderSidebar();
  renderFooter();
  bindEvents();
}

window.addEventListener("DOMContentLoaded", renderLayout);