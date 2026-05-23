const searchUsernameForm = document.getElementById("searchUsernameForm");
const searchIdForm = document.getElementById("searchIdForm");
const searchUsername = document.getElementById("searchUsername");
const searchUserId = document.getElementById("searchUserId");
const loadAllBtn = document.getElementById("loadAllBtn");
const userTableBody = document.getElementById("userTableBody");
const usersMessage = document.getElementById("message");
const totalUsersCount = document.getElementById("totalUsersCount");

const userDetailsModal = document.getElementById("userDetailsModal");
const closeUserModalBtn = document.getElementById("closeUserModalBtn");
const closeUserModalOverlay = document.getElementById("closeUserModalOverlay");
const deactivateUserBtn = document.getElementById("deactivateUserBtn");

let selectedUserId = null;
let selectedUserActive = false;

function isUserManager() {
  const user = getLoggedInUser();
  return user && user.admin && user.adminPermission === "USER_MANAGER";
}

function placeholderImage(name = "U") {
  return `https://via.placeholder.com/80?text=${encodeURIComponent(name.charAt(0).toUpperCase())}`;
}

function openUserModal() {
  userDetailsModal.classList.remove("hidden");
}

function closeUserModal() {
  userDetailsModal.classList.add("hidden");
}

function updateTotalCount(users) {
  totalUsersCount.innerText = users.length;
}

function renderUsers(users) {
  userTableBody.innerHTML = "";

  if (!users || users.length === 0) {
    userTableBody.innerHTML = `<tr><td colspan="7">No normal users found</td></tr>`;
    updateTotalCount([]);
    return;
  }

  updateTotalCount(users);

  users.forEach(user => {
    const statusClass = user.active ? "status-pill active" : "status-pill inactive";
    const statusText = user.active ? "Active" : "Inactive";
    const image = user.profileImage && user.profileImage.trim() !== ""
      ? user.profileImage
      : placeholderImage(user.fullName || "U");

    userTableBody.innerHTML += `
      <tr>
        <td>
          <div class="user-name-cell">
            <img src="${image}" class="table-avatar" alt="avatar" />
            <span>${user.fullName || ""}</span>
          </div>
        </td>
        <td>${user.username || ""}</td>
        <td>${user.email || ""}</td>
        <td>${user.phone || ""}</td>
        <td><span class="role-pill">${(user.role || "USER").replaceAll("_", " ")}</span></td>
        <td><span class="${statusClass}">${statusText}</span></td>
        <td>
          <button class="small-btn" type="button" onclick="viewUserDetails(${user.id})">View</button>
        </td>
      </tr>
    `;
  });
}

function fillUserDetailsModal(user) {
  selectedUserId = user.id;
  selectedUserActive = user.active;

  const image = user.profileImage && user.profileImage.trim() !== ""
    ? user.profileImage
    : placeholderImage(user.fullName || "U");

  document.getElementById("detailUserImage").src = image;
  document.getElementById("detailFullName").innerText = user.fullName || "";
  document.getElementById("detailUsername").innerText = `@${user.username || ""}`;
  document.getElementById("detailRole").innerText = (user.role || "USER").replaceAll("_", " ");
  document.getElementById("detailId").innerText = user.id || "";
  document.getElementById("detailEmail").innerText = user.email || "";
  document.getElementById("detailPhone").innerText = user.phone || "";
  document.getElementById("detailRoleText").innerText = (user.role || "USER").replaceAll("_", " ");
  document.getElementById("detailStatus").innerText = user.active ? "Active" : "Inactive";

  if (user.active) {
    deactivateUserBtn.style.display = "inline-flex";
  } else {
    deactivateUserBtn.style.display = "none";
  }
}

async function loadAllUsers() {
  if (!isUserManager()) {
    usersMessage.className = "message error";
    usersMessage.innerText = "Only USER_MANAGER can view normal users.";
    return;
  }

  try {
    const response = await fetch(`${USER_API}/customers`);
    if (!response.ok) throw new Error("Failed to load users");

    const users = await response.json();
    renderUsers(users);

    usersMessage.className = "message success";
    usersMessage.innerText = "Normal users loaded successfully";
  } catch (error) {
    usersMessage.className = "message error";
    usersMessage.innerText = error.message;
  }
}

async function viewUserDetails(userId) {
  if (!isUserManager()) {
    usersMessage.className = "message error";
    usersMessage.innerText = "Access denied";
    return;
  }

  try {
    const response = await fetch(`${USER_API}/customers/${userId}`);
    if (!response.ok) throw new Error("User not found");

    const user = await response.json();
    fillUserDetailsModal(user);
    openUserModal();
  } catch (error) {
    usersMessage.className = "message error";
    usersMessage.innerText = error.message;
  }
}

async function deactivateSelectedUser() {
  if (!selectedUserId || !selectedUserActive) return;

  try {
    const response = await fetch(`${USER_API}/customers/${selectedUserId}/status?active=false`, {
      method: "PUT"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to deactivate user");
    }

    usersMessage.className = "message success";
    usersMessage.innerText = `User ${selectedUserId} deactivated successfully`;

    closeUserModal();
    loadAllUsers();
  } catch (error) {
    usersMessage.className = "message error";
    usersMessage.innerText = error.message;
  }
}

searchUsernameForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!isUserManager()) {
    usersMessage.className = "message error";
    usersMessage.innerText = "Only USER_MANAGER can search users.";
    return;
  }

  const username = searchUsername.value.trim();
  if (!username) return;

  try {
    const response = await fetch(`${USER_API}/customers/search?username=${encodeURIComponent(username)}`);
    if (!response.ok) throw new Error("Search failed");

    const users = await response.json();
    renderUsers(users);

    usersMessage.className = "message success";
    usersMessage.innerText = "Search by username completed";
  } catch (error) {
    usersMessage.className = "message error";
    usersMessage.innerText = error.message;
  }
});

searchIdForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!isUserManager()) {
    usersMessage.className = "message error";
    usersMessage.innerText = "Only USER_MANAGER can search users.";
    return;
  }

  const id = searchUserId.value.trim();
  if (!id) return;

  try {
    const response = await fetch(`${USER_API}/customers/${id}`);
    if (!response.ok) throw new Error("User not found");

    const user = await response.json();
    renderUsers([user]);

    usersMessage.className = "message success";
    usersMessage.innerText = "Search by ID completed";
  } catch (error) {
    usersMessage.className = "message error";
    usersMessage.innerText = error.message;
  }
});

deactivateUserBtn.addEventListener("click", deactivateSelectedUser);
closeUserModalBtn.addEventListener("click", closeUserModal);
closeUserModalOverlay.addEventListener("click", closeUserModal);

loadAllBtn.addEventListener("click", loadAllUsers);
window.addEventListener("load", loadAllUsers);