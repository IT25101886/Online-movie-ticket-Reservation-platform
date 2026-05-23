const bookingHistoryGrid = document.getElementById("bookingHistoryGrid");
const bookingHistoryMessage = document.getElementById("bookingHistoryMessage");
const bookingSearchInput = document.getElementById("bookingSearchInput");
const bookingStatusFilter = document.getElementById("bookingStatusFilter");

const bookingViewModal = document.getElementById("bookingViewModal");
const bookingViewBody = document.getElementById("bookingViewBody");
const closeBookingViewBtn = document.getElementById("closeBookingViewBtn");
const closeBookingViewOverlay = document.getElementById("closeBookingViewOverlay");

const bookingEditModal = document.getElementById("bookingEditModal");
const closeBookingEditBtn = document.getElementById("closeBookingEditBtn");
const closeBookingEditOverlay = document.getElementById("closeBookingEditOverlay");
const cancelEditBookingBtn = document.getElementById("cancelEditBookingBtn");
const editBookingForm = document.getElementById("editBookingForm");
const editBookingMessage = document.getElementById("editBookingMessage");

let allBookings = [];

function getStatusClass(status) {
  if (status === "CONFIRMED") return "confirmed";
  if (status === "CANCELED") return "canceled";
  return "pending";
}

function openViewModal() {
  bookingViewModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeViewModal() {
  bookingViewModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function openEditModal() {
  bookingEditModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeEditModal() {
  bookingEditModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function renderBookings(bookings) {
  bookingHistoryGrid.innerHTML = "";

  if (!bookings.length) {
    bookingHistoryGrid.innerHTML = `<div class="movie-empty">No bookings found.</div>`;
    return;
  }

  bookings.forEach(booking => {
    const poster = booking.moviePosterImage || "https://via.placeholder.com/120x180?text=Poster";
    const paymentClass = booking.paymentStatusText.toLowerCase();

    bookingHistoryGrid.innerHTML += `
      <div class="bp-history-card">
        <div class="bp-history-top">
          <img class="bp-history-poster" src="${poster}" alt="${booking.movieTitle}" />
          <div>
            <div class="bp-history-title">${booking.movieTitle || "Movie"}</div>
            <div class="bp-mini">Booking ID: #${booking.id}</div>
            <div class="bp-mini">Date: ${booking.showDate || "-"}</div>
            <div class="bp-mini">Time: ${booking.showTime || "-"}</div>
            <div class="bp-mini">Seats: ${(booking.selectedSeats || []).join(", ")}</div>
            <div class="bp-mini">Amount: Rs ${(booking.totalAmount || 0).toFixed(2)}</div>

            <div style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
              <span class="bp-status ${getStatusClass(booking.status)}">${booking.status.replaceAll("_", " ")}</span>
              <span class="bp-status ${paymentClass}">${(booking.paymentStatusText || "PENDING").replaceAll("_", " ")}</span>
            </div>
          </div>
        </div>

        <div class="bp-history-actions">
          <button type="button" onclick="viewBookingDetails(${booking.id})">View</button>
          ${booking.status === "PENDING_PAYMENT" ? `<button type="button" class="secondary-btn" onclick="openEditBooking(${booking.id})">Edit</button>` : ``}
          ${booking.status === "PENDING_PAYMENT" ? `<button type="button" class="btn" onclick="payForBooking(${booking.id})">Pay Now</button>` : ``}
          ${booking.status !== "CANCELED" ? `<button type="button" class="danger-btn" onclick="cancelBooking(${booking.id})">Cancel</button>` : ``}
        </div>
      </div>
    `;
  });
}

function applyFilters() {
  const keyword = bookingSearchInput.value.trim().toLowerCase();
  const status = bookingStatusFilter.value;

  const filtered = allBookings.filter(booking => {
    const matchKeyword =
      !keyword ||
      booking.movieTitle?.toLowerCase().includes(keyword) ||
      String(booking.id).includes(keyword);

    const matchStatus = !status || booking.status === status;
    return matchKeyword && matchStatus;
  });

  renderBookings(filtered);
}

async function loadBookingHistory() {
  const loggedUser = getLoggedInUser();
  if (!loggedUser || loggedUser.admin) {
    window.location.href = "../user/login.html";
    return;
  }

  try {
    const response = await fetch(`${BOOKING_API}/user/${loggedUser.id}`);
    if (!response.ok) throw new Error("Failed to load booking history");

    allBookings = await response.json();
    renderBookings(allBookings);

    bookingHistoryMessage.className = "message success";
    bookingHistoryMessage.innerText = "Booking history loaded successfully";
  } catch (error) {
    bookingHistoryMessage.className = "message error";
    bookingHistoryMessage.innerText = error.message;
  }
}

async function viewBookingDetails(bookingId) {
  const loggedUser = getLoggedInUser();

  try {
    const response = await fetch(`${BOOKING_API}/${bookingId}?requestUserId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Booking not found");

    const booking = await response.json();

    bookingViewBody.innerHTML = `
      <div class="bp-summary-box">
        <div class="bp-summary-line"><span>Booking ID</span><span>#${booking.id}</span></div>
        <div class="bp-summary-line"><span>Movie</span><span>${booking.movieTitle || "-"}</span></div>
        <div class="bp-summary-line"><span>Contact Name</span><span>${booking.contactName || "-"}</span></div>
        <div class="bp-summary-line"><span>Email</span><span>${booking.contactEmail || "-"}</span></div>
        <div class="bp-summary-line"><span>Mobile</span><span>${booking.contactMobile || "-"}</span></div>
        <div class="bp-summary-line"><span>Date</span><span>${booking.showDate || "-"}</span></div>
        <div class="bp-summary-line"><span>Time</span><span>${booking.showTime || "-"}</span></div>
        <div class="bp-summary-line"><span>Seat Type</span><span>${booking.seatType || "-"}</span></div>
        <div class="bp-summary-line"><span>Seats</span><span>${(booking.selectedSeats || []).join(", ")}</span></div>
        <div class="bp-summary-line"><span>Booking Status</span><span>${(booking.status || "").replaceAll("_", " ")}</span></div>
        <div class="bp-summary-line"><span>Payment Status</span><span>${(booking.paymentStatusText || "").replaceAll("_", " ")}</span></div>
        <div class="bp-summary-line"><span>Total</span><span>Rs ${(booking.totalAmount || 0).toFixed(2)}</span></div>
      </div>
    `;

    openViewModal();
  } catch (error) {
    bookingHistoryMessage.className = "message error";
    bookingHistoryMessage.innerText = error.message;
  }
}

async function openEditBooking(bookingId) {
  const loggedUser = getLoggedInUser();

  try {
    const response = await fetch(`${BOOKING_API}/${bookingId}?requestUserId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Booking not found");

    const booking = await response.json();

    document.getElementById("editBookingId").value = booking.id;
    document.getElementById("editContactName").value = booking.contactName || "";
    document.getElementById("editContactEmail").value = booking.contactEmail || "";
    document.getElementById("editContactMobile").value = booking.contactMobile || "";
    document.getElementById("editShowDate").value = booking.showDate || "";
    document.getElementById("editShowTime").value = booking.showTime || "";
    document.getElementById("editSeatType").value = booking.seatType || "STANDARD";
    document.getElementById("editSelectedSeats").value = (booking.selectedSeats || []).join(", ");

    editBookingMessage.innerHTML = "";
    openEditModal();
  } catch (error) {
    bookingHistoryMessage.className = "message error";
    bookingHistoryMessage.innerText = error.message;
  }
}

editBookingForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();
  const bookingId = document.getElementById("editBookingId").value;

  try {
    const payload = {
      contactName: document.getElementById("editContactName").value.trim(),
      contactEmail: document.getElementById("editContactEmail").value.trim(),
      contactMobile: document.getElementById("editContactMobile").value.trim(),
      showDate: document.getElementById("editShowDate").value,
      showTime: document.getElementById("editShowTime").value.trim(),
      seatType: document.getElementById("editSeatType").value,
      selectedSeats: document.getElementById("editSelectedSeats").value
        .split(",")
        .map(value => value.trim())
        .filter(Boolean)
    };

    const response = await fetch(`${BOOKING_API}/${bookingId}?requestUserId=${loggedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update booking");
    }

    editBookingMessage.className = "message success";
    editBookingMessage.innerText = "Booking updated successfully";

    closeEditModal();
    loadBookingHistory();
  } catch (error) {
    editBookingMessage.className = "message error";
    editBookingMessage.innerText = error.message;
  }
});

async function cancelBooking(bookingId) {
  const loggedUser = getLoggedInUser();
  const confirmed = confirm("Cancel this booking?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${BOOKING_API}/${bookingId}?requestUserId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to cancel booking");
    }

    bookingHistoryMessage.className = "message success";
    bookingHistoryMessage.innerText = "Booking canceled successfully";
    loadBookingHistory();
  } catch (error) {
    bookingHistoryMessage.className = "message error";
    bookingHistoryMessage.innerText = error.message;
  }
}

function payForBooking(bookingId) {
  window.location.href = `../payment/make-payment.html?bookingId=${bookingId}`;
}

bookingSearchInput.addEventListener("input", applyFilters);
bookingStatusFilter.addEventListener("change", applyFilters);

closeBookingViewBtn.addEventListener("click", closeViewModal);
closeBookingViewOverlay.addEventListener("click", closeViewModal);

closeBookingEditBtn.addEventListener("click", closeEditModal);
closeBookingEditOverlay.addEventListener("click", closeEditModal);
cancelEditBookingBtn.addEventListener("click", closeEditModal);

window.viewBookingDetails = viewBookingDetails;
window.openEditBooking = openEditBooking;
window.cancelBooking = cancelBooking;
window.payForBooking = payForBooking;

window.addEventListener("load", loadBookingHistory);