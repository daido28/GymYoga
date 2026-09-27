const API_URL = "http://localhost:3000/api/shifts";
const token = localStorage.getItem("token");

const shiftForm = document.getElementById("shiftForm");
const shiftTableBody = document.getElementById("shiftTableBody");
const messageBox = document.getElementById("message");

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

async function loadShifts() {
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

    shiftTableBody.innerHTML = result.data.map((shift) => `
      <tr>
        <td>${shift.ShiftCode}</td>
        <td>${shift.ShiftName}</td>
        <td>${formatTime(shift.StartTime)}</td>
        <td>${formatTime(shift.EndTime)}</td>
        <td>
          <span class="badge ${shift.IsActive ? "text-bg-success" : "text-bg-secondary"}">
            ${shift.IsActive ? "Đang áp dụng" : "Ngừng áp dụng"}
          </span>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    showMessage(error.message || "Không thể tải danh sách ca", "danger");
  }
}

shiftForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    shiftCode: document.getElementById("shiftCode").value.trim().toUpperCase(),
    shiftName: document.getElementById("shiftName").value.trim(),
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value
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
      throw new Error(result.message);
    }

    showMessage(result.message);
    shiftForm.reset();
    loadShifts();
  } catch (error) {
    showMessage(error.message || "Không thể tạo ca làm", "danger");
  }
});

loadShifts();