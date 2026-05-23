const adminPaymentTableBody = document.getElementById("adminPaymentTableBody");
const adminPaymentMessage = document.getElementById("adminPaymentMessage");
const adminPaymentSearch = document.getElementById("adminPaymentSearch");
const adminPaymentStatusFilter = document.getElementById("adminPaymentStatusFilter");
const clearAllPaymentsBtn = document.getElementById("clearAllPaymentsBtn");

const adminPaymentModal = document.getElementById("adminPaymentModal");
const adminPaymentModalBody = document.getElementById("adminPaymentModalBody");
const closeAdminPaymentBtn = document.getElementById("closeAdminPaymentBtn");
const closeAdminPaymentOverlay = document.getElementById("closeAdminPaymentOverlay");

let allAdminPayments = [];

function canManagePayments() {
  const user = getLoggedInUser();
  return user && user.admin && (user.adminPermission === "PAYMENT_MANAGER" || user.adminPermission === "ADMIN_MANAGER");
}

function paymentStatusClass(status) {
  const value = (status || "").toUpperCase();
  if (value === "COMPLETED") return "completed";
  if (value === "REFUND_PENDING") return "refund_pending";
  if (value === "REFUNDED") return "refunded";
  return "pending";
}

function updatePaymentStats(payments) {
  const totalRevenue = payments
    .filter(item => item.status === "COMPLETED")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  document.getElementById("totalRevenueStat").innerText = `Rs ${totalRevenue.toFixed(2)}`;
  document.getElementById("totalPaymentsStat").innerText = payments.length;
  document.getElementById("refundPendingStat").innerText = payments.filter(item => item.status === "REFUND_PENDING").length;
  document.getElementById("refundedStat").innerText = payments.filter(item => item.status === "REFUNDED").length;
}

function renderAdminPayments(payments) {
  adminPaymentTableBody.innerHTML = "";
  updatePaymentStats(payments);

  if (!payments.length) {
    adminPaymentTableBody.innerHTML = `<tr><td colspan="9">No payments found</td></tr>`;
    return;
  }

  payments.forEach(payment => {
    adminPaymentTableBody.innerHTML += `
      <tr>
        <td>#${payment.id}</td>
        <td>#${payment.bookingId || "-"}</td>
        <td>${payment.userId || "-"}</td>
        <td>${payment.movieTitle || "-"}</td>
        <td>Rs ${(payment.amount || 0).toFixed(2)}</td>
        <td>${payment.paymentMethod || "-"}</td>
        <td><span class="bp-status ${paymentStatusClass(payment.status)}">${(payment.status || "").replaceAll("_", " ")}</span></td>
        <td>${(payment.bookingStatus || "-").replaceAll("_", " ")}</td>
        <td>
          <div class="bp-history-actions">
            <button type="button" onclick="viewAdminPayment(${payment.id})">View</button>
            ${payment.status === "REFUND_PENDING" ? `<button type="button" class="secondary-btn" onclick="markRefunded(${payment.id})">Mark Refunded</button>` : ``}
            <button type="button" class="danger-btn" onclick="clearAdminPayment(${payment.id})">Clear</button>
          </div>
        </td>
      </tr>
    `;
  });
}

function applyAdminPaymentFilters() {
  const keyword = adminPaymentSearch.value.trim().toLowerCase();
  const status = adminPaymentStatusFilter.value;

  const filtered = allAdminPayments.filter(payment => {
    const matchKeyword =
      !keyword ||
      String(payment.id).includes(keyword) ||
      String(payment.bookingId).includes(keyword) ||
      String(payment.userId).includes(keyword) ||
      payment.movieTitle?.toLowerCase().includes(keyword);

    const matchStatus = !status || payment.status === status;
    return matchKeyword && matchStatus;
  });

  renderAdminPayments(filtered);
}

