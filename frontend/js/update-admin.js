const loadAdminForm = document.getElementById("loadAdminForm");
const updateAdminForm = document.getElementById("updateAdminForm");
const updateAdminMessage = document.getElementById("message");

function canEditAdmins() {
  const user = getLoggedInUser();
  return user && user.admin && user.adminPermission === "ADMIN_MANAGER";
}

function fillAdminForm(admin) {
  document.getElementById("adminId").value = admin.id || "";
  document.getElementById("fullName").value = admin.fullName || "";
  document.getElementById("username").value = admin.username || "";
  document.getElementById("email").value = admin.email || "";
  document.getElementById("password").value = admin.password || "";
  document.getElementById("phone").value = admin.phone || "";
  document.getElementById("adminPermission").value = admin.adminPermission || "USER_MANAGER";
}

async function loadAdmin(adminId) {
  const loggedUser = getLoggedInUser();

  if (!canEditAdmins()) {
    updateAdminMessage.className = "message error";
    updateAdminMessage.innerText = "Only ADMIN_MANAGER can update admins.";
    return;
  }

  try {
    const response = await fetch(`${ADMIN_API}/${adminId}?performedByAdminId=${loggedUser.id}`);
    if (!response.ok) throw new Error("Admin not found");

    const admin = await response.json();
    fillAdminForm(admin);

    updateAdminMessage.className = "message success";
    updateAdminMessage.innerText = "Admin loaded successfully";
  } catch (error) {
    updateAdminMessage.className = "message error";
    updateAdminMessage.innerText = error.message;
  }
}

loadAdminForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const enteredId = document.getElementById("adminIdInput").value.trim();
  if (enteredId) {
    loadAdmin(enteredId);
  }
});

updateAdminForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();

  if (!canEditAdmins()) {
    updateAdminMessage.className = "message error";
    updateAdminMessage.innerText = "Only ADMIN_MANAGER can update admins.";
    return;
  }

  const adminId = document.getElementById("adminId").value;
  if (!adminId) {
    updateAdminMessage.className = "message error";
    updateAdminMessage.innerText = "Load an admin first.";
    return;
  }

  const data = {
    fullName: document.getElementById("fullName").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    adminPermission: document.getElementById("adminPermission").value
  };

  try {
    const response = await fetch(`${ADMIN_API}/${adminId}?performedByAdminId=${loggedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update admin");
    }

    const admin = await response.json();
    fillAdminForm(admin);

    updateAdminMessage.className = "message success";
    updateAdminMessage.innerText = "Admin updated successfully";
  } catch (error) {
    updateAdminMessage.className = "message error";
    updateAdminMessage.innerText = error.message;
  }
});

window.addEventListener("load", function () {
  const storedAdminId = localStorage.getItem("editAdminId");
  if (storedAdminId) {
    loadAdmin(storedAdminId);
    localStorage.removeItem("editAdminId");
  }
});