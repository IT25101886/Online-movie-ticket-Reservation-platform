const heroSlidesContainer = document.getElementById("heroSlidesContainer");
const heroDots = document.getElementById("heroDots");
const heroPrevBtn = document.getElementById("heroPrevBtn");
const heroNextBtn = document.getElementById("heroNextBtn");
const homeNowShowingGrid = document.getElementById("homeNowShowingGrid");
const homeComingSoonGrid = document.getElementById("homeComingSoonGrid");

let allHomeMovies = [];
let heroMovies = [];
let currentHeroIndex = 0;
let heroInterval = null;

function fallbackPoster(title = "Movie") {
  return `https://via.placeholder.com/600x900/111111/ffffff?text=${encodeURIComponent(title)}`;
}

function getHeroImage(movie) {
  if (movie.posterImage && movie.posterImage.trim() !== "") {
    return movie.posterImage;
  }

  if (movie.moviePhotos && movie.moviePhotos.length > 0) {
    return movie.moviePhotos[0];
  }

  return fallbackPoster(movie.title);
}

function getPosterImage(movie) {
  if (movie.posterImage && movie.posterImage.trim() !== "") {
    return movie.posterImage;
  }

  return getHeroImage(movie);
}

function truncateText(text, max = 180) {
  if (!text) return "No description available.";
  return text.length > max ? `${text.substring(0, max)}...` : text;
}

function statusLabel(movie) {
  return movie.category === "NOW_SHOWING" ? "Now Showing" : "Coming Soon";
}

function statusClass(movie) {
  return movie.category === "NOW_SHOWING" ? "now" : "upcoming";
}

function openMovieDetails(movieId) {
  window.location.href = `pages/movie/movie-details.html?id=${movieId}`;
}

function goToBooking(movieId) {
  const loggedUser = getLoggedInUser();

  if (!loggedUser || loggedUser.admin) {
    alert("Please login as a normal user to book tickets.");
    window.location.href = "pages/user/login.html";
    return;
  }

  window.location.href = `pages/booking/book-ticket.html?movieId=${movieId}`;
}

