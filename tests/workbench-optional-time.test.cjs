const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../workbench-core.js');
const fs=require('node:fs');
const path=require('node:path');
const now=Date.parse('2026-10-12T12:00:00Z');
test('empty contact time uses configured default',()=>{
 assert.equal(C.nextContact({taskCode:'FOLLOW_UP',due:'2026-10-13T10:00'},'',now),'2026-10-13T10:00');
});
test('empty manual contact time is allowed and remains unscheduled',()=>{
 assert.equal(C.nextContact({taskCode:'FOLLOW_UP',manual:true,due:''},'',now),null);
});
test('manual future time overrides default; past and invalid values rejected',()=>{
 const tr={taskCode:'FOLLOW_UP',due:'2026-10-13T10:00'};
 assert.equal(C.nextContact(tr,'2026-10-14T10:00',now),'2026-10-14T10:00');
 assert.throws(()=>C.nextContact(tr,'2026-10-01T10:00',now));
 assert.throws(()=>C.nextContact(tr,'invalid',now));
});
test('terminal and dispatch results have no contact time',()=>{
 assert.equal(C.nextContact({terminal:true,taskCode:'FOLLOW_UP'},'',now),null);
 assert.equal(C.nextContact({taskCode:null},'',now),null);
});
test('form renders optional time and no right-side add-note entry',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../workbench.js'),'utf8');
 assert.ok(!ui.includes("'datetime-local','required'"));
 assert.ok(!ui.includes('id="addNote"'));
 assert.ok(!ui.includes("closest('#addNote')"));
 assert.ok(ui.includes('schedulePending:!nextTime'));
 assert.ok(ui.includes('!u.task.schedulePending'));
});
