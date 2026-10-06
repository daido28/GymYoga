const API_BASE_URL = "/api";
const token = localStorage.getItem("token");

const messageBox = document.getElementById("message");
const scheduleForm = document.getElementById("scheduleForm");
const employeeSelect = document.getElementById("employeeId");
const shiftSelect = document.getElementById("shiftId");
const scheduleTableBody = document.getElementById("scheduleTableBody");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let schedules = [];
let editingScheduleId = null;

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

function formatTime(value) {
  if (!value) {
    return "";
  }

  return value.includes("T")
    ? value.substring(11, 16)
    : value.substring(0, 5);
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  return value.substring(0, 10).split("-").reverse().join("/");
}

function formatDateInput(value) {
  return value ? value.substring(0, 10) : "";
}

function resetForm() {
  editingScheduleId = null;
  scheduleForm.reset();
  formTitle.textContent = "Tạo phân công";
  submitButton.textContent = "Phân công ca";
  cancelEditButton.hidden = true;
}

async function fetchData(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || result.message);
  }

  return result.data;
}

async function loadFormOptions() {
  try {
    const [employees, shifts] = await Promise.all([
      fetchData("/employees"),
      fetchData("/shifts")
    ]);

    const activeEmployees = employees.filter((employee) => employee.IsActive);
    const activeShifts = shifts.filter((shift) => shift.IsActive);

    employeeSelect.innerHTML = `
      <option value="">-- Chọn nhân viên --</option>
      ${activeEmployees.map((employee) => `
        <option value="${employee.EmployeeId}">
          ${employee.FullName} - ${employee.Position}
        </option>
      `).join("")}
    `;

    shiftSelect.innerHTML = `
      <option value="">-- Chọn ca làm --</option>
      ${activeShifts.map((shift) => `
        <option value="${shift.ShiftId}">
          ${shift.ShiftName} (${formatTime(shift.StartTime)} - ${formatTime(shift.EndTime)})
        </option>
      `).join("")}
    `;
  } catch (error) {
    showMessage(error.message || "Không thể tải dữ liệu biểu mẫu", "danger");
  }
}

function renderSchedules() {
  scheduleTableBody.innerHTML = schedules.map((schedule) => `
    <tr>
      <td>${formatDate(schedule.WorkDate)}</td>
      <td>${schedule.FullName}</td>
      <td>${schedule.ShiftName}</td>
      <td>${formatTime(schedule.StartTime)} - ${formatTime(schedule.EndTime)}</td>
      <td>
        <span class="badge text-bg-success">${schedule.Status}</span>
      </td>
      <td>${schedule.Note || ""}</td>
      <td class="d-flex gap-1">
        <button
          class="btn btn-sm btn-outline-primary"
          onclick="editSchedule(${schedule.ScheduleId})"
        >
          Sửa
        </button>

        <button
          class="btn btn-sm btn-outline-danger"
          onclick="deleteSchedule(${schedule.ScheduleId})"
        >
          Hủy
        </button>
      </td>
    </tr>
  `).join("");
}

async function loadSchedules() {
  try {
    schedules = await fetchData("/schedules");
    renderSchedules();
  } catch (error) {
    showMessage(error.message || "Không thể tải lịch phân công", "danger");
  }
}

window.editSchedule = (scheduleId) => {
  const schedule = schedules.find(
    (item) => Number(item.ScheduleId) === Number(scheduleId)
  );

  if (!schedule) {
    return;
  }

  editingScheduleId = schedule.ScheduleId;
  employeeSelect.value = schedule.EmployeeId;
  shiftSelect.value = schedule.ShiftId;
  document.getElementById("workDate").value = formatDateInput(schedule.WorkDate);
  document.getElementById("note").value = schedule.Note || "";

  formTitle.textContent = `Cập nhật phân công: ${schedule.FullName}`;
  submitButton.textContent = "Lưu thay đổi";
  cancelEditButton.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteSchedule = async (scheduleId) => {
  if (!confirm("Bạn có chắc muốn hủy phân công này?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message);
    }

    showMessage(result.message);
    loadSchedules();
  } catch (error) {
    showMessage(error.message || "Không thể hủy phân công", "danger");
  }
};

scheduleForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    employeeId: Number(employeeSelect.value),
    shiftId: Number(shiftSelect.value),
    workDate: document.getElementById("workDate").value,
    note: document.getElementById("note").value.trim()
  };

  const isEditing = editingScheduleId !== null;
  const url = isEditing
    ? `${API_BASE_URL}/schedules/${editingScheduleId}`
    : `${API_BASE_URL}/schedules`;

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
    loadSchedules();
  } catch (error) {
    showMessage(error.message || "Không thể lưu phân công", "danger");
  }
});

cancelEditButton.addEventListener("click", resetForm);

loadFormOptions();
loadSchedules();