function createHeroSlide(movie, index) {
  const bgImage = getHeroImage(movie);
  const posterImage = getPosterImage(movie);

  return `
    <div class="hero-slide ${index === currentHeroIndex ? "active" : ""}" data-index="${index}">
      <div class="hero-slide-bg" style="background-image: url('${bgImage}')"></div>
      <div class="hero-slide-overlay"></div>

      <div class="hero-slide-content">
        <img class="hero-poster" src="${posterImage}" alt="${movie.title}" />

        <div class="hero-info">
          <div class="hero-badge-row">
            <span class="hero-badge ${statusClass(movie)}">${statusLabel(movie)}</span>
            <span class="hero-badge">${movie.genre || "Genre"}</span>
            <span class="hero-badge">${movie.language || "Language"}</span>
          </div>

          <div class="hero-title">${movie.title || "Movie Title"}</div>
          <div class="hero-description">${truncateText(movie.description, 220)}</div>

          <div class="hero-meta">
            <span class="hero-meta-pill">Release: ${movie.releaseDate || "-"}</span>
            <span class="hero-meta-pill">Showtimes: ${movie.showTimes || "-"}</span>
          </div>

          <div class="hero-actions">
            <button class="home-btn-primary" type="button" onclick="goToBooking(${movie.id})">Buy Tickets</button>
            <button class="home-btn-secondary" type="button" onclick="openMovieDetails(${movie.id})">View Details</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderHeroSlider() {
  if (!heroMovies.length) {
    heroSlidesContainer.innerHTML = `
      <div class="hero-slide active">
        <div class="hero-slide-bg" style="background-image:url('https://via.placeholder.com/1400x800/111111/ffffff?text=CineBook')"></div>
        <div class="hero-slide-overlay"></div>
        <div class="hero-slide-content">
          <img class="hero-poster" src="https://via.placeholder.com/400x600/111111/ffffff?text=No+Movie" alt="No movie" />
          <div class="hero-info">
            <div class="hero-title">Welcome to CineBook</div>
            <div class="hero-description">No movies found yet. Add movies from Movie Manager dashboard and they will appear here automatically.</div>
          </div>
        </div>
      </div>
    `;
    heroDots.innerHTML = "";
    return;
  }

  heroSlidesContainer.innerHTML = heroMovies.map((movie, index) => createHeroSlide(movie, index)).join("");

  heroDots.innerHTML = heroMovies.map((_, index) => `
    <button class="hero-dot ${index === currentHeroIndex ? "active" : ""}" type="button" onclick="goToHeroSlide(${index})"></button>
  `).join("");
}

function updateHeroSliderUI() {
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === currentHeroIndex);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentHeroIndex);
  });
}

function goToHeroSlide(index) {
  currentHeroIndex = index;
  updateHeroSliderUI();
  restartHeroAutoPlay();
}

function nextHeroSlide() {
  if (!heroMovies.length) return;
  currentHeroIndex = (currentHeroIndex + 1) % heroMovies.length;
  updateHeroSliderUI();
}

function prevHeroSlide() {
  if (!heroMovies.length) return;
  currentHeroIndex = (currentHeroIndex - 1 + heroMovies.length) % heroMovies.length;
  updateHeroSliderUI();
}

function startHeroAutoPlay() {
  stopHeroAutoPlay();
  heroInterval = setInterval(nextHeroSlide, 4000);
}

function stopHeroAutoPlay() {
  if (heroInterval) {
    clearInterval(heroInterval);
    heroInterval = null;
  }
}

function restartHeroAutoPlay() {
  startHeroAutoPlay();
}

function createHomeMovieCard(movie) {
  const poster = getPosterImage(movie);

  return `
    <div class="home-movie-card">
      <div class="home-movie-thumb">
        <img src="${poster}" alt="${movie.title}" />
      </div>

      <div class="home-movie-info">
        <div class="home-movie-status ${movie.category === "NOW_SHOWING" ? "now" : "upcoming"}">
          ${statusLabel(movie)}
        </div>

        <div class="home-movie-title">${movie.title || "Movie Title"}</div>
        <div class="home-movie-meta">${movie.releaseDate || "-"} • ${movie.language || "-"}</div>
        <div class="home-movie-times">${movie.showTimes || "-"}</div>

        <div class="home-movie-actions">
          <button class="home-mini-btn primary" type="button" onclick="goToBooking(${movie.id})">Buy Tickets</button>
          <button class="home-mini-btn secondary" type="button" onclick="openMovieDetails(${movie.id})">View Details</button>
        </div>
      </div>
    </div>
  `;
}

function renderMovieSections() {
  const nowShowing = allHomeMovies.filter(movie => movie.category === "NOW_SHOWING");
  const upcoming = allHomeMovies.filter(movie => movie.category === "UPCOMING");

  if (nowShowing.length) {
    homeNowShowingGrid.innerHTML = nowShowing.map(createHomeMovieCard).join("");
  } else {
    homeNowShowingGrid.innerHTML = `<div class="home-empty">No now showing movies found.</div>`;
  }

  if (upcoming.length) {
    homeComingSoonGrid.innerHTML = upcoming.map(createHomeMovieCard).join("");
  } else {
    homeComingSoonGrid.innerHTML = `<div class="home-empty">No coming soon movies found.</div>`;
  }
}

async function loadHomeMovies() {
  try {
    const response = await fetch(MOVIE_API);
    if (!response.ok) {
      throw new Error("Failed to load movies");
    }

    const movies = await response.json();
    allHomeMovies = movies || [];

    const nowShowing = allHomeMovies.filter(movie => movie.category === "NOW_SHOWING");
    heroMovies = nowShowing.length ? nowShowing.slice(0, 6) : allHomeMovies.slice(0, 6);

    renderHeroSlider();
    renderMovieSections();
    startHeroAutoPlay();

    const heroSlider = document.getElementById("heroSlider");
    heroSlider.addEventListener("mouseenter", stopHeroAutoPlay);
    heroSlider.addEventListener("mouseleave", startHeroAutoPlay);
  } catch (error) {
    heroSlidesContainer.innerHTML = `
      <div class="hero-slide active">
        <div class="hero-slide-bg" style="background-image:url('https://via.placeholder.com/1400x800/111111/ffffff?text=Error')"></div>
        <div class="hero-slide-overlay"></div>
        <div class="hero-slide-content">
          <div class="hero-info">
            <div class="hero-title">Unable to Load Movies</div>
            <div class="hero-description">${error.message}</div>
          </div>
        </div>
      </div>
    `;
      homeNowShowingGrid.innerHTML = `<div class="home-empty">${error.message}</div>`;
      homeComingSoonGrid.innerHTML = `<div class="home-empty">${error.message}</div>`;
  }
}

heroPrevBtn.addEventListener("click", function () {
  prevHeroSlide();
  restartHeroAutoPlay();
});

heroNextBtn.addEventListener("click", function () {
  nextHeroSlide();
  restartHeroAutoPlay();
});

window.openMovieDetails = openMovieDetails;
window.goToBooking = goToBooking;
window.goToHeroSlide = goToHeroSlide;

window.addEventListener("load", loadHomeMovies);