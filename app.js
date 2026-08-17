const $ = (s) => document.querySelector(s);
const roleSelect=$('#roleSelect');const leadList=$('#leadList');const workbenchPage=$('#workbenchPage');
function setRole(role){const admin=role==='admin';leadList.classList.toggle('hidden',!admin);workbenchPage.classList.toggle('hidden',admin);document.querySelector('.admin-nav').classList.toggle('hidden',!admin);}
roleSelect.addEventListener('change',e=>setRole(e.target.value));
document.querySelectorAll('[data-open-workbench]').forEach(btn=>btn.addEventListener('click',()=>{roleSelect.value='sales';setRole('sales');showToast('已进入 Sofia Ramirez 的销售工作台');}));
$('#openSalesWorkbench').addEventListener('click',()=>{roleSelect.value='sales';setRole('sales');});
setRole('sales');
const tabs = document.querySelectorAll('.tab');
tabs.forEach(tab => tab.addEventListener('click', () => {
  tabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  $('#opsPanel').classList.toggle('hidden', tab.dataset.tab !== 'ops');
  $('#notesPanel').classList.toggle('hidden', tab.dataset.tab !== 'notes');
}));

const leadStates = {
  pending:{main:'待跟进',sub:'—',progress:'20%',count:'1 / 5 阶段',items:[['未接通','自动联系','第2次 +2小时','状态 → 跟进中 · 已联系；跟进次数 +1'],['已沟通-有意向','确认意向车型','承诺时间或 +2小时 / 次日10:00','确认意向车型，进入购车引导'],['已沟通-无意向','转低频唤醒','+30天唤醒一次','状态 → 暂存 · 无意向购买'],['要求稍后联系','按客户指定时间回访','销售录入客户指定时间','状态 → 跟进中 · 已联系'],['号码错误','无动作（终态）','—','状态 → 战败-号码错误'],['已发送预审链接','跟进预审进度','第2次 +2小时；第3次次日10:00','状态 → 跟进中 · 已联系']]},
  following:{main:'跟进中',sub:'已联系',progress:'40%',count:'2 / 5 阶段',items:[['已沟通-有意向','进入已联系状态流转','按联系节奏','状态保持 跟进中 · 已联系'],['已发送预审链接','跟进预审进度','第2次 +2小时；第3次次日10:00','直接触发复制链接动作'],['试驾','转低频唤醒','+30天唤醒一次','状态 → 暂存 · 试驾'],['已沟通-无意向','转低频唤醒','+30天唤醒一次','状态 → 暂存 · 无意向购买'],['未接通（第2次）','重新联系','第3次次日10:00','状态不变；跟进次数 +1（累计2）'],['未接通（第3次，达上限）','无动作','—','系统自动 → 战败（原因：未接通）'],['要求稍后联系','按客户指定时间回访','销售录入客户指定时间','状态不变'],['预审通过','进入订单流程','—','状态 → 订单中-预审通过'],['放弃购买','无动作（终态）','—','状态 → 战败（原因：暂时不买）']]},
  order:{main:'订单中',sub:'预审通过',progress:'70%',count:'4 / 5 阶段',items:[['待客户进件','联系用户，提醒协助提交进件材料','预审通过后+2小时；先+1天、+3天','状态保持 订单中'],['等待信审结果','主动查询订单状态','+1 / +3 / +7天','状态保持 订单中'],['报价待确认','推动客户确认金融报价方案','进入后+1天首跟，未完成每+1天','状态保持 订单中'],['合同待签署','协助客户确认/签署合同','进入后+1天首跟，未完成每+1天','状态保持 订单中'],['等待放款','跟进放款进度，需找 Mstar 查询','进入后+1天首跟，未完成每+1天','状态保持 订单中']]},
  testdrive:{main:'暂存',sub:'试驾',progress:'45%',count:'2 / 5 阶段',items:[['已沟通-有意向','进入已联系的状态流转','按联系节奏','状态 → 跟进中 · 已联系'],['未接通（达上限）','无动作','—','系统按次数自动判定为战败']]},
  cash:{main:'暂存',sub:'确认全款',progress:'55%',count:'3 / 5 阶段',items:[['已沟通-有意向','进入已联系的状态流转','按联系节奏','状态 → 跟进中 · 已联系'],['未接通（未达上限）','重新联系','第2次 +2小时；第3次次日10:00','状态不变；重试次数 +1'],['未接通（达上限）','无动作','—','系统按次数自动判定为战败']]},
  'no-intent':{main:'暂存',sub:'无意向购买',progress:'35%',count:'2 / 5 阶段',items:[['已沟通-有意向','进入已联系的状态流转','按联系节奏','状态 → 跟进中 · 已联系'],['未接通（未达上限）','重新联系','第2次 +2小时；第3次次日10:00','状态不变；重试次数 +1'],['未接通（达上限）','无动作','—','系统按次数自动判定为战败']]},
  lost:{main:'战败',sub:'—',progress:'100%',count:'终态',items:[['战败','无后续动作','—','原因：号码错误 / 放弃购买 / 预审失败 / 未接通电话']]}
};
function renderLeadState(key){
  const data=leadStates[key]; $('#currentMainState').textContent=data.main; $('#currentSubState').textContent=data.sub; $('#lostReasonWrap').classList.toggle('hidden', key !== 'lost');
  const list=$('#stageList'); list.innerHTML=data.items.map((x,i)=>`<button class="stage ${i===0?'selected':''}" data-stage="${x[0]}" data-action="${x[3]}" data-next="${x[2]}"><span class="stage-radio"></span><b>${x[0]}</b><small>${x[1]}</small><time>${x[2]}</time></button>`).join(''); bindStages(); const first=data.items[0]; $('#autoAction').textContent=first[3]; $('#nextAction').textContent=first[2];
}
function bindStages(){document.querySelectorAll('.stage').forEach(stage=>stage.addEventListener('click',()=>{document.querySelectorAll('.stage').forEach(s=>s.classList.remove('selected'));stage.classList.add('selected');$('#autoAction').textContent=stage.dataset.action;$('#nextAction').textContent=stage.dataset.next;}));}
$('#leadStateSelect').addEventListener('change',e=>renderLeadState(e.target.value)); renderLeadState('pending');
document.querySelector('.identity-card .text-btn').addEventListener('click',()=>$('#userInfoModal').classList.remove('hidden'));
$('#closeUserModal').addEventListener('click',()=>$('#userInfoModal').classList.add('hidden'));
document.querySelectorAll('.info-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.info-tab').forEach(t=>t.classList.remove('active'));tab.classList.add('active');['current','original','history'].forEach(k=>$('#'+k+'InfoPanel').classList.toggle('hidden',k!==tab.dataset.infoTab));}));
$('#saveUserInfo').addEventListener('click',()=>{const map={currentLeadType:$('#editType').value,currentPhone:$('#editPhone').value,currentBrand:$('#editBrand').value,currentSeries:$('#editSeries').value,currentModel:$('#editModel').value,currentDealer:$('#editDealer').value,currentAddress:$('#editAddress').value,currentRegion:$('#editRegion').value};Object.entries(map).forEach(([id,value])=>$('#'+id).textContent=value||'—');const reason=$('#editReason').value.trim()||'销售手动更新用户信息';$('#changeList').innerHTML=`<div class="change-item"><time>刚刚 · Sofia Ramirez</time><p>${escapeHtml(reason)}</p><small>当前信息已更新，原始线索快照保持不变</small></div>`;$('#userInfoModal').classList.add('hidden');showToast('当前用户信息已保存，原始信息已保留');});

