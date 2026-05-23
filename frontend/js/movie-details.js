const reviewForm = document.getElementById("reviewForm");
const reviewIdInput = document.getElementById("reviewId");
const reviewRatingInput = document.getElementById("reviewRating");
const reviewCommentInput = document.getElementById("reviewComment");
const reviewFormMessage = document.getElementById("reviewFormMessage");
const reviewListWrap = document.getElementById("reviewListWrap");
const reviewListMessage = document.getElementById("reviewListMessage");
const reviewFormTitle = document.getElementById("reviewFormTitle");
const cancelEditReviewBtn = document.getElementById("cancelEditReviewBtn");
const deleteOwnReviewBtn = document.getElementById("deleteOwnReviewBtn");
const reviewLoginHint = document.getElementById("reviewLoginHint");
const ratingPicker = document.getElementById("ratingPicker");
const ratingHelper = document.getElementById("ratingHelper");

let currentMovieId = null;
let currentMovie = null;
let currentUser = null;
let currentOwnReview = null;
let allMovieReviews = [];

function getMovieIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
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

function placeholderAvatar(name = "U") {
  return `https://via.placeholder.com/80/111111/ffffff?text=${encodeURIComponent((name || "U").charAt(0).toUpperCase())}`;
}

function renderStarString(rating) {
  const full = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return `${full}${empty}`;
}

function formatDateTime(dateTimeText) {
  if (!dateTimeText) return "-";
  return dateTimeText.replace("T", " ");
}

function setSelectedRating(value) {
  reviewRatingInput.value = value;

  const buttons = ratingPicker.querySelectorAll(".rating-star-btn");
  buttons.forEach(button => {
    const starValue = Number(button.dataset.value);
    if (starValue <= value) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });

  ratingHelper.innerText = value > 0 ? `${value} star rating selected` : "Select 1 to 5 stars";
}

function resetReviewForm() {
  currentOwnReview = null;
  reviewIdInput.value = "";
  reviewCommentInput.value = "";
  setSelectedRating(0);
  reviewFormTitle.innerText = "Write a Review";
  cancelEditReviewBtn.style.display = "none";
  deleteOwnReviewBtn.style.display = "none";
}

function fillReviewForm(review) {
  currentOwnReview = review;
  reviewIdInput.value = review.id;
  reviewCommentInput.value = review.comment || "";
  setSelectedRating(review.rating || 0);
  reviewFormTitle.innerText = "Edit Your Review";
  cancelEditReviewBtn.style.display = "inline-flex";
  deleteOwnReviewBtn.style.display = "inline-flex";
}

function renderReviewSummary(summary) {
  const total = summary.totalReviews || 0;
  const avg = summary.averageRating || 0;

  document.getElementById("overallRatingValue").innerText = avg.toFixed(1);
  document.getElementById("overallRatingStars").innerText = renderStarString(Math.round(avg));
  document.getElementById("overallRatingText").innerText = `${total} review${total === 1 ? "" : "s"}`;
  document.getElementById("verifiedReviewCount").innerText = `Verified: ${summary.verifiedReviews || 0}`;
  document.getElementById("publicReviewCount").innerText = `Public: ${summary.publicReviews || 0}`;

  const ratingCounts = {
    5: summary.fiveStarCount || 0,
    4: summary.fourStarCount || 0,
    3: summary.threeStarCount || 0,
    2: summary.twoStarCount || 0,
    1: summary.oneStarCount || 0
  };

  Object.entries(ratingCounts).forEach(([star, count]) => {
    const percent = total > 0 ? (count / total) * 100 : 0;
    document.getElementById(`count${star}`).innerText = count;
    document.getElementById(`bar${star}`).style.width = `${percent}%`;
  });
}

