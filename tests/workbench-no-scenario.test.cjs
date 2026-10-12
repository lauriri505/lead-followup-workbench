const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('workbench removes scenario switch without removing saved data or normal queue navigation',()=>{
  const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
  assert.ok(!read('index.html').includes('scenarioSelect'));
  assert.ok(!read('workbench.js').includes('scenarioSelect'));
  assert.ok(read('workbench.js').includes("'2026.10.12.4',UI.version"));
  assert.ok(read('workbench.js').includes('const next=eligible()[0]'));
});
