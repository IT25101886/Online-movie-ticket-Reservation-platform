const movieDashboardTableBody = document.getElementById("movieDashboardTableBody");
const movieDashboardMessage = document.getElementById("movieDashboardMessage");
const totalMoviesCount = document.getElementById("totalMoviesCount");

function canManageMovies() {
  const user = getLoggedInUser();
  return user && user.admin && (
    user.adminPermission === "MOVIE_MANAGER" ||
    user.adminPermission === "ADMIN_MANAGER"
  );
}

function renderMovieDashboard(movies) {
  movieDashboardTableBody.innerHTML = "";
  totalMoviesCount.innerText = movies.length;

  if (!movies || movies.length === 0) {
    movieDashboardTableBody.innerHTML = `<tr><td colspan="7">No movies found</td></tr>`;
    return;
  }

  movies.forEach(movie => {
    const poster = movie.posterImage && movie.posterImage.trim() !== ""
      ? movie.posterImage
      : "https://via.placeholder.com/80x110?text=No+Poster";

    movieDashboardTableBody.innerHTML += `
      <tr>
        <td><img src="${poster}" alt="${movie.title}" /></td>
        <td>${movie.title}</td>
        <td>${movie.genre}</td>
        <td>${movie.category.replaceAll("_", " ")}</td>
        <td>${movie.releaseDate || ""}</td>
        <td>${movie.showTimes || ""}</td>
        <td>
          <div class="movie-card-actions">
            <button type="button" onclick="goToEditMovie(${movie.id})">Edit</button>
            <button type="button" class="danger-btn" onclick="deleteMovie(${movie.id})">Delete</button>
          </div>
        </td>
      </tr>
    `;
  });
}

function goToEditMovie(id) {
  localStorage.setItem("editMovieId", id);
  window.location.href = "update-movie.html";
}

async function deleteMovie(id) {
  const loggedUser = getLoggedInUser();
  if (!loggedUser) return;

  const confirmDelete = confirm("Remove this movie?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${MOVIE_API}/${id}?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Delete failed");
    }

    movieDashboardMessage.className = "message success";
    movieDashboardMessage.innerText = "Movie removed successfully";
    loadMovieDashboard();
  } catch (error) {
    movieDashboardMessage.className = "message error";
    movieDashboardMessage.innerText = error.message;
  }
}

async function loadMovieDashboard() {
  if (!canManageMovies()) {
    movieDashboardMessage.className = "message error";
    movieDashboardMessage.innerText = "Only MOVIE_MANAGER can view this dashboard.";
    return;
  }

  try {
    const response = await fetch(MOVIE_API);
    if (!response.ok) throw new Error("Failed to load movies");

    const movies = await response.json();
    renderMovieDashboard(movies);

    movieDashboardMessage.className = "message success";
    movieDashboardMessage.innerText = "Movies loaded successfully";
  } catch (error) {
    movieDashboardMessage.className = "message error";
    movieDashboardMessage.innerText = error.message;
  }
}

window.addEventListener("load", loadMovieDashboard);