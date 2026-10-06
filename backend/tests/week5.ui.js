process.env.DB_DATABASE='GymYogaHRM_Week5_Test';process.env.JWT_SECRET=require('crypto').randomBytes(32).toString('hex');require('dotenv').config();
const app=require('../src/server'),{poolPromise}=require('../src/config/db'),jwt=require('jsonwebtoken'),fs=require('fs');
const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let server,browser;
(async()=>{
 const pool=await poolPromise;server=app.listen(3106);browser=await chromium.launch({channel:'msedge',headless:true});
 fs.mkdirSync('test-results',{recursive:true});const errors=[];
 for(const [name,username] of [['admin','week5_admin'],['staff','week5_staff0']]){
  const user=(await pool.request().input('name',username).query('SELECT u.UserId,u.Username,r.RoleName,e.FullName FROM AppUsers u JOIN Roles r ON r.RoleId=u.RoleId JOIN Employees e ON e.UserId=u.UserId WHERE Username=@name')).recordset[0];
  const context=await browser.newContext({viewport:{width:1440,height:1000}}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  const auth={userId:Number(user.UserId),username:user.Username,role:user.RoleName};
  await context.addInitScript(({token,user})=>{localStorage.setItem('token',token);localStorage.setItem('user',JSON.stringify(user));},{token:jwt.sign(auth,process.env.JWT_SECRET),user:{...auth,fullName:user.FullName}});
  await page.goto('http://localhost:3106/week5.html');await page.locator('#calendar table').waitFor();await page.waitForTimeout(400);
  if(await page.locator('#message').innerText())throw Error(await page.locator('#message').innerText());
  if(await page.locator('#calendar th').count()<8)throw Error('Week calendar missing days');
  await page.screenshot({path:`test-results/week5-${name}-week.png`,fullPage:true});
  if(name==='admin'){await page.selectOption('#view','month');await page.click('#show');await page.waitForFunction(()=>document.querySelectorAll('#calendar tr:first-child th').length>28);await page.screenshot({path:'test-results/week5-admin-month.png',fullPage:true});}
  else if(!await page.locator('#own button').count())throw Error('Staff actions missing');
  await context.close();
 }
 if(errors.length)throw Error(errors.join('; '));fs.writeFileSync('test-results/week5-ui.json',JSON.stringify({testedAt:new Date().toISOString(),browser:'Microsoft Edge headless',checks:['Admin weekly calendar renders','Admin monthly calendar renders','Staff personal actions render','No browser JavaScript errors'],status:'PASS'},null,2));console.log('4 UI checks PASS; 3 screenshots saved');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));const pool=await poolPromise.catch(()=>null);if(pool)await pool.close();});
