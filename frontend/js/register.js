const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("message");

registerForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const userData = {
    fullName: document.getElementById("fullName").value,
    username: document.getElementById("username").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value,
    phone: document.getElementById("phone").value,
    userType: document.getElementById("userType").value
  };

  try {
    const response = await fetch(`${USER_API}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Registration failed");
    }

    const result = await response.json();
    registerMessage.className = "message success";
    registerMessage.innerText = `User registered successfully. User ID: ${result.id}`;
    registerForm.reset();
  } catch (error) {
    registerMessage.className = "message error";
    registerMessage.innerText = error.message;
  }
});