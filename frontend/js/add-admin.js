const addAdminForm = document.getElementById("addAdminForm");
const addAdminMessage = document.getElementById("message");

addAdminForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();

  if (!loggedUser || !loggedUser.admin || loggedUser.adminPermission !== "ADMIN_MANAGER") {
    addAdminMessage.className = "message error";
    addAdminMessage.innerText = "Only ADMIN_MANAGER can create admins.";
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
    const response = await fetch(`${ADMIN_API}?performedByAdminId=${loggedUser.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create admin");
    }

    const result = await response.json();

    addAdminMessage.className = "message success";
    addAdminMessage.innerText = `Admin created successfully. ID: ${result.id}`;
    addAdminForm.reset();
  } catch (error) {
    addAdminMessage.className = "message error";
    addAdminMessage.innerText = error.message;
  }
});