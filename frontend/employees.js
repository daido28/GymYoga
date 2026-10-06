const API_URL = "/api/employees";
const token = localStorage.getItem("token");

const messageBox = document.getElementById("message");
const employeeForm = document.getElementById("employeeForm");
const employeeTableBody = document.getElementById("employeeTableBody");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");
const searchInput = document.getElementById("searchInput");
let employees = [];
let editingEmployeeId = null;

if (!token) {
  window.location.href = "index.html";
}

function showMessage(message, type = "success") {
  messageBox.innerHTML = `
    <div class="alert alert-${type}">
      ${message}
    </div>
  `;
}

function resetForm() {
  editingEmployeeId = null;
  employeeForm.reset();
  formTitle.textContent = "Thêm nhân viên";
  submitButton.textContent = "Thêm nhân viên";
  cancelEditButton.hidden = true;
}

function renderEmployees() {
  employeeTableBody.innerHTML = employees.map((employee) => {
    const statusButton = employee.UserId
      ? `<span class="text-secondary small">Tài khoản hệ thống</span>`
      : `
        <button
          class="btn btn-sm ${employee.IsActive ? "btn-outline-danger" : "btn-outline-success"}"
          onclick="changeEmployeeStatus(${employee.EmployeeId}, ${!employee.IsActive})"
        >
          ${employee.IsActive ? "Ngừng hoạt động" : "Kích hoạt"}
        </button>
      `;

    return `
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
        <td class="d-flex gap-1">
          <button
            class="btn btn-sm btn-outline-primary"
            onclick="editEmployee(${employee.EmployeeId})"
          >
            Sửa
          </button>
          ${statusButton}
        </td>
      </tr>
    `;
  }).join("");
}

async function loadEmployees() {
  try {
    const search = searchInput.value.trim();

    const response = await fetch(
      `${API_URL}?search=${encodeURIComponent(search)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message);
    }

    employees = result.data;
    renderEmployees();
  } catch (error) {
    showMessage(error.message || "Không thể tải danh sách nhân viên", "danger");
  }
}

window.editEmployee = (employeeId) => {
  const employee = employees.find(
    (item) => Number(item.EmployeeId) === Number(employeeId)
  );
  if (!employee) {
    return;
  }

  editingEmployeeId = employee.EmployeeId;

  document.getElementById("fullName").value = employee.FullName || "";
  document.getElementById("position").value = employee.Position || "";
  document.getElementById("phone").value = employee.Phone || "";
  document.getElementById("email").value = employee.Email || "";
  document.getElementById("specialty").value = employee.Specialty || "";

  formTitle.textContent = `Cập nhật nhân viên: ${employee.FullName}`;
  submitButton.textContent = "Lưu thay đổi";
  cancelEditButton.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.changeEmployeeStatus = async (employeeId, isActive) => {
  const action = isActive ? "kích hoạt" : "ngừng hoạt động";

  if (!confirm(`Bạn có chắc muốn ${action} nhân viên này?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${employeeId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ isActive })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message);
    }

    showMessage(result.message);
    loadEmployees();
  } catch (error) {
    showMessage(error.message || "Không thể cập nhật trạng thái", "danger");
  }
};

employeeForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    fullName: document.getElementById("fullName").value.trim(),
    position: document.getElementById("position").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    specialty: document.getElementById("specialty").value.trim()
  };

  const isEditing = editingEmployeeId !== null;
  const url = isEditing ? `${API_URL}/${editingEmployeeId}` : API_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
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
    resetForm();
    loadEmployees();
  } catch (error) {
    showMessage(error.message || "Không thể lưu nhân viên", "danger");
  }
});

cancelEditButton.addEventListener("click", resetForm);

let searchTimeout;

searchInput.addEventListener("input", () => {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    loadEmployees();
  }, 300);
});
loadEmployees();