function renderReviews(reviews) {
  allMovieReviews = reviews;
  reviewListWrap.innerHTML = "";

  if (!reviews.length) {
    reviewListWrap.innerHTML = `<div class="review-empty">No reviews yet. Be the first to review this movie.</div>`;
    return;
  }

  reviews.forEach(review => {
    const isOwn = currentUser && !currentUser.admin && Number(review.userId) === Number(currentUser.id);

    const avatarHtml = review.userProfileImage
      ? `<img class="review-avatar" src="${review.userProfileImage}" alt="${review.userFullName || review.username}" />`
      : `<div class="review-avatar-placeholder">${(review.userFullName || review.username || "U").charAt(0).toUpperCase()}</div>`;

    reviewListWrap.innerHTML += `
      <div class="review-item">
        <div class="review-top">
          ${avatarHtml}

          <div class="review-main">
            <div class="review-user-line">
              <span class="review-user-name">${review.userFullName || "User"}</span>
              <span class="review-username">@${review.username || "username"}</span>
              <span class="review-type-badge ${review.reviewType === "VERIFIED" ? "verified" : "public"}">
                ${review.reviewType === "VERIFIED" ? "Verified Review" : "Public Review"}
              </span>
            </div>

            <div class="review-stars-line">${renderStarString(review.rating || 0)}</div>
            <div class="review-date">${formatDateTime(review.updatedAt || review.createdAt)}</div>
            <div class="review-comment">${review.comment || ""}</div>

            ${isOwn ? `
              <div class="review-own-actions">
                <button type="button" onclick="startEditOwnReview(${review.id})">Edit</button>
                <button type="button" class="danger-btn" onclick="deleteOwnReview(${review.id})">Delete</button>
              </div>
            ` : ``}
          </div>
        </div>
      </div>
    `;
  });
}

