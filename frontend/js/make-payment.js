const paymentForm = document.getElementById("paymentForm");
const paymentMessage = document.getElementById("paymentMessage");

let currentBooking = null;

function getBookingIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("bookingId");
}

async function loadBookingSummary() {
  const loggedUser = getLoggedInUser();
  if (!loggedUser || loggedUser.admin) {
    window.location.href = "../user/login.html";
    return;
  }

  const bookingId = getBookingIdFromUrl();
  if (!bookingId) {
    paymentMessage.className = "message error";
    paymentMessage.innerText = "Booking not selected.";
    return;
  }

  try {
    const response = await fetch(`${BOOKING_API}/${bookingId}?requestUserId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Booking not found");

    currentBooking = await response.json();

    document.getElementById("payBookingId").innerText = `#${currentBooking.id}`;
    document.getElementById("payMovieTitle").innerText = currentBooking.movieTitle || "-";
    document.getElementById("payDate").innerText = currentBooking.showDate || "-";
    document.getElementById("payTime").innerText = currentBooking.showTime || "-";
    document.getElementById("paySeats").innerText = currentBooking.selectedSeats?.join(", ") || "-";
    document.getElementById("paySeatType").innerText = currentBooking.seatType || "-";
    document.getElementById("payTotal").innerText = `Rs ${(currentBooking.totalAmount || 0).toFixed(2)}`;
  } catch (error) {
    paymentMessage.className = "message error";
    paymentMessage.innerText = error.message;
  }
}

paymentForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();
  if (!currentBooking) return;

  try {
    const payload = {
      userId: loggedUser.id,
      bookingId: currentBooking.id,
      paymentMethod: "CARD",
      cardNumber: document.getElementById("cardNumber").value.trim(),
      cardHolderName: document.getElementById("cardHolderName").value.trim(),
      expiryDate: document.getElementById("expiryDate").value.trim(),
      cvv: document.getElementById("cvv").value.trim()
    };

    const response = await fetch(`${PAYMENT_API}/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Payment failed");
    }

    const payment = await response.json();
    window.location.href = `payment-success.html?paymentId=${payment.id}`;
  } catch (error) {
    paymentMessage.className = "message error";
    paymentMessage.innerText = error.message;
  }
});

window.addEventListener("load", loadBookingSummary);