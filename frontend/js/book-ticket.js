const bookingContactForm = document.getElementById("bookingContactForm");
const bookingStartMessage = document.getElementById("bookingStartMessage");

function getMovieIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("movieId");
}

async function loadMovieAndUser() {
  const loggedUser = getLoggedInUser();

  if (!loggedUser || loggedUser.admin) {
    alert("Please login as a normal user first.");
    window.location.href = "../user/login.html";
    return;
  }

  const movieId = getMovieIdFromUrl();
  if (!movieId) {
    bookingStartMessage.className = "message error";
    bookingStartMessage.innerText = "Movie not selected.";
    return;
  }

  try {
    const movieResponse = await fetch(`${MOVIE_API}/${movieId}`);
    if (!movieResponse.ok) throw new Error("Movie not found");
    const movie = await movieResponse.json();

    const userResponse = await fetch(`${USER_API}/${loggedUser.id}`);
    if (!userResponse.ok) throw new Error("User not found");
    const user = await userResponse.json();

    document.getElementById("bookingMoviePoster").src = movie.posterImage || "https://via.placeholder.com/300x450?text=No+Poster";
    document.getElementById("bookingMovieCategory").innerText = (movie.category || "").replaceAll("_", " ");
    document.getElementById("bookingMovieGenre").innerText = movie.genre || "";
    document.getElementById("bookingMovieLanguage").innerText = movie.language || "";
    document.getElementById("bookingMovieTitle").innerText = movie.title || "";
    document.getElementById("bookingMovieDescription").innerText = movie.description || "";

    document.getElementById("contactName").value = user.fullName || "";
    document.getElementById("contactEmail").value = user.email || "";
    document.getElementById("contactMobile").value = user.phone || "";
  } catch (error) {
    bookingStartMessage.className = "message error";
    bookingStartMessage.innerText = error.message;
  }
}

bookingContactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();
  const movieId = getMovieIdFromUrl();

  const draft = {
    userId: loggedUser.id,
    movieId: Number(movieId),
    contactName: document.getElementById("contactName").value.trim(),
    contactEmail: document.getElementById("contactEmail").value.trim(),
    contactMobile: document.getElementById("contactMobile").value.trim()
  };

  localStorage.setItem("pendingBookingDraft", JSON.stringify(draft));
  window.location.href = "seat-selection.html";
});

window.addEventListener("load", loadMovieAndUser);