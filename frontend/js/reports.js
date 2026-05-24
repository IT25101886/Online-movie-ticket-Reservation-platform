const loadReportsBtn = document.getElementById("loadReportsBtn");
const reportsBody = document.getElementById("reportsBody");
const reportsMessage = document.getElementById("message");

async function loadReports() {
  const loggedUser = getLoggedInUser();

  if (!loggedUser || !loggedUser.isAdmin || loggedUser.adminPermission !== "ADMIN_MANAGER") {
    reportsMessage.className = "message error";
    reportsMessage.innerText = "Only ADMIN_MANAGER can view reports.";
    return;
  }

  try {
    const response = await fetch(`${ADMIN_API}/reports?performedByAdminId=${loggedUser.id}`);

    if (!response.ok) throw new Error("Failed to load reports");

    const report = await response.json();

    reportsBody.innerHTML = `
      <tr><th>Total Users</th><td>${report.totalUsers}</td></tr>
      <tr><th>Total Admins</th><td>${report.totalAdmins}</td></tr>
      <tr><th>Total Regular Users</th><td>${report.totalRegularUsers}</td></tr>
      <tr><th>Total Premium Users</th><td>${report.totalPremiumUsers}</td></tr>
      <tr><th>User Managers</th><td>${report.userManagers}</td></tr>
      <tr><th>Movie Managers</th><td>${report.movieManagers}</td></tr>
      <tr><th>Ticket Managers</th><td>${report.ticketManagers}</td></tr>
      <tr><th>Payment Managers</th><td>${report.paymentManagers}</td></tr>
      <tr><th>Review Managers</th><td>${report.reviewManagers}</td></tr>
      <tr><th>Admin Managers</th><td>${report.adminManagers}</td></tr>
    `;

    reportsMessage.className = "message success";
    reportsMessage.innerText = "Reports loaded successfully";
  } catch (error) {
    reportsMessage.className = "message error";
    reportsMessage.innerText = error.message;
  }
}

loadReportsBtn.addEventListener("click", loadReports);
window.addEventListener("load", loadReports);