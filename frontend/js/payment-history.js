const paymentHistoryGrid = document.getElementById("paymentHistoryGrid");
const paymentHistoryMessage = document.getElementById("paymentHistoryMessage");
const paymentSearchInput = document.getElementById("paymentSearchInput");
const paymentStatusFilter = document.getElementById("paymentStatusFilter");

let allPayments = [];

function getPaymentStatusClass(status) {
  if (status === "COMPLETED") return "completed";
  if (status === "REFUND_PENDING") return "refund_pending";
  if (status === "REFUNDED") return "refunded";
  return "pending";
}

function renderPayments(payments) {
  paymentHistoryGrid.innerHTML = "";

  if (!payments.length) {
    paymentHistoryGrid.innerHTML = `<div class="movie-empty">No payments found.</div>`;
    return;
  }

  payments.forEach(payment => {
    paymentHistoryGrid.innerHTML += `
      <div class="bp-history-card">
        <div class="bp-history-title">${payment.movieTitle || "Movie Payment"}</div>
        <div class="bp-mini">Payment ID: #${payment.id}</div>
        <div class="bp-mini">Booking ID: #${payment.bookingId}</div>
        <div class="bp-mini">Method: ${payment.paymentMethod || "-"}</div>
        <div class="bp-mini">Date: ${payment.createdAt ? payment.createdAt.replace("T", " ") : "-"}</div>
        <div class="bp-mini">Amount: Rs ${(payment.amount || 0).toFixed(2)}</div>
        <div style="margin-top:10px;">
          <span class="bp-status ${getPaymentStatusClass(payment.status)}">${(payment.status || "").replaceAll("_", " ")}</span>
        </div>
      </div>
    `;
  });
}

function applyPaymentFilters() {
  const keyword = paymentSearchInput.value.trim().toLowerCase();
  const status = paymentStatusFilter.value;

  const filtered = allPayments.filter(payment => {
    const matchKeyword =
      !keyword ||
      String(payment.id).includes(keyword) ||
      payment.movieTitle?.toLowerCase().includes(keyword);

    const matchStatus = !status || payment.status === status;
    return matchKeyword && matchStatus;
  });

  renderPayments(filtered);
}

async function loadPaymentHistory() {
  const loggedUser = getLoggedInUser();
  if (!loggedUser || loggedUser.admin) {
    window.location.href = "../user/login.html";
    return;
  }

  try {
    const response = await fetch(`${PAYMENT_API}/user/${loggedUser.id}`);
    if (!response.ok) throw new Error("Failed to load payment history");

    allPayments = await response.json();
    renderPayments(allPayments);

    paymentHistoryMessage.className = "message success";
    paymentHistoryMessage.innerText = "Payment history loaded successfully";
  } catch (error) {
    paymentHistoryMessage.className = "message error";
    paymentHistoryMessage.innerText = error.message;
  }
}

paymentSearchInput.addEventListener("input", applyPaymentFilters);
paymentStatusFilter.addEventListener("change", applyPaymentFilters);

window.addEventListener("load", loadPaymentHistory);