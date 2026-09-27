const API_URL = "http://localhost:3000/api/employees";
const token = localStorage.getItem("token");

const messageBox = document.getElementById("message");
const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.getElementById("employeeTableBody");

if (!token) {
  window.location.href = "index.html";
}

function showMessage(message, type = "success") {
  messageBox.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

async function loadEmployees() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    employeeTableBody.innerHTML = result.data.map((employee) => `
      <tr>
        <td>${employee.EmployeeId}</td>
        <td>${employee.FullName}</td>
        <td>${employee.Position}</td>
        <td>${employee.Phone || ""}</td>
        <td>${employee.Email || ""}</td>
        <td>
          <span class="badge ${employee.IsActive ? "text-bg-success" : "text-bg-secondary"}">
            ${employee.IsActive ? "Đang hoạt động" : "Ngừng hoạt động"}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    showMessage(error.message || "Không thể tải danh sách nhân viên", "danger");
  }
}

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    fullName: document.getElementById("fullName").value.trim(),
    position: document.getElementById("position").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    specialty: document.getElementById("specialty").value.trim()
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || result.message);
    }

    showMessage(result.message);
    employeeForm.reset();
    loadEmployees();
  } catch (error) {
    showMessage(error.message || "Không thể thêm nhân viên", "danger");
  }
});

loadEmployees();