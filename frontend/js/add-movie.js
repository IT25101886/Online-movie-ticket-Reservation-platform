const addMovieForm = document.getElementById("addMovieForm");
const addMovieMessage = document.getElementById("addMovieMessage");

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

addMovieForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();
  if (!canManageMovies()) {
    addMovieMessage.className = "message error";
    addMovieMessage.innerText = "Only MOVIE_MANAGER can add movies.";
    return;
  }

  try {
    const posterFile = document.getElementById("posterImage").files[0];
    const photoFiles = document.getElementById("moviePhotos").files;

    const posterImage = posterFile ? await fileToBase64(posterFile) : "";
    const moviePhotos = photoFiles.length > 0 ? await filesToBase64(photoFiles) : [];

    const data = {
      title: document.getElementById("title").value,
      genre: document.getElementById("genre").value,
      description: document.getElementById("description").value,
      releaseDate: document.getElementById("releaseDate").value,
      showTimes: document.getElementById("showTimes").value,
      language: document.getElementById("language").value,
      movieType: document.getElementById("movieType").value,
      posterImage,
      moviePhotos
    };

    const response = await fetch(`${MOVIE_API}?performedByAdminId=${loggedUser.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to add movie");
    }

    addMovieMessage.className = "message success";
    addMovieMessage.innerText = "Movie added successfully";
    addMovieForm.reset();
  } catch (error) {
    addMovieMessage.className = "message error";
    addMovieMessage.innerText = error.message;
  }
});