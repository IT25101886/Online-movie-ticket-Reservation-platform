const permissionForm = document.getElementById("permissionForm");
const accountTypeSelect = document.getElementById("accountType");
const adminPermissionSelect = document.getElementById("adminPermission");
const permissionMessage = document.getElementById("message");

function toggleAdminPermissionField() {
  adminPermissionSelect.style.display = accountTypeSelect.value === "ADMIN" ? "block" : "none";
}

accountTypeSelect.addEventListener("change", toggleAdminPermissionField);
toggleAdminPermissionField();

permissionForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loggedUser = getLoggedInUser();

  if (!loggedUser || !loggedUser.admin || loggedUser.adminPermission !== "ADMIN_MANAGER") {
    permissionMessage.className = "message error";
    permissionMessage.innerText = "Only ADMIN_MANAGER can update permissions.";
    return;
  }

  const targetUserId = document.getElementById("targetUserId").value;

  const data = {
    accountType: accountTypeSelect.value,
    adminPermission: accountTypeSelect.value === "ADMIN" ? adminPermissionSelect.value : null
  };

  try {
    const response = await fetch(`${ADMIN_API}/${targetUserId}/permission?performedByAdminId=${loggedUser.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Permission update failed");
    }

    const updatedUser = await response.json();
    permissionMessage.className = "message success";
    permissionMessage.innerText = `User ${updatedUser.username} updated successfully`;
  } catch (error) {
    permissionMessage.className = "message error";
    permissionMessage.innerText = error.message;
  }
});