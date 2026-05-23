const movieFilterForm = document.getElementById("movieFilterForm");
const movieTitleSearch = document.getElementById("movieTitleSearch");
const movieGenreFilter = document.getElementById("movieGenreFilter");
const sortReleaseBtn = document.getElementById("sortReleaseBtn");
const nowShowingGrid = document.getElementById("nowShowingGrid");
const comingSoonGrid = document.getElementById("comingSoonGrid");
const movieListMessage = document.getElementById("movieListMessage");
const moviePagination = document.getElementById("moviePagination");

const MOVIES_PER_PAGE = 20;

let allMovies = [];
let filteredMovies = [];
let currentPage = 1;

function fallbackPoster(title = "Movie") {
  return `https://via.placeholder.com/300x450/111111/ffffff?text=${encodeURIComponent(title)}`;
}

function openMovieDetails(id) {
  window.location.href = `movie-details.html?id=${id}`;
}

function goToBooking(movieId) {
  const loggedUser = getLoggedInUser();
  if (!loggedUser || loggedUser.admin) {
    alert("Please login as a user to book tickets.");
    window.location.href = "../../pages/user/login.html";
    return;
  }
  window.location.href = `../booking/book-ticket.html?movieId=${movieId}`;
}

function createMovieCard(movie) {
  const poster = movie.posterImage && movie.posterImage.trim() !== ""
    ? movie.posterImage
    : fallbackPoster(movie.title);

  const badgeClass = movie.category === "NOW_SHOWING" ? "now" : "soon";
  const badgeText = movie.category === "NOW_SHOWING" ? "Now Showing" : "Coming Soon";

  return `
    <div class="movie-poster-card">
      <div class="movie-poster-image-wrap">
        <img src="${poster}" alt="${movie.title}" />
      </div>

      <div class="movie-poster-content">
        <div class="movie-badge-row">
          <span class="movie-badge ${badgeClass}">${badgeText}</span>
        </div>

        <div class="movie-poster-title">${movie.title}</div>
        <div class="movie-poster-meta">${movie.releaseDate || ""} &nbsp; ${movie.language || ""}</div>
        <div class="movie-poster-times">${movie.showTimes || ""}</div>

        <div class="movie-actions">
          <button type="button" class="btn-buy" onclick="goToBooking(${movie.id})">Buy tickets</button>
          <button type="button" class="btn-outline" onclick="openMovieDetails(${movie.id})">View details</button>
        </div>
      </div>
    </div>
  `;
}

function renderSection(gridEl, movies) {
  if (!movies || movies.length === 0) {
    gridEl.innerHTML = `<div class="movie-empty">No movies found.</div>`;
    return;
  }

  gridEl.innerHTML = movies.map(createMovieCard).join("");
}

function getPagedMovies() {
  const start = (currentPage - 1) * MOVIES_PER_PAGE;
  const end = start + MOVIES_PER_PAGE;
  return filteredMovies.slice(start, end);
}

function renderMovieSections() {
  const currentPageMovies = getPagedMovies();

  const nowShowing = currentPageMovies.filter(movie => movie.category === "NOW_SHOWING");
  const upcoming = currentPageMovies.filter(movie => movie.category === "UPCOMING");

  renderSection(nowShowingGrid, nowShowing);
  renderSection(comingSoonGrid, upcoming);

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);

  if (totalPages <= 1) {
    moviePagination.innerHTML = "";
    return;
  }

  let html = `
    <button class="movie-page-btn" ${currentPage === 1 ? "disabled" : ""} onclick="changePage(${currentPage - 1})">Prev</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="movie-page-btn ${i === currentPage ? "active" : ""}" onclick="changePage(${i})">${i}</button>
    `;
  }

  html += `
    <button class="movie-page-btn" ${currentPage === totalPages ? "disabled" : ""} onclick="changePage(${currentPage + 1})">Next</button>
  `;

  moviePagination.innerHTML = html;
}

function changePage(page) {
  const totalPages = Math.ceil(filteredMovies.length / MOVIES_PER_PAGE);
  if (page < 1 || page > totalPages) return;

  currentPage = page;
  renderMovieSections();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadAllMovies() {
  try {
    const response = await fetch(MOVIE_API);
    if (!response.ok) throw new Error("Failed to load movies");

    allMovies = await response.json();
    filteredMovies = [...allMovies];
    currentPage = 1;

    renderMovieSections();

    movieListMessage.className = "message success";
    movieListMessage.innerText = "Movies loaded successfully";
  } catch (error) {
    movieListMessage.className = "message error";
    movieListMessage.innerText = error.message;
  }
}

movieFilterForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  try {
    const params = new URLSearchParams();

    const title = movieTitleSearch.value.trim();
    const genre = movieGenreFilter.value;

    if (title) params.append("title", title);
    if (genre) params.append("genre", genre);

    const response = await fetch(`${MOVIE_API}/search?${params.toString()}`);
    if (!response.ok) throw new Error("Search failed");

    filteredMovies = await response.json();
    currentPage = 1;
    renderMovieSections();

    movieListMessage.className = "message success";
    movieListMessage.innerText = "Movies filtered successfully";
  } catch (error) {
    movieListMessage.className = "message error";
    movieListMessage.innerText = error.message;
  }
});

sortReleaseBtn.addEventListener("click", async function () {
  try {
    const response = await fetch(`${MOVIE_API}/sorted/release-date`);
    if (!response.ok) throw new Error("Sorting failed");

    const sortedMovies = await response.json();

    const title = movieTitleSearch.value.trim().toLowerCase();
    const genre = movieGenreFilter.value;

    filteredMovies = sortedMovies.filter(movie => {
      const matchTitle = !title || movie.title.toLowerCase().includes(title);
      const matchGenre = !genre || movie.genre === genre;
      return matchTitle && matchGenre;
    });

    currentPage = 1;
    renderMovieSections();

    movieListMessage.className = "message success";
    movieListMessage.innerText = "Movies sorted by release date";
  } catch (error) {
    movieListMessage.className = "message error";
    movieListMessage.innerText = error.message;
  }
});

window.changePage = changePage;
window.openMovieDetails = openMovieDetails;
window.goToBooking = goToBooking;

window.addEventListener("load", loadAllMovies);