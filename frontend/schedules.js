const API_BASE_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

const messageBox = document.getElementById("message");
const scheduleForm = document.getElementById("scheduleForm");
const employeeSelect = document.getElementById("employeeId");
const shiftSelect = document.getElementById("shiftId");
const scheduleTableBody = document.getElementById("scheduleTableBody");

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
  return value ? value.substring(11, 16) : "";
}

function formatDate(value) {
  return value ? value.substring(0, 10).split("-").reverse().join("/") : "";
}

async function fetchData(endpoint) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Không thể tải dữ liệu");
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
    showMessage(error.message, "danger");
  }
}

async function loadSchedules() {
  try {
    const schedules = await fetchData("/schedules");

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
      </tr>
    `).join("");
  } catch (error) {
    showMessage(error.message, "danger");
  }
}

scheduleForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    employeeId: Number(employeeSelect.value),
    shiftId: Number(shiftSelect.value),
    workDate: document.getElementById("workDate").value,
    note: document.getElementById("note").value.trim()
  };

  try {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Không thể phân công ca");
    }

    showMessage(result.message);
    scheduleForm.reset();
    loadSchedules();
  } catch (error) {
    showMessage(error.message, "danger");
  }
});

loadFormOptions();
loadSchedules();