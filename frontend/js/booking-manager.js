const adminBookingTableBody = document.getElementById("adminBookingTableBody");
const adminBookingMessage = document.getElementById("adminBookingMessage");
const adminBookingSearch = document.getElementById("adminBookingSearch");
const adminBookingStatusFilter = document.getElementById("adminBookingStatusFilter");
const clearAllBookingsBtn = document.getElementById("clearAllBookingsBtn");

const adminBookingModal = document.getElementById("adminBookingModal");
const adminBookingModalBody = document.getElementById("adminBookingModalBody");
const closeAdminBookingBtn = document.getElementById("closeAdminBookingBtn");
const closeAdminBookingOverlay = document.getElementById("closeAdminBookingOverlay");

let allAdminBookings = [];

function canManageBookings() {
  const user = getLoggedInUser();
  return user && user.admin && (user.adminPermission === "TICKET_MANAGER" || user.adminPermission === "ADMIN_MANAGER");
}

function statusClass(status) {
  if (status === "CONFIRMED") return "confirmed";
  if (status === "CANCELED") return "canceled";
  return "pending";
}

function paymentClass(status) {
  const value = (status || "").toUpperCase();
  if (value === "COMPLETED") return "completed";
  if (value === "REFUND_PENDING") return "refund_pending";
  if (value === "REFUNDED") return "refunded";
  return "pending";
}

function updateStats(bookings) {
  document.getElementById("totalBookingsStat").innerText = bookings.length;
  document.getElementById("confirmedBookingsStat").innerText = bookings.filter(item => item.status === "CONFIRMED").length;
  document.getElementById("pendingBookingsStat").innerText = bookings.filter(item => item.status === "PENDING_PAYMENT").length;
  document.getElementById("canceledBookingsStat").innerText = bookings.filter(item => item.status === "CANCELED").length;
}

function renderAdminBookings(bookings) {
  adminBookingTableBody.innerHTML = "";
  updateStats(bookings);

  if (!bookings.length) {
    adminBookingTableBody.innerHTML = `<tr><td colspan="10">No bookings found</td></tr>`;
    return;
  }

  bookings.forEach(booking => {
    adminBookingTableBody.innerHTML += `
      <tr>
        <td>#${booking.id}</td>
        <td>${booking.userId || "-"}</td>
        <td>${booking.movieTitle || "-"}</td>
        <td>${booking.showDate || "-"}</td>
        <td>${booking.showTime || "-"}</td>
        <td>${(booking.selectedSeats || []).join(", ")}</td>
        <td><span class="bp-status ${statusClass(booking.status)}">${booking.status.replaceAll("_", " ")}</span></td>
        <td><span class="bp-status ${paymentClass(booking.paymentStatusText)}">${(booking.paymentStatusText || "").replaceAll("_", " ")}</span></td>
        <td>Rs ${(booking.totalAmount || 0).toFixed(2)}</td>
        <td>
          <div class="bp-history-actions">
            <button type="button" onclick="viewAdminBooking(${booking.id})">View</button>
            <button type="button" class="danger-btn" onclick="clearAdminBooking(${booking.id})">Clear</button>
          </div>
        </td>
      </tr>
    `;
  });
}

function applyAdminBookingFilters() {
  const keyword = adminBookingSearch.value.trim().toLowerCase();
  const status = adminBookingStatusFilter.value;

  const filtered = allAdminBookings.filter(booking => {
    const matchKeyword =
      !keyword ||
      String(booking.id).includes(keyword) ||
      String(booking.userId).includes(keyword) ||
      booking.movieTitle?.toLowerCase().includes(keyword);

    const matchStatus = !status || booking.status === status;
    return matchKeyword && matchStatus;
  });

  renderAdminBookings(filtered);
}

