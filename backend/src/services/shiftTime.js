const {fail}=require('./week5Rules');
function validate(start,end){
 const valid=v=>typeof v==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(v);
 if(!valid(start)||!valid(end))fail(400,'Giờ phải đúng định dạng HH:mm từ 00:00 đến 23:59');
 if(start===end||(end!=='00:00'&&start>end))fail(400,'Giờ kết thúc phải sau giờ bắt đầu; 00:00 là cuối ngày của ca');
}
const start=column=>`DATEDIFF(MINUTE,CONVERT(time,'00:00'),${column})`;
const end=column=>`CASE WHEN ${column}=CONVERT(time,'00:00') THEN 1440 ELSE ${start(column)} END`;
const overlap=(aStart,aEnd,bStart,bEnd)=>`(${start(aStart)} < ${end(bEnd)}) AND (${end(aEnd)} > ${start(bStart)})`;
module.exports={validate,overlap};
