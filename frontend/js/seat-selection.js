const showDateInput = document.getElementById("showDate");
const seatTypeSelect = document.getElementById("seatType");
const showtimeRow = document.getElementById("showtimeRow");
const seatMap = document.getElementById("seatMap");
const confirmBookingBtn = document.getElementById("confirmBookingBtn");
const seatSelectionMessage = document.getElementById("seatSelectionMessage");

let bookingDraft = null;
let movieData = null;
let selectedShowTime = "";
let unavailableSeats = [];
let selectedSeats = [];

const PREMIUM_ROWS = ["A", "B", "C"];
const STANDARD_ROWS = ["D", "E", "F", "G", "H"];
const SEATS_PER_ROW = 10;

function getSeatPrice(type) {
  return type === "PREMIUM" ? 1800 : 1200;
}

function getRowsForType(type) {
  return type === "PREMIUM" ? PREMIUM_ROWS : STANDARD_ROWS;
}

function updateSummary() {
  document.getElementById("summaryMovie").innerText = movieData?.title || "-";
  document.getElementById("summaryDate").innerText = showDateInput.value || "-";
  document.getElementById("summaryTime").innerText = selectedShowTime || "-";
  document.getElementById("summarySeatType").innerText = seatTypeSelect.value || "-";
  document.getElementById("summarySeats").innerText = selectedSeats.length ? selectedSeats.join(", ") : "-";
  document.getElementById("summarySeatCount").innerText = selectedSeats.length;

  const total = selectedSeats.length * getSeatPrice(seatTypeSelect.value);
  document.getElementById("summaryTotal").innerText = `Rs ${total.toFixed(2)}`;
}

function renderShowTimes() {
  showtimeRow.innerHTML = "";
  const showTimes = (movieData?.showTimes || "").split(",").map(value => value.trim()).filter(Boolean);

  showTimes.forEach(time => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `showtime-btn ${selectedShowTime === time ? "active" : ""}`;
    button.innerText = time;
    button.addEventListener("click", async function () {
      selectedShowTime = time;
      selectedSeats = [];
      renderShowTimes();
      await loadUnavailableSeats();
      renderSeatMap();
      updateSummary();
    });
    showtimeRow.appendChild(button);
  });
}

function renderSeatMap() {
  seatMap.innerHTML = "";
  const seatType = seatTypeSelect.value;
  const rows = getRowsForType(seatType);

  rows.forEach(row => {
    const rowEl = document.createElement("div");
    rowEl.className = "seat-row";

    const label = document.createElement("div");
    label.className = "seat-row-label";
    label.innerText = row;

    const grid = document.createElement("div");
    grid.className = "seat-row-grid";

    for (let i = 1; i <= SEATS_PER_ROW; i++) {
      const seatCode = `${row}${i}`;
      const button = document.createElement("button");
      button.type = "button";
      button.className = `seat-btn ${seatType === "PREMIUM" ? "premium" : ""}`;
      button.innerText = i;

      if (unavailableSeats.includes(seatCode)) {
        button.classList.add("booked");
        button.disabled = true;
      } else if (selectedSeats.includes(seatCode)) {
        button.classList.add("selected");
      }

      button.addEventListener("click", function () {
        if (selectedSeats.includes(seatCode)) {
          selectedSeats = selectedSeats.filter(item => item !== seatCode);
        } else {
          selectedSeats.push(seatCode);
        }
        renderSeatMap();
        updateSummary();
      });

      grid.appendChild(button);
    }

    rowEl.appendChild(label);
    rowEl.appendChild(grid);
    seatMap.appendChild(rowEl);
  });
}

async function loadUnavailableSeats() {
  unavailableSeats = [];

  if (!bookingDraft?.movieId || !showDateInput.value || !selectedShowTime) return;

  try {
    const params = new URLSearchParams({
      movieId: bookingDraft.movieId,
      showDate: showDateInput.value,
      showTime: selectedShowTime
    });

    const response = await fetch(`${BOOKING_API}/availability?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to load seat availability");

    unavailableSeats = await response.json();
  } catch (error) {
    seatSelectionMessage.className = "message error";
    seatSelectionMessage.innerText = error.message;
  }
}

async function initSeatSelection() {
  const draftText = localStorage.getItem("pendingBookingDraft");
  if (!draftText) {
    window.location.href = "book-ticket.html";
    return;
  }

  bookingDraft = JSON.parse(draftText);

  try {
    const movieResponse = await fetch(`${MOVIE_API}/${bookingDraft.movieId}`);
    if (!movieResponse.ok) throw new Error("Movie not found");
    movieData = await movieResponse.json();

    showDateInput.value = new Date().toISOString().split("T")[0];

    renderShowTimes();
    renderSeatMap();
    updateSummary();
  } catch (error) {
    seatSelectionMessage.className = "message error";
    seatSelectionMessage.innerText = error.message;
  }
}

showDateInput.addEventListener("change", async function () {
  selectedSeats = [];
  await loadUnavailableSeats();
  renderSeatMap();
  updateSummary();
});

seatTypeSelect.addEventListener("change", async function () {
  selectedSeats = [];
  await loadUnavailableSeats();
  renderSeatMap();
  updateSummary();
});

confirmBookingBtn.addEventListener("click", async function () {
  if (!showDateInput.value || !selectedShowTime || selectedSeats.length === 0) {
    seatSelectionMessage.className = "message error";
    seatSelectionMessage.innerText = "Please select date, time, and at least one seat.";
    return;
  }

  try {
    const payload = {
      userId: bookingDraft.userId,
      movieId: bookingDraft.movieId,
      contactName: bookingDraft.contactName,
      contactEmail: bookingDraft.contactEmail,
      contactMobile: bookingDraft.contactMobile,
      showDate: showDateInput.value,
      showTime: selectedShowTime,
      seatType: seatTypeSelect.value,
      selectedSeats
    };

    const response = await fetch(BOOKING_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Booking failed");
    }

    const booking = await response.json();
    localStorage.removeItem("pendingBookingDraft");
    window.location.href = `../payment/make-payment.html?bookingId=${booking.id}`;
  } catch (error) {
    seatSelectionMessage.className = "message error";
    seatSelectionMessage.innerText = error.message;
  }
});

window.addEventListener("load", initSeatSelection);