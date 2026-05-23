const adminTableBody = document.getElementById("adminTableBody");
const adminListMessage = document.getElementById("message");
const loadAdminsBtn = document.getElementById("loadAdminsBtn");
const searchAdminForm = document.getElementById("searchAdminForm");
const searchAdminUsername = document.getElementById("searchAdminUsername");

function isAdminManager() {
  const user = getLoggedInUser();
  return user && user.admin && user.adminPermission === "ADMIN_MANAGER";
}

function renderAdmins(admins) {
  adminTableBody.innerHTML = "";

  if (!admins || admins.length === 0) {
    adminTableBody.innerHTML = `<tr><td colspan="8">No admins found</td></tr>`;
    return;
  }

  admins.forEach(admin => {
    const statusText = admin.active ? "ACTIVE" : "INACTIVE";
    const statusClass = admin.active ? "status-active" : "status-inactive";

    adminTableBody.innerHTML += `
      <tr>
        <td>${admin.id}</td>
        <td>${admin.fullName}</td>
        <td>${admin.username}</td>
        <td>${admin.email}</td>
        <td>${admin.phone}</td>
        <td>${admin.role || admin.adminPermission}</td>
        <td class="${statusClass}">${statusText}</td>
        <td>
          <button class="small-btn" onclick="goToEditAdmin(${admin.id})">Edit</button>
          <button class="small-btn" onclick="deleteAdmin(${admin.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

async function loadAdmins() {
  const loggedUser = getLoggedInUser();

  if (!isAdminManager()) {
    adminListMessage.className = "message error";
    adminListMessage.innerText = "Only ADMIN_MANAGER can view admin list.";
    return;
  }

  try {
    const response = await fetch(`${ADMIN_API}?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Failed to load admins");

    const admins = await response.json();
    renderAdmins(admins);

    adminListMessage.className = "message success";
    adminListMessage.innerText = "Admins loaded successfully";
  } catch (error) {
    adminListMessage.className = "message error";
    adminListMessage.innerText = error.message;
  }
}

searchAdminForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();

  if (!isAdminManager()) {
    adminListMessage.className = "message error";
    adminListMessage.innerText = "Only ADMIN_MANAGER can search admins.";
    return;
  }

  const username = searchAdminUsername.value.trim();
  if (!username) return;

  try {
    const response = await fetch(`${ADMIN_API}/search?performedByAdminId=${loggedUser.id}&username=${encodeURIComponent(username)}`);
    if (!response.ok) throw new Error("Search failed");

    const admins = await response.json();
    renderAdmins(admins);

    adminListMessage.className = "message success";
    adminListMessage.innerText = "Admin search completed";
  } catch (error) {
    adminListMessage.className = "message error";
    adminListMessage.innerText = error.message;
  }
});

function goToEditAdmin(adminId) {
  localStorage.setItem("editAdminId", adminId);
  window.location.href = "update-admin.html";
}

async function deleteAdmin(adminId) {
  const loggedUser = getLoggedInUser();

  try {
    const response = await fetch(`${ADMIN_API}/${adminId}?performedByAdminId=${loggedUser.id}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Delete failed");
    }

    adminListMessage.className = "message success";
    adminListMessage.innerText = "Admin deleted successfully";
    loadAdmins();
  } catch (error) {
    adminListMessage.className = "message error";
    adminListMessage.innerText = error.message;
  }
}

loadAdminsBtn.addEventListener("click", loadAdmins);
window.addEventListener("load", loadAdmins);