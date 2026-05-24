const loadMovieForm = document.getElementById("loadMovieForm");
const updateMovieForm = document.getElementById("updateMovieForm");
const updateMovieMessage = document.getElementById("updateMovieMessage");

function canManageMovies() {
  const user = getLoggedInUser();
  return user && user.admin && (
    user.adminPermission === "MOVIE_MANAGER" ||
    user.adminPermission === "ADMIN_MANAGER"
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = event => resolve(event.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function filesToBase64(files) {
  const promises = Array.from(files).map(file => fileToBase64(file));
  return Promise.all(promises);
}

function fillMovieForm(movie) {
  document.getElementById("movieId").value = movie.id;
  document.getElementById("title").value = movie.title || "";
  document.getElementById("genre").value = movie.genre || "";
  document.getElementById("movieType").value = movie.category || "";
  document.getElementById("releaseDate").value = movie.releaseDate || "";
  document.getElementById("showTimes").value = movie.showTimes || "";
  document.getElementById("language").value = movie.language || "";
  document.getElementById("description").value = movie.description || "";
}

async function loadMovie(id) {
  try {
    const response = await fetch(`${MOVIE_API}/${id}`);
    if (!response.ok) throw new Error("Movie not found");

    const movie = await response.json();
    fillMovieForm(movie);

    updateMovieMessage.className = "message success";
    updateMovieMessage.innerText = "Movie loaded successfully";
  } catch (error) {
    updateMovieMessage.className = "message error";
    updateMovieMessage.innerText = error.message;
  }
}

loadMovieForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const enteredId = document.getElementById("movieIdInput").value.trim();
  if (enteredId) {
    loadMovie(enteredId);
  }
});

updateMovieForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();
  if (!canManageMovies()) {
    updateMovieMessage.className = "message error";
    updateMovieMessage.innerText = "Only MOVIE_MANAGER can update movies.";
    return;
  }

  const movieId = document.getElementById("movieId").value;
  if (!movieId) {
    updateMovieMessage.className = "message error";
    updateMovieMessage.innerText = "Load a movie first.";
    return;
  }

  try {
    const posterFile = document.getElementById("posterImage").files[0];
    const photoFiles = document.getElementById("moviePhotos").files;

    const posterImage = posterFile ? await fileToBase64(posterFile) : "";
    const moviePhotos = photoFiles.length > 0 ? await filesToBase64(photoFiles) : null;

    const data = {
      title: document.getElementById("title").value,
      genre: document.getElementById("genre").value,
      description: document.getElementById("description").value,
      releaseDate: document.getElementById("releaseDate").value,
      showTimes: document.getElementById("showTimes").value,
      language: document.getElementById("language").value,
      posterImage,
      moviePhotos
    };

    const response = await fetch(`${MOVIE_API}/${movieId}?performedByAdminId=${loggedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update movie");
    }

    const movie = await response.json();
    fillMovieForm(movie);

    updateMovieMessage.className = "message success";
    updateMovieMessage.innerText = "Movie updated successfully";
  } catch (error) {
    updateMovieMessage.className = "message error";
    updateMovieMessage.innerText = error.message;
  }
});

window.addEventListener("load", function () {
  const storedMovieId = localStorage.getItem("editMovieId");
  if (storedMovieId) {
    loadMovie(storedMovieId);
    localStorage.removeItem("editMovieId");
  }
});