function openAdminBookingModal() {
  adminBookingModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeAdminBookingModal() {
  adminBookingModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

async function loadAdminBookings() {
  const loggedUser = getLoggedInUser();
  if (!canManageBookings()) {
    adminBookingMessage.className = "message error";
    adminBookingMessage.innerText = "Only booking manager can view this page.";
    return;
  }

  try {
    const response = await fetch(`${BOOKING_API}/admin/all?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Failed to load bookings");

    allAdminBookings = await response.json();
    renderAdminBookings(allAdminBookings);

    adminBookingMessage.className = "message success";
    adminBookingMessage.innerText = "All bookings loaded successfully";
  } catch (error) {
    adminBookingMessage.className = "message error";
    adminBookingMessage.innerText = error.message;
  }
}

async function viewAdminBooking(bookingId) {
  const loggedUser = getLoggedInUser();

  try {
    const response = await fetch(`${BOOKING_API}/${bookingId}?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Booking not found");

    const booking = await response.json();

    adminBookingModalBody.innerHTML = `
      <div class="bp-summary-box">
        <div class="bp-summary-line"><span>Booking ID</span><span>#${booking.id}</span></div>
        <div class="bp-summary-line"><span>User ID</span><span>${booking.userId}</span></div>
        <div class="bp-summary-line"><span>Movie</span><span>${booking.movieTitle || "-"}</span></div>
        <div class="bp-summary-line"><span>Contact Name</span><span>${booking.contactName || "-"}</span></div>
        <div class="bp-summary-line"><span>Email</span><span>${booking.contactEmail || "-"}</span></div>
        <div class="bp-summary-line"><span>Mobile</span><span>${booking.contactMobile || "-"}</span></div>
        <div class="bp-summary-line"><span>Date</span><span>${booking.showDate || "-"}</span></div>
        <div class="bp-summary-line"><span>Time</span><span>${booking.showTime || "-"}</span></div>
        <div class="bp-summary-line"><span>Seats</span><span>${(booking.selectedSeats || []).join(", ")}</span></div>
        <div class="bp-summary-line"><span>Booking Status</span><span>${(booking.status || "").replaceAll("_", " ")}</span></div>
        <div class="bp-summary-line"><span>Payment Status</span><span>${(booking.paymentStatusText || "").replaceAll("_", " ")}</span></div>
        <div class="bp-summary-line"><span>Total</span><span>Rs ${(booking.totalAmount || 0).toFixed(2)}</span></div>
      </div>
    `;

    openAdminBookingModal();
  } catch (error) {
    adminBookingMessage.className = "message error";
    adminBookingMessage.innerText = error.message;
  }
}

async function clearAdminBooking(bookingId) {
  const loggedUser = getLoggedInUser();
  const ok = confirm("Clear this booking history item?");
  if (!ok) return;

  try {
    const response = await fetch(`${BOOKING_API}/admin/history/${bookingId}?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to clear booking");
    }

    adminBookingMessage.className = "message success";
    adminBookingMessage.innerText = "Booking history item cleared";
    loadAdminBookings();
  } catch (error) {
    adminBookingMessage.className = "message error";
    adminBookingMessage.innerText = error.message;
  }
}

clearAllBookingsBtn.addEventListener("click", async function () {
  const loggedUser = getLoggedInUser();
  const ok = confirm("Clear all booking history?");
  if (!ok) return;

  try {
    const response = await fetch(`${BOOKING_API}/admin/history?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to clear all booking history");
    }

    adminBookingMessage.className = "message success";
    adminBookingMessage.innerText = "All booking history cleared";
    loadAdminBookings();
  } catch (error) {
    adminBookingMessage.className = "message error";
    adminBookingMessage.innerText = error.message;
  }
});

adminBookingSearch.addEventListener("input", applyAdminBookingFilters);
adminBookingStatusFilter.addEventListener("change", applyAdminBookingFilters);

closeAdminBookingBtn.addEventListener("click", closeAdminBookingModal);
closeAdminBookingOverlay.addEventListener("click", closeAdminBookingModal);

window.viewAdminBooking = viewAdminBooking;
window.clearAdminBooking = clearAdminBooking;

window.addEventListener("load", loadAdminBookings);