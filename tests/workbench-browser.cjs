const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const context=await browser.newContext({viewport:{width:1440,height:1100}}),page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto('http://127.0.0.1:8765/index.html');await page.waitForSelector('#intentRows tr');
 assert.equal(await page.locator('[data-edit-intent]').count(),3);
 await page.screenshot({path:'/tmp/autocava-workbench-desktop.png',fullPage:true});
 await page.locator('[data-expand]').nth(1).click();assert.equal(await page.locator('#detail-1').isVisible(),true);assert.equal(await page.locator('#detail-0').isVisible(),true);
 await page.locator('#editUserButton').click();await page.locator('[name=name]').fill('Jorge Test');await page.locator('#closeEditor').click();assert.equal(await page.locator('#discardDialog').isVisible(),true);await page.locator('#keepEditing').click();await page.locator('#saveEditor').click();assert.equal(await page.locator('#userName').textContent(),'Jorge Test');
 await page.locator('#editsTab').click();assert.ok((await page.locator('#recordPanel').textContent()).includes('Jorge Navarro'));
 await page.locator('[data-edit-intent]').first().click();await page.locator('[name=downPayment]').fill('120');await page.locator('#saveEditor').click();assert.equal(await page.locator('#editor').isVisible(),true);await page.locator('[name=downPayment]').fill('25');await page.locator('#saveEditor').click();assert.equal(await page.locator('#editor').isVisible(),false);
 await page.locator('[data-edit-intent]').nth(2).click();assert.equal(await page.locator('[name=downPayment]').count(),0);await page.locator('[name=trialTime]').fill('2026-11-10T10:30');await page.locator('#saveEditor').click();
 await page.locator('#reportButton').click();assert.ok((await page.locator('#editorBody').textContent()).includes('暂无已生成'));await page.locator('#cancelEditor').click();
 await page.locator('#notesTab').click();await page.locator('#addNote').click();await page.locator('[name=note]').fill('原文测试 <script>not executable</script>');await page.locator('#saveEditor').click();assert.ok((await page.locator('#recordPanel').textContent()).includes('<script>'));
 assert.equal(await page.locator('[name=resultGroup]').count(),3);
 await page.locator('[name=resultGroup][value=pause]').check();await page.locator('#submitTopButton').click();assert.ok((await page.locator('#followError').textContent()).includes('原因'));await page.locator('[name=resultCode]').selectOption('missingInfo');await page.locator('#submitFollowButton').click();assert.ok((await page.locator('#followError').textContent()).includes('必填'));await page.locator('[name=agreement]').fill('待确认首付比例');await page.locator('#followNote').fill('客户确认金融方案');
 await page.locator('#languageSelect').selectOption('es-MX');assert.equal(await page.locator('h1').textContent(),'Seguimiento de Leads');assert.equal(await page.locator('[name=resultCode]').inputValue(),'missingInfo');assert.equal(await page.locator('[name=agreement]').inputValue(),'待确认首付比例');assert.equal(await page.locator('#followNote').inputValue(),'客户确认金融方案');
 await page.locator('#languageSelect').selectOption('zh-CN');await page.locator('#submitTopButton').click();assert.notEqual(await page.locator('#userName').textContent(),'Jorge Test');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem(WORKBENCH_CONFIG.storageKey)).users[0]);assert.equal(saved.taskHistory.length,1);assert.equal(saved.state,'dormantInfo');assert.equal(saved.informationCount,1);assert.equal(saved.task.code,'FOLLOW_UP');assert.ok(saved.notes.some(n=>n[1]==='客户确认金融方案'));assert.equal(saved.originalSnapshot.name,'Jorge Navarro');
 await page.reload();assert.equal(await page.locator('#userName').textContent(),'Sofía Ramírez');
 for(const width of [834,390]){await page.setViewportSize({width,height:1000});await page.screenshot({path:`/tmp/autocava-workbench-${width}.png`,fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}
 assert.deepEqual(errors,[]);console.log('PASS: edit, discard, validation, report, notes, locale, submit, persistence, 1440/834/390 layouts; no browser exceptions');await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
