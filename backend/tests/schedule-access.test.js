const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

function loadController() {
  const employees = [{ UserId: 11, ScheduleId: 101 }, { UserId: 22, ScheduleId: 202 }];
  const calls = [];
  const pool = { request() {
    const parameters = {};
    return {
      input(name, type, value) { parameters[name] = value; return this; },
      async query(query) {
        calls.push({ query, parameters });
        return { recordset: query.includes('WHERE e.UserId = @userId')
          ? employees.filter(e => e.UserId === parameters.userId) : employees };
      }
    };
  }};
  const context = { module: { exports: {} }, require() { return { sql: { Int: 'Int' }, poolPromise: Promise.resolve(pool) }; } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers/scheduleController.js'), 'utf8'), context);
  return { controller: context.module.exports, calls };
}
async function invoke(user) {
  const { controller, calls } = loadController();
  const res = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await controller.getSchedules({ user, query: { employeeId: '202', userId: '22' } }, res);
  return { res, calls };
}
test('Admin can retrieve all schedules', async () => {
  const { res, calls } = await invoke({ role: 'Admin', userId: 1 });
  assert.equal(res.body.data.length, 2);
  assert.equal(calls[0].query.includes('WHERE e.UserId'), false);
});
test('Employee A cannot select B through request parameters', async () => {
  const { res, calls } = await invoke({ role: 'Nhân viên', userId: 11 });
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0].ScheduleId, 101);
  assert.equal(calls[0].parameters.userId, 11);
});
test('Employee B sees only B schedules', async () => {
  const { res } = await invoke({ role: 'Nhân viên', userId: 22 });
  assert.equal(res.body.data[0].ScheduleId, 202);
  assert.equal(res.body.data.length, 1);
});
test('Employee without linked schedules receives empty list', async () => {
  const { res } = await invoke({ role: 'Nhân viên', userId: 33 });
  assert.equal(res.body.data.length, 0);
});
test('Missing identity, invalid identity and unknown role fail closed', async () => {
  for (const user of [undefined, { role: 'Other', userId: 11 }, { role: 'Nhân viên', userId: '11' }]) {
    const { res, calls } = await invoke(user);
    assert.equal(res.statusCode, 403);
    assert.equal(calls.length, 0);
  }
});
