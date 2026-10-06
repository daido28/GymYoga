const API_URL = "/api/shifts";
const token = localStorage.getItem("token");

const shiftForm = document.getElementById("shiftForm");
const shiftTableBody = document.getElementById("shiftTableBody");
const messageBox = document.getElementById("message");
const formTitle = document.getElementById("formTitle");
const submitButton = document.getElementById("submitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

let shifts = [];
let editingShiftId = null;

if (!token) {
  window.location.href = "index.html";
}

function showMessage(message, type = "success") {
  messageBox.hidden=false;messageBox.textContent=message;messageBox.className='notice'+(type==='danger'?' error':'');
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  return value.includes("T")
    ? value.substring(11, 16)
    : value.substring(0, 5);
}

function resetForm() {
  editingShiftId = null;
  shiftForm.reset();
  formTitle.textContent = "Tạo ca làm";
  submitButton.textContent = "Tạo ca làm";
  cancelEditButton.hidden = true;preview();
}

function renderShifts(){
 const el=(tag,value)=>{const e=document.createElement(tag);e.textContent=value;return e;};
 document.getElementById('totalShifts').textContent=shifts.length;
 document.getElementById('activeShifts').textContent=shifts.filter(s=>s.IsActive).length;
 document.getElementById('midnightShifts').textContent=shifts.filter(s=>formatTime(s.EndTime)==='00:00').length;
 document.getElementById('supportShifts').textContent=shifts.filter(s=>s.IsSupport).length;
 const search=document.getElementById('shiftSearch').value.toLocaleLowerCase('vi'),filter=document.getElementById('statusFilter').value;
 shiftTableBody.replaceChildren();
 for(const shift of shifts.filter(s=>(s.ShiftCode+' '+s.ShiftName).toLocaleLowerCase('vi').includes(search)&&(filter==='all'||Boolean(s.IsActive)===(filter==='active')))){
  const tr=document.createElement('tr'),name=document.createElement('td'),start=formatTime(shift.StartTime),end=formatTime(shift.EndTime);name.append(el('strong',shift.ShiftName),el('small',shift.ShiftCode+(shift.IsSupport?' · Ca hỗ trợ':'')));
  const n=duration(start,end),status=document.createElement('td'),badge=el('span',shift.IsActive?'Đang áp dụng':'Ngừng áp dụng');badge.className='status-pill'+(shift.IsActive?'':' inactive');status.append(badge);const actions=document.createElement('td');
  for(const[label,fn]of [['Sửa',()=>editShift(shift.ShiftId)],[shift.IsActive?'Ngừng áp dụng':'Kích hoạt',()=>changeShiftStatus(shift.ShiftId,!shift.IsActive)]]){const b=el('button',label);b.className='button';b.type='button';b.onclick=fn;actions.append(b);}
  tr.append(name,el('td',start+'–'+end+(end==='00:00'?' (+1 ngày)':'')),el('td',Math.floor(n/60)+' giờ'+(n%60?' '+n%60+' phút':'')),el('td',shift.Capacity+' người'),status,actions);shiftTableBody.append(tr);
 }
}
function duration(start,end){const m=v=>Number(v.slice(0,2))*60+Number(v.slice(3,5));return(end==='00:00'?1440:m(end))-m(start);}
function preview(){const start=document.getElementById('startTime').value,end=document.getElementById('endTime').value,n=duration(start,end);document.getElementById('durationPreview').textContent=!start||!end?'Chọn giờ bắt đầu và kết thúc.':n<=0?'Giờ kết thúc chưa hợp lệ.':'Thời lượng: '+Math.floor(n/60)+' giờ'+(n%60?' '+n%60+' phút':'')+(end==='00:00'?' · 00:00 ngày hôm sau':'');}
async function loadShifts() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || result.message);
    }

    shifts = result.data;
    renderShifts();
  } catch (error) {
    showMessage(error.message || "Không thể tải danh sách ca làm", "danger");
  }
}

window.editShift = (shiftId) => {
  const shift = shifts.find(
    (item) => Number(item.ShiftId) === Number(shiftId)
  );

  if (!shift) {
    return;
  }

  editingShiftId = shift.ShiftId;

  document.getElementById("shiftCode").value = shift.ShiftCode;
  document.getElementById("shiftName").value = shift.ShiftName;
  document.getElementById("startTime").value = formatTime(shift.StartTime);
  document.getElementById("endTime").value = formatTime(shift.EndTime);

  formTitle.textContent = `Cập nhật ca: ${shift.ShiftName}`;
  submitButton.textContent = "Lưu thay đổi";
  cancelEditButton.hidden = false;preview();

  window.scrollTo({ top: 0, behavior: "smooth" });
};

window.changeShiftStatus = async (shiftId, isActive) => {
  const action = isActive ? "kích hoạt" : "ngừng áp dụng";

  if (!confirm(`Bạn có chắc muốn ${action} ca làm này?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${shiftId}/status`, {
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
    await loadShifts();
  } catch (error) {
    showMessage(error.message || "Không thể cập nhật trạng thái ca làm", "danger");
  }
};

shiftForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const data = {
    shiftCode: document.getElementById("shiftCode").value.trim().toUpperCase(),
    shiftName: document.getElementById("shiftName").value.trim(),
    startTime: document.getElementById("startTime").value,
    endTime: document.getElementById("endTime").value
  };

  const isEditing = editingShiftId !== null;
  const url = isEditing ? `${API_URL}/${editingShiftId}` : API_URL;
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
    await loadShifts();
  } catch(error) { showMessage(error.message || "Không thể lưu ca làm", "danger"); }
});
cancelEditButton.addEventListener("click",resetForm);
async function init(){
 if(!token)return;
 try{
  const r=await fetch('/api/auth/me',{headers:{Authorization:'Bearer '+token}}),b=await r.json();if(!r.ok)throw Error(b.message);
  if(!['Admin','Quản lý chi nhánh'].includes(b.user.role)){location.replace('week5.html');return;}
  let u;try{u=JSON.parse(localStorage.getItem('user'));}catch{}document.getElementById('userName').textContent=u?.fullName||b.user.username;document.getElementById('avatar').textContent=(u?.fullName||'G').slice(0,1);
  const br=await fetch('/api/week5/branches',{headers:{Authorization:'Bearer '+token}}),body=await br.json();if(!br.ok)throw Error(body.message);const select=document.getElementById('branchSelect');for(const branch of body.data.branches){const o=document.createElement('option');o.textContent=branch.BranchName;o.value=branch.BranchId;select.append(o);}select.value=body.data.selectedBranchId;select.disabled=body.data.branches.length<2;localStorage.setItem('branchId',body.data.selectedBranchId);await loadShifts();
 }catch(e){showMessage(e.message,'danger');}
}
document.getElementById('branchSelect').onchange=e=>{localStorage.setItem('branchId',e.target.value);location.reload();};document.getElementById('logout').onclick=()=>{for(const k of ['user','token','branchId'])localStorage.removeItem(k);location.replace('index.html');};
for(const id of ['startTime','endTime'])document.getElementById(id).oninput=preview;
document.getElementById('shiftSearch').oninput=document.getElementById('statusFilter').onchange=renderShifts;
const presets={morning:['SANG','Ca sáng','06:00','12:00'],afternoon:['CHIEU','Ca chiều','12:00','18:00'],evening:['TOI','Ca tối','18:00','00:00']};document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{for(const[i,id]of ['shiftCode','shiftName','startTime','endTime'].entries())document.getElementById(id).value=presets[b.dataset.preset][i];preview();});init();
