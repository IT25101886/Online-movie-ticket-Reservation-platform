const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("message");

loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const loginData = {
    username: document.getElementById("username").value,
    password: document.getElementById("password").value
  };

  try {
    const response = await fetch(`${USER_API}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

    const user = await response.json();
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    loginMessage.className = "message success";
    loginMessage.innerText = "Login successful";

    setTimeout(() => {
      if (!user.admin) {
        window.location.href = "../../index.html";
        return;
      }

      switch (user.adminPermission) {
        case "ADMIN_MANAGER":
          window.location.href = "../admin/admin-manager-dashboard.html";
          break;
        case "USER_MANAGER":
          window.location.href = "../admin/user-manager-dashboard.html";
          break;
        case "MOVIE_MANAGER":
          window.location.href = "../admin/movie-manager-dashboard.html";
          break;
        case "TICKET_MANAGER":
          window.location.href = "../admin/ticket-manager-dashboard.html";
          break;
        case "PAYMENT_MANAGER":
          window.location.href = "../admin/payment-manager-dashboard.html";
          break;
        case "REVIEW_MANAGER":
          window.location.href = "../admin/review-manager-dashboard.html";
          break;
        default:
          window.location.href = "../../index.html";
      }
    }, 700);
  } catch (error) {
    loginMessage.className = "message error";
    loginMessage.innerText = error.message;
  }
});