const profileMessage = document.getElementById("message");
const deleteBtn = document.getElementById("deleteBtn");
const openEditModalBtn = document.getElementById("openEditModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const closeModalOverlay = document.getElementById("closeModalOverlay");
const profileForm = document.getElementById("profileForm");
const profileImageFile = document.getElementById("profileImageFile");
const editProfileModal = document.getElementById("editProfileModal");

let currentUserData = null;
let selectedProfileImage = null;

function placeholderImage(name = "U") {
  return `https://via.placeholder.com/120?text=${encodeURIComponent(name.charAt(0).toUpperCase())}`;
}

function openModal() {
  editProfileModal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal() {
  editProfileModal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function setImageOrPlaceholder(elementId, image, name) {
  const el = document.getElementById(elementId);
  el.src = image && image.trim() !== "" ? image : placeholderImage(name || "U");
}

function renderProfileView(user) {
  currentUserData = user;

  setImageOrPlaceholder("profileMainImage", user.profileImage, user.fullName);

  document.getElementById("profileName").innerText = user.fullName || "";
  document.getElementById("profileUsername").innerText = `@${user.username || ""}`;
  document.getElementById("profileRoleBadge").innerText = (user.role || "USER").replaceAll("_", " ");

  document.getElementById("viewUserId").innerText = user.id || "";
  document.getElementById("viewFullName").innerText = user.fullName || "";
  document.getElementById("viewUsername").innerText = user.username || "";
  document.getElementById("viewEmail").innerText = user.email || "";
  document.getElementById("viewPhone").innerText = user.phone || "";
  document.getElementById("viewRole").innerText = (user.role || "USER").replaceAll("_", " ");
  document.getElementById("viewStatus").innerText = user.active ? "Active" : "Inactive";
}

function loadUserIntoModal(user) {
  document.getElementById("userId").value = user.id || "";
  document.getElementById("fullName").value = user.fullName || "";
  document.getElementById("email").value = user.email || "";
  document.getElementById("password").value = user.password || "";
  document.getElementById("phone").value = user.phone || "";

  document.getElementById("modalDisplayName").innerText = user.fullName || "";
  document.getElementById("modalDisplayRole").innerText = (user.role || "USER").replaceAll("_", " ");
  selectedProfileImage = user.profileImage || null;

  setImageOrPlaceholder("profilePreview", selectedProfileImage, user.fullName);
}

async function fetchCurrentUserDetails() {
  const loggedUser = getLoggedInUser();

  if (!loggedUser || !loggedUser.id) {
    profileMessage.className = "message error";
    profileMessage.innerText = "Please login first.";
    return;
  }

  try {
    const response = await fetch(`${USER_API}/${loggedUser.id}`);
    if (!response.ok) {
      throw new Error("Failed to load current user details");
    }

    const freshUser = await response.json();
    localStorage.setItem("loggedInUser", JSON.stringify(freshUser));

    renderProfileView(freshUser);
    loadUserIntoModal(freshUser);

    if (typeof renderLayout === "function") {
      renderLayout();
    }

    profileMessage.className = "message success";
    profileMessage.innerText = "Current profile loaded";
  } catch (error) {
    profileMessage.className = "message error";
    profileMessage.innerText = error.message;
  }
}

profileImageFile.addEventListener("change", function () {
  const file = profileImageFile.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    selectedProfileImage = e.target.result;
    setImageOrPlaceholder("profilePreview", selectedProfileImage, currentUserData?.fullName || "U");
  };
  reader.readAsDataURL(file);
});

openEditModalBtn.addEventListener("click", function () {
  if (currentUserData) {
    loadUserIntoModal(currentUserData);
    openModal();
  }
});

closeModalBtn.addEventListener("click", closeModal);
cancelEditBtn.addEventListener("click", closeModal);
closeModalOverlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !editProfileModal.classList.contains("hidden")) {
    closeModal();
  }
});

profileForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userId = document.getElementById("userId").value;

  if (!userId) {
    profileMessage.className = "message error";
    profileMessage.innerText = "User ID not found";
    return;
  }

  const updatedData = {
    fullName: document.getElementById("fullName").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    profileImage: selectedProfileImage
  };

  try {
    const response = await fetch(`${USER_API}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Update failed");
    }

    const updatedUser = await response.json();
    localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

    currentUserData = updatedUser;
    renderProfileView(updatedUser);
    loadUserIntoModal(updatedUser);

    if (typeof renderLayout === "function") {
      renderLayout();
    }

    profileMessage.className = "message success";
    profileMessage.innerText = "Profile updated successfully";

    closeModal();
  } catch (error) {
    profileMessage.className = "message error";
    profileMessage.innerText = error.message;
  }
});

deleteBtn.addEventListener("click", async function () {
  if (!currentUserData?.id) {
    profileMessage.className = "message error";
    profileMessage.innerText = "User ID not found";
    return;
  }

  const confirmDelete = confirm("Are you sure you want to delete this account?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${USER_API}/${currentUserData.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Delete failed");
    }

    localStorage.removeItem("loggedInUser");

    profileMessage.className = "message success";
    profileMessage.innerText = "Account deleted successfully";

    setTimeout(() => {
      window.location.href = "register.html";
    }, 700);
  } catch (error) {
    profileMessage.className = "message error";
    profileMessage.innerText = error.message;
  }
});

window.addEventListener("load", fetchCurrentUserDetails);