async function loadMovieDetailsOnly() {
  currentMovieId = getMovieIdFromUrl();
  if (!currentMovieId) return;

  try {
    const response = await fetch(`${MOVIE_API}/${currentMovieId}`);
    if (!response.ok) throw new Error("Movie not found");

    currentMovie = await response.json();

    const poster = currentMovie.posterImage && currentMovie.posterImage.trim() !== ""
      ? currentMovie.posterImage
      : "https://via.placeholder.com/300x450?text=No+Poster";

    document.getElementById("detailPoster").src = poster;
    document.getElementById("detailCategory").innerText = (currentMovie.category || "").replaceAll("_", " ");
    document.getElementById("detailTitle").innerText = currentMovie.title || "";
    document.getElementById("detailDescription").innerText = currentMovie.description || "No description available";
    document.getElementById("detailGenre").innerText = currentMovie.genre || "";
    document.getElementById("detailLanguage").innerText = currentMovie.language || "";
    document.getElementById("detailReleaseDate").innerText = currentMovie.releaseDate || "";
    document.getElementById("detailShowTimes").innerText = currentMovie.showTimes || "";

    document.getElementById("detailsName").innerText = currentMovie.title || "";
    document.getElementById("detailsGenre").innerText = currentMovie.genre || "";
    document.getElementById("detailsLanguage").innerText = currentMovie.language || "";
    document.getElementById("detailsReleaseDate").innerText = currentMovie.releaseDate || "";
    document.getElementById("detailsShowTimes").innerText = currentMovie.showTimes || "";

    document.getElementById("bookTicketsBtn").onclick = function () {
      goToBooking(currentMovie.id);
    };

    const gallery = document.getElementById("movieGallery");
    gallery.innerHTML = "";

    if (currentMovie.moviePhotos && currentMovie.moviePhotos.length > 0) {
      gallery.innerHTML = currentMovie.moviePhotos
        .map(photo => `<img src="${photo}" alt="Movie screenshot" />`)
        .join("");
    } else {
      gallery.innerHTML = `<p>No screenshots uploaded for this movie.</p>`;
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadReviewSummary() {
  try {
    const response = await fetch(`${REVIEW_API}/movie/${currentMovieId}/summary`);
    if (!response.ok) throw new Error("Failed to load review summary");

    const summary = await response.json();
    renderReviewSummary(summary);
  } catch (error) {
    reviewListMessage.className = "message error";
    reviewListMessage.innerText = error.message;
  }
}

async function loadMovieReviews() {
  try {
    const response = await fetch(`${REVIEW_API}/movie/${currentMovieId}`);
    if (!response.ok) throw new Error("Failed to load reviews");

    const reviews = await response.json();
    renderReviews(reviews);
  } catch (error) {
    reviewListMessage.className = "message error";
    reviewListMessage.innerText = error.message;
  }
}

async function loadOwnReviewIfAny() {
  currentUser = getLoggedInUser();

  if (!currentUser || currentUser.admin) {
    reviewLoginHint.style.display = "block";
    reviewForm.style.display = "none";
    return;
  }

  reviewLoginHint.style.display = "none";
  reviewForm.style.display = "block";

  try {
    const response = await fetch(`${REVIEW_API}/user/${currentUser.id}/movie/${currentMovieId}`);

    if (response.ok) {
      const review = await response.json();
      fillReviewForm(review);
    } else {
      resetReviewForm();
    }
  } catch (error) {
    resetReviewForm();
  }
}

reviewForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!currentUser || currentUser.admin) {
    reviewFormMessage.className = "message error";
    reviewFormMessage.innerText = "Only normal users can submit reviews.";
    return;
  }

  const rating = Number(reviewRatingInput.value);
  const comment = reviewCommentInput.value.trim();

  if (!rating || rating < 1 || rating > 5) {
    reviewFormMessage.className = "message error";
    reviewFormMessage.innerText = "Please select a rating between 1 and 5.";
    return;
  }

  if (!comment) {
    reviewFormMessage.className = "message error";
    reviewFormMessage.innerText = "Please write a comment.";
    return;
  }

  try {
    let response;

    if (reviewIdInput.value) {
      response = await fetch(`${REVIEW_API}/${reviewIdInput.value}?requestUserId=${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rating,
          comment
        })
      });
    } else {
      response = await fetch(REVIEW_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: currentUser.id,
          movieId: Number(currentMovieId),
          rating,
          comment
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to save review");
    }

    reviewFormMessage.className = "message success";
    reviewFormMessage.innerText = reviewIdInput.value ? "Review updated successfully" : "Review submitted successfully";

    await loadOwnReviewIfAny();
    await loadReviewSummary();
    await loadMovieReviews();
  } catch (error) {
    reviewFormMessage.className = "message error";
    reviewFormMessage.innerText = error.message;
  }
});

async function deleteOwnReviewById(reviewId) {
  if (!currentUser || currentUser.admin) return;

  const confirmed = confirm("Delete your review?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${REVIEW_API}/${reviewId}?requestUserId=${currentUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete review");
    }

    reviewFormMessage.className = "message success";
    reviewFormMessage.innerText = "Review deleted successfully";

    resetReviewForm();
    await loadReviewSummary();
    await loadMovieReviews();
  } catch (error) {
    reviewFormMessage.className = "message error";
    reviewFormMessage.innerText = error.message;
  }
}

function startEditOwnReview(reviewId) {
  const review = allMovieReviews.find(item => Number(item.id) === Number(reviewId));
  if (!review) return;

  fillReviewForm(review);
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

cancelEditReviewBtn.addEventListener("click", function () {
  resetReviewForm();
  loadOwnReviewIfAny();
});

deleteOwnReviewBtn.addEventListener("click", function () {
  if (reviewIdInput.value) {
    deleteOwnReviewById(reviewIdInput.value);
  }
});

ratingPicker.querySelectorAll(".rating-star-btn").forEach(button => {
  button.addEventListener("click", function () {
    const value = Number(button.dataset.value);
    setSelectedRating(value);
  });
});

window.startEditOwnReview = startEditOwnReview;
window.deleteOwnReview = deleteOwnReviewById;

async function initMovieDetailsPage() {
  await loadMovieDetailsOnly();
  await loadReviewSummary();
  await loadMovieReviews();
  await loadOwnReviewIfAny();
}

window.addEventListener("load", initMovieDetailsPage);