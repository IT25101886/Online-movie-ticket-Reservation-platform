const adminReviewTableBody = document.getElementById("adminReviewTableBody");
const adminReviewMessage = document.getElementById("adminReviewMessage");
const reviewSearchInput = document.getElementById("reviewSearchInput");
const reviewTypeFilter = document.getElementById("reviewTypeFilter");
const totalReviewsCount = document.getElementById("totalReviewsCount");
const refreshReviewsBtn = document.getElementById("refreshReviewsBtn");

let allReviews = [];

function canManageReviews() {
  const user = getLoggedInUser();
  return user && user.admin && (
    user.adminPermission === "REVIEW_MANAGER" ||
    user.adminPermission === "ADMIN_MANAGER"
  );
}

function renderAdminStarString(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function formatDateTime(dateTimeText) {
  if (!dateTimeText) return "-";
  return dateTimeText.replace("T", " ");
}

function renderAdminReviews(reviews) {
  adminReviewTableBody.innerHTML = "";
  totalReviewsCount.innerText = reviews.length;

  if (!reviews.length) {
    adminReviewTableBody.innerHTML = `<tr><td colspan="8">No reviews found</td></tr>`;
    return;
  }

  reviews.forEach(review => {
    adminReviewTableBody.innerHTML += `
      <tr>
        <td>#${review.id}</td>
        <td>${review.movieTitle || "-"}</td>
        <td>${review.userFullName || "-"}<br><span style="color:#999;">@${review.username || "-"}</span></td>
        <td><span class="review-admin-stars">${renderAdminStarString(review.rating || 0)}</span></td>
        <td>
          <span class="review-type-badge ${review.reviewType === "VERIFIED" ? "verified" : "public"}">
            ${review.reviewType}
          </span>
        </td>
        <td class="review-comment-compact">${review.comment || ""}</td>
        <td>${formatDateTime(review.updatedAt || review.createdAt)}</td>
        <td>
          <button type="button" class="danger-btn" onclick="adminDeleteReview(${review.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function applyReviewFilters() {
  const keyword = reviewSearchInput.value.trim().toLowerCase();
  const type = reviewTypeFilter.value;

  const filtered = allReviews.filter(review => {
    const matchKeyword =
      !keyword ||
      review.movieTitle?.toLowerCase().includes(keyword) ||
      review.userFullName?.toLowerCase().includes(keyword) ||
      review.username?.toLowerCase().includes(keyword) ||
      review.comment?.toLowerCase().includes(keyword);

    const matchType = !type || review.reviewType === type;
    return matchKeyword && matchType;
  });

  renderAdminReviews(filtered);
}

async function loadAdminReviews() {
  const loggedUser = getLoggedInUser();

  if (!canManageReviews()) {
    adminReviewMessage.className = "message error";
    adminReviewMessage.innerText = "Only REVIEW_MANAGER can access this page.";
    return;
  }

  try {
    const response = await fetch(`${REVIEW_API}/admin/all?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Failed to load reviews");

    allReviews = await response.json();
    renderAdminReviews(allReviews);

    adminReviewMessage.className = "message success";
    adminReviewMessage.innerText = "Reviews loaded successfully";
  } catch (error) {
    adminReviewMessage.className = "message error";
    adminReviewMessage.innerText = error.message;
  }
}

async function adminDeleteReview(reviewId) {
  const loggedUser = getLoggedInUser();
  const confirmed = confirm("Delete this review?");
  if (!confirmed) return;

  try {
    const response = await fetch(`${REVIEW_API}/admin/${reviewId}?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to delete review");
    }

    adminReviewMessage.className = "message success";
    adminReviewMessage.innerText = "Review deleted successfully";

    await loadAdminReviews();
  } catch (error) {
    adminReviewMessage.className = "message error";
    adminReviewMessage.innerText = error.message;
  }
}

reviewSearchInput.addEventListener("input", applyReviewFilters);
reviewTypeFilter.addEventListener("change", applyReviewFilters);
refreshReviewsBtn.addEventListener("click", loadAdminReviews);

window.adminDeleteReview = adminDeleteReview;

window.addEventListener("load", loadAdminReviews);