$('#addNoteBtn').addEventListener('click', () => { $('#noteForm').classList.remove('hidden'); $('#noteInput').focus(); });
$('#cancelNote').addEventListener('click', () => { $('#noteForm').classList.add('hidden'); $('#noteInput').value = ''; });
$('#noteForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#noteInput').value.trim(); if (!text) return;
  const item = document.createElement('div'); item.className = 'timeline-item';
  item.innerHTML = `<span class="timeline-dot purple"></span><div><div class="timeline-head"><time>刚刚</time></div><p>${escapeHtml(text)}</p><div class="operator-line">操作人：sales 001 Deng Yao</div></div>`;
  $('#noteTimeline').prepend(item); $('#noteForm').classList.add('hidden'); $('#noteInput').value = '';
  $('#noteCount').textContent = Number($('#noteCount').textContent) + 1; showToast('跟踪记事已保存');
});
$('#precheckBtn').addEventListener('click', () => $('#precheckModal').classList.remove('hidden'));
$('#closePrecheck').addEventListener('click', () => $('#precheckModal').classList.add('hidden'));
$('#precheckModal').addEventListener('click', e => { if(e.target.id === 'precheckModal') e.currentTarget.classList.add('hidden'); });
$('#savePrecheck').addEventListener('click', () => showToast('预审信息已保存'));
$('#startAttribution').addEventListener('click', () => showToast('归因链接已发起'));
$('#favoriteBtn').addEventListener('click', () => { const b = $('#favoriteBtn'); b.classList.toggle('active'); b.textContent = b.classList.contains('active') ? '★ 已收藏' : '☆ 收藏'; showToast(b.classList.contains('active') ? '已加入收藏' : '已取消收藏'); });
$('#completeBtn').addEventListener('click', () => { if(!$('#lostReasonWrap').classList.contains('hidden') && !$('#lostReason').value){ showToast('请先选择战败原因'); $('#lostReason').focus(); return; } showToast(`跟进已完成：${document.querySelector('.stage.selected')?.dataset.stage || '未接通'}，即将进入下一条`); });
function escapeHtml(value){const d=document.createElement('div');d.textContent=value;return d.innerHTML}
function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>toast.classList.remove('show'),2400)}
$('#changeList').innerHTML='<div class="change-item"><time>今天 10:18 · Sofia Ramirez</time><p><b>车型</b>：3 Sedan → I GRAND TOURING MHEV TA</p><small>修改原因：客户电话确认最终意向车型</small></div><div class="change-item"><time>昨天 16:42 · Sofia Ramirez</time><p><b>地址</b>：Av. Vallarta 1200 → Av. Vallarta 1410</p><small>修改原因：客户补充完整门牌号</small></div><div class="change-item"><time>07-21 11:05 · 系统同步</time><p><b>地区</b>：Ciudad de México → Ciudad de México · CDMX</p><small>修改原因：根据经销商区域信息自动补全</small></div>';
const currentDemo={currentLeadType:'全款',currentPhone:'5899022435',currentBrand:'长安',currentSeries:'CS75 PLUS',currentModel:'1.5T 尊贵型',currentDealer:'Changan Polanco Centro',currentAddress:'Av. Vallarta 1410',currentRegion:'Guadalajara · JAL'};Object.entries(currentDemo).forEach(([id,value])=>{const el=$('#'+id);if(el)el.textContent=value;});const editDemo={editType:'全款',editPhone:'5899022435',editBrand:'长安',editSeries:'CS75 PLUS',editModel:'1.5T 尊贵型',editDealer:'Changan Polanco Centro',editAddress:'Av. Vallarta 1410',editRegion:'Guadalajara · JAL'};Object.entries(editDemo).forEach(([id,value])=>{const el=$('#'+id);if(el)el.value=value;});
document.querySelectorAll('.note-meta span:first-child').forEach(el=>{el.textContent='操作人：sales 001 Deng Yao';});
