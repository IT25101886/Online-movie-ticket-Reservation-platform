const paymentSuccessMessage = document.getElementById("paymentSuccessMessage");

function getPaymentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("paymentId");
}

async function loadPaymentSuccess() {
  const loggedUser = getLoggedInUser();
  if (!loggedUser || loggedUser.admin) {
    window.location.href = "../user/login.html";
    return;
  }

  const paymentId = getPaymentIdFromUrl();
  if (!paymentId) return;

  try {
    const response = await fetch(`${PAYMENT_API}/${paymentId}?requestUserId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Payment not found");

    const payment = await response.json();

    document.getElementById("successPaymentId").innerText = `#${payment.id}`;
    document.getElementById("successBookingId").innerText = `#${payment.bookingId}`;
    document.getElementById("successMovieTitle").innerText = payment.movieTitle || "-";
    document.getElementById("successAmount").innerText = `Rs ${(payment.amount || 0).toFixed(2)}`;
    document.getElementById("successStatus").innerText = payment.status || "COMPLETED";

    paymentSuccessMessage.className = "message success";
    paymentSuccessMessage.innerText = "Your payment has been processed successfully.";
  } catch (error) {
    paymentSuccessMessage.className = "message error";
    paymentSuccessMessage.innerText = error.message;
  }
}

window.addEventListener("load", loadPaymentSuccess);