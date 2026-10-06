const loginForm = document.getElementById("loginForm");
const messageBox = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  messageBox.innerHTML = "";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const result = await response.json();

    if (!response.ok) {
      messageBox.innerHTML = `
        <div class="alert alert-danger">
          ${result.message || "Đăng nhập thất bại"}
        </div>
      `;
      return;
    }

    localStorage.removeItem("branchId");
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));

    messageBox.innerHTML = `
      <div class="alert alert-success">
        Đăng nhập thành công. Xin chào ${result.user.fullName}.
      </div>
    `;

    setTimeout(() => {
      window.location.href = "week5.html";
    }, 700);
  } catch (error) {
    messageBox.innerHTML = `
      <div class="alert alert-danger">
        Không thể kết nối Backend. Kiểm tra server Node.js đang chạy.
      </div>
    `;
  }
});
