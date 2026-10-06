class BusinessError extends Error {
 constructor(status,message){super(message);this.status=status;}
}
const fail=(status,message)=>{throw new BusinessError(status,message);};
function id(value){const n=Number(value);if(!Number.isSafeInteger(n)||n<=0)fail(400,'Mã phải là số nguyên dương');return n;}
function reason(value){if(typeof value!=='string'||!value.trim()||value.trim().length>500)fail(400,'Lý do phải có từ 1 đến 500 ký tự');return value.trim();}
function decision(value){if(!['Approved','Rejected'].includes(value))fail(400,'Chọn Approved hoặc Rejected');return value;}
function note(value){if(value==null)return null;if(typeof value!=='string'||value.length>500)fail(400,'Ghi chú tối đa 500 ký tự');return value.trim();}
module.exports={BusinessError,fail,id,reason,decision,note};
