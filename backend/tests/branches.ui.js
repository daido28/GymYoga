process.env.DB_DATABASE='GymYogaHRM_Week5_Test';process.env.JWT_SECRET=require('crypto').randomBytes(32).toString('hex');require('dotenv').config();
const app=require('../src/server'),{poolPromise}=require('../src/config/db'),assert=require('node:assert/strict'),fs=require('fs'),bcrypt=require('bcryptjs');
const {chromium}=require('C:/Users/Admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
let server,browser;const checks=[];
(async()=>{
 const pool=await poolPromise;assert.equal((await pool.request().query('SELECT DB_NAME() Name')).recordset[0].Name,'GymYogaHRM_Week5_Test');
 const demo=JSON.parse(fs.readFileSync('test-results/branches-integration.json')).demo;
 const admin=(await pool.request().query("SELECT TOP 1 u.UserId,u.Username FROM AppUsers u JOIN Roles r ON r.RoleId=u.RoleId WHERE r.RoleName=N'Admin' AND u.IsActive=1")).recordset[0];
 const password=require('crypto').randomBytes(16).toString('hex'),hash=await bcrypt.hash(password,10),suffix=Date.now();
 for(const id of [admin.UserId,demo.managerUserId,demo.staffUserId])await pool.request().input('id',id).input('hash',hash).query('UPDATE AppUsers SET PasswordHash=@hash WHERE UserId=@id');
 const newManager=Number((await pool.request().input('branch',demo.branchB).query("INSERT Employees(FullName,Position,BranchId) OUTPUT INSERTED.EmployeeId VALUES(N'Quản lý cấp qua UI',N'Quản lý',@branch)")).recordset[0].EmployeeId);
 const newStaff=Number((await pool.request().input('branch',demo.branchB).query("INSERT Employees(FullName,Position,BranchId) OUTPUT INSERTED.EmployeeId VALUES(N'HLV cấp qua UI',N'HLV',@branch)")).recordset[0].EmployeeId);
 server=app.listen(3111);browser=await chromium.launch({channel:'msedge',headless:true});const errors=[];
 for(const[name,username]of [['admin',admin.Username],['manager',demo.managerUsername],['staff',demo.staffUsername]]){
  const context=await browser.newContext({viewport:{width:1600,height:1100},locale:'vi-VN'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://localhost:3111/index.html');await page.fill('#username',username);await page.fill('#password',password);await page.click('#loginForm button');await page.waitForURL('**/week5.html');await page.locator('#calendar table').waitFor();checks.push(name+' real login lands directly on calendar');
  if(name==='admin'){
   await page.selectOption('#branchSelect',String(demo.branchB));await page.waitForLoadState();await page.waitForFunction(id=>document.querySelector('#branchSelect')?.value===String(id)&&document.querySelector('#calendar table'),demo.branchB);checks.push('Admin branch switch reloads scoped workspace');
   await page.click('[data-panel="settings"]');await page.selectOption('#accountEmployee',String(newManager));await page.selectOption('#account select[name="role"]','Quản lý chi nhánh');await page.fill('#account input[name="username"]','ui_manager_'+suffix);await page.fill('#account input[name="password"]',password);await page.click('#account button');await page.waitForFunction(()=>document.querySelector('#message').textContent==='Đã cấp tài khoản');await page.waitForFunction(()=>![...document.querySelector('#accountEmployee').options].some(o=>o.textContent==='Quản lý cấp qua UI'));checks.push('Admin creates scoped manager through UI and linked profile disappears');
  }else if(name==='manager'){
   assert.equal(await page.locator('#branchSelect option').count(),1);assert.equal(await page.inputValue('#branchSelect'),String(demo.branchB));checks.push('Manager sees only assigned branch');
   await page.click('[data-panel="settings"]');assert.equal(await page.locator('#branchAdmin').isVisible(),false);assert.equal(await page.locator('#account select[name="role"] option[value="Admin"]').evaluate(e=>e.hidden),true);checks.push('Manager cannot select elevated account or edit branches');
   await page.selectOption('#accountEmployee',String(newStaff));await page.fill('#account input[name="username"]','ui_hlv_'+suffix);await page.fill('#account input[name="password"]',password);await page.click('#account button');await page.waitForFunction(()=>document.querySelector('#message').textContent==='Đã cấp tài khoản');checks.push('Manager can issue ordinary instructor account through UI');
  }else{
   assert.equal(await page.locator('.sidebar a[href="employees.html"]').isVisible(),false);assert.equal(await page.locator('.sidebar a[href="shifts.html"]').isVisible(),false);assert.equal(await page.locator('[data-panel="settings"]').isVisible(),false);checks.push('Staff menu excludes employee and shift management');
   assert.equal(await page.locator('#branchSelect option').count(),1);checks.push('Staff sees only own branch');
   await page.click('[data-panel="operations"]');await page.locator('#own button').first().waitFor();assert(await page.locator('#own button').count()>0);checks.push('Instructor reaches own check-in and requests from main menu');
   await page.goto('http://localhost:3111/dashboard.html');await page.waitForURL('**/week5.html');await page.locator('#calendar table').waitFor();checks.push('Old dashboard link redirects to calendar');
   await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));checks.push('Branch selector and staff menu fit mobile viewport');
  }
  await page.screenshot({path:'test-results/branches-'+name+'.png',fullPage:true});await context.close();
 }
 assert.equal(errors.length,0,errors.join('; '));checks.push('No JavaScript errors in login and branch/account UI');
 fs.writeFileSync('test-results/branches-ui.json',JSON.stringify({testedAt:new Date().toISOString(),browser:'Microsoft Edge headless',total:checks.length,status:'PASS',checks},null,2));console.log(checks.length+' branch and login UI checks PASS');
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));const p=await poolPromise.catch(()=>null);if(p)await p.close();});