function openAdminPaymentModal() {
  adminPaymentModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeAdminPaymentModal() {
  adminPaymentModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function loadAdminPayments() {
  const loggedUser = getLoggedInUser();
  if (!canManagePayments()) {
    adminPaymentMessage.className = "message error";
    adminPaymentMessage.innerText = "Only payment manager can view this page.";
    return;
  }

  try {
    const response = await fetch(`${PAYMENT_API}/admin/all?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Failed to load payments");

    allAdminPayments = await response.json();
    renderAdminPayments(allAdminPayments);

    adminPaymentMessage.className = "message success";
    adminPaymentMessage.innerText = "All payments loaded successfully";
  } catch (error) {
    adminPaymentMessage.className = "message error";
    adminPaymentMessage.innerText = error.message;
  }
}

async function viewAdminPayment(paymentId) {
  const loggedUser = getLoggedInUser();

  try {
    const response = await fetch(`${PAYMENT_API}/${paymentId}?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Payment not found");

    const payment = await response.json();

    adminPaymentModalBody.innerHTML = `
      <div class="bp-summary-box">
        <div class="bp-summary-line"><span>Payment ID</span><span>#${payment.id}</span></div>
        <div class="bp-summary-line"><span>Booking ID</span><span>#${payment.bookingId || "-"}</span></div>
        <div class="bp-summary-line"><span>User ID</span><span>${payment.userId || "-"}</span></div>
        <div class="bp-summary-line"><span>Movie</span><span>${payment.movieTitle || "-"}</span></div>
        <div class="bp-summary-line"><span>Amount</span><span>Rs ${(payment.amount || 0).toFixed(2)}</span></div>
        <div class="bp-summary-line"><span>Method</span><span>${payment.paymentMethod || "-"}</span></div>
        <div class="bp-summary-line"><span>Status</span><span>${(payment.status || "").replaceAll("_", " ")}</span></div>
        <div class="bp-summary-line"><span>Booking Status</span><span>${(payment.bookingStatus || "").replaceAll("_", " ")}</span></div>
        <div class="bp-summary-line"><span>Date</span><span>${payment.createdAt ? payment.createdAt.replace("T", " ") : "-"}</span></div>
      </div>
    `;

    openAdminPaymentModal();
  } catch (error) {
    adminPaymentMessage.className = "message error";
    adminPaymentMessage.innerText = error.message;
  }
}

async function markRefunded(paymentId) {
  const loggedUser = getLoggedInUser();

  try {
    const response = await fetch(`${PAYMENT_API}/${paymentId}/status?performedByAdminId=${loggedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "REFUNDED" })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update refund status");
    }

    adminPaymentMessage.className = "message success";
    adminPaymentMessage.innerText = "Refund status updated to REFUNDED";
    loadAdminPayments();
  } catch (error) {
    adminPaymentMessage.className = "message error";
    adminPaymentMessage.innerText = error.message;
  }
}

async function clearAdminPayment(paymentId) {
  const loggedUser = getLoggedInUser();
  const ok = confirm("Clear this payment history item?");
  if (!ok) return;

  try {
    const response = await fetch(`${PAYMENT_API}/admin/history/${paymentId}?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to clear payment");
    }

    adminPaymentMessage.className = "message success";
    adminPaymentMessage.innerText = "Payment history item cleared";
    loadAdminPayments();
  } catch (error) {
    adminPaymentMessage.className = "message error";
    adminPaymentMessage.innerText = error.message;
  }
}

clearAllPaymentsBtn.addEventListener("click", async function () {
  const loggedUser = getLoggedInUser();
  const ok = confirm("Clear all payment history?");
  if (!ok) return;

  try {
    const response = await fetch(`${PAYMENT_API}/admin/history?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to clear all payment history");
    }

    adminPaymentMessage.className = "message success";
    adminPaymentMessage.innerText = "All payment history cleared";
    loadAdminPayments();
  } catch (error) {
    adminPaymentMessage.className = "message error";
    adminPaymentMessage.innerText = error.message;
  }
});

adminPaymentSearch.addEventListener("input", applyAdminPaymentFilters);
adminPaymentStatusFilter.addEventListener("change", applyAdminPaymentFilters);

closeAdminPaymentBtn.addEventListener("click", closeAdminPaymentModal);
closeAdminPaymentOverlay.addEventListener("click", closeAdminPaymentModal);

window.viewAdminPayment = viewAdminPayment;
window.markRefunded = markRefunded;
window.clearAdminPayment = clearAdminPayment;

window.addEventListener("load", loadAdminPayments);