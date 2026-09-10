window.CohortDashboard = (() => {
  const $=id=>document.getElementById(id);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=(a,b)=>b?`${(100*a/b).toFixed(1)}%`:'—';
  let initialized=false, current, labels={total:'下发线索',valid:'已确认有效',unknown:'待判定',invalid:'已确认无效',prospect:'曾确认意向',booked:'曾预约试驾',arrived:'已到店',testDriven:'实际试驾',won:'已成交',lost:'当前战败',dormant:'当前暂存',active:'继续跟进',assigned:'已分配',contact:'已联系',pending:'尚未联系',direct:'未预约直接成交',wonWithoutVisit:'未到店成交'};
  const count=(key,n)=>`<button class="cohort-count" data-cohort="${key}" type="button" aria-label="查看${labels[key]||key}明细">${n}</button>`;
  function init(state, rerender) {
    if(initialized)return;
    initialized=true;
    $('overviewChannelFilter').innerHTML='<option value="">全部渠道</option><option>Meta</option><option>Google</option><option>AutoCava</option>';
    $('overviewDealerFilter').innerHTML='<option value="">北汽全部门店</option>'+state.baicDealers.map(d=>`<option>${esc(d.name)}</option>`).join('');
    document.querySelector('.overview-filter>div').innerHTML='<span>统计口径</span><strong>按下发批次追踪</strong>';
    const dates=document.createElement('div');dates.className='cohort-dates';
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Etc/GMT+6',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    dates.innerHTML=`<label>下发开始日期<input type="date" id="cohortStart" value="2026-09-01"></label><label>统计截至日期<input type="date" id="cohortAsOf" value="${today}"></label>`;
    document.querySelector('.overview-filter').prepend(dates);
    dates.addEventListener('change',rerender);
    $('resetOverviewFilters').addEventListener('click',()=>{$('cohortStart').value='2026-09-01';$('cohortAsOf').value=today;rerender();});
    const note=document.createElement('p');note.id='cohortNotice';note.className='cohort-note';note.setAttribute('role','status');document.querySelector('.overview-filter').after(note);
    const outcomes=document.createElement('div');outcomes.id='cohortOutcomes';outcomes.className='volume-totals';document.querySelector('.funnel-panel').append(outcomes);
    const dialog=document.createElement('dialog');dialog.id='cohortDetail';dialog.innerHTML='<form method="dialog"><button class="secondary-button">关闭明细</button></form><h2 id="cohortDetailTitle"></h2><div class="table-wrap" id="cohortDetailBody"></div>';document.body.append(dialog);
    $('dashboardView').addEventListener('click',e=>{const b=e.target.closest('[data-cohort]');if(!b||!current)return;const key=b.dataset.cohort;const rows=current.groups[key]||[];$('cohortDetailTitle').textContent=labels[key]||key;$('cohortDetailBody').innerHTML=`<table><thead><tr><th>线索ID / 用户</th><th>下发门店 / 渠道</th><th>截至所选日期的历史记录（UTC-6）</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${esc(r.leadId)}<br>${esc(r.name)}</td><td>${esc(r.dealer)}<br>${esc(r.channel)}</td><td>${r.events.map(v=>`${esc(v.at.slice(0,16).replace('T',' '))} · ${esc(labels[v.type]||({'issued':'下发',active:'恢复跟进'}[v.type])||v.type)} ${esc(v.reason||'')}`).join('<br>')}</td></tr>`).join('')||'<tr><td colspan="3">当前范围暂无数据</td></tr>'}</tbody></table>`;dialog.showModal();});
  }
  function render(state,role) {
    if(!initialized)return;
    const filters={start:$('cohortStart').value,asOf:$('cohortAsOf').value,channel:$('overviewChannelFilter').value,dealer:$('overviewDealerFilter').value};
    if(!filters.asOf||(filters.start&&filters.asOf<filters.start)){$('cohortNotice').textContent='日期无效：下发开始日期不能晚于统计截至日期。以下数据暂不展示。';for(const id of ['metricGrid','volumeTotals','storeBreakdown','efficiencySummary','salesThroughput','conversionFunnel','conversionRates','cohortOutcomes'])$(id).innerHTML='';current=null;return;}
    const records=window.COHORT_DEMO.records.map(r=>({...r,name:state.leads.find(l=>l.id===r.leadId)?.name||r.leadId,dealer:state.baicDealers[r.store].name,sales:`${state.baicDealers[r.store].salesId} ${state.baicDealers[r.store].salesName}`}));
    current=CohortEngine.analyze(records,filters);const {groups:g,rates}=current;
    $('cohortNotice').textContent=`历史演示数据 · ${records.length}条带事件时间的样例。下发日期 ${filters.start||'不限'} 起，截至 ${filters.asOf}，本批次 ${g.total.length} 条。未提供历史记录的线索不参与本演示；未经过预约或试驾的客户不会自动补算。`;
    $('overviewDataDate').textContent=`演示快照更新至 ${COHORT_DEMO.updatedAt.slice(0,16).replace('T',' ')}（UTC-6）；之后暂无新记录`;
    $('funnelScope').textContent=`${filters.channel||'全部渠道'} · ${filters.dealer||'全部门店'} · 截至 ${filters.asOf}`;
    $('metricGrid').innerHTML=[['批次下发线索',g.total.length,'total',`${filters.start||'不限'} 起 · 截至 ${filters.asOf}`],['有效率',pct(g.valid.length,g.total.length),'valid','已确认有效 ÷ 本批次下发'],['预约试驾率',pct(rates[1][1],rates[1][2]),'booked',rates[1][3]],['预约到店率',pct(rates[2][1],rates[2][2]),'arrived',rates[2][3]]].map(([n,v,k,f])=>`<article class="overview-kpi"><span>${n}</span><strong>${typeof v==='number'?count(k,v):v}</strong><small>${f}</small></article>`).join('');
    $('volumeTotals').innerHTML=['total','assigned','contact','pending','valid','invalid','unknown'].map(k=>`<div><span>${labels[k]}</span><strong>${count(k,g[k].length)}</strong>${['valid','invalid','unknown'].includes(k)?`<small>${pct(g[k].length,g.total.length)} / 本批次下发</small>`:''}</div>`).join('');
    $('storeBreakdown').innerHTML='<div class="table-wrap"><table><thead><tr><th>下发门店</th><th>本批下发</th><th>已分配</th><th>已联系</th><th>待联系</th><th>有效</th><th>无效</th><th>待判定</th></tr></thead><tbody>'+state.baicDealers.filter(d=>!filters.dealer||d.name===filters.dealer).map(d=>`<tr><td>${esc(d.name)}</td>${['total','assigned','contact','pending','valid','invalid','unknown'].map(k=>`<td>${g[k].filter(r=>r.dealer===d.name).length}</td>`).join('')}</tr>`).join('')+'</tbody></table></div>';
    $('efficiencySummary').innerHTML=role==='super_admin'?[["首次联系平均时间",current.average===null?'—':`${current.average.toFixed(1)} 分钟`,`已首次联系且有分配时间：${current.averageSamples}条`],['未联系超时',g.overdue.length,'下发超过72小时仍无联系记录'],['跟进中',g.inProgress.length,'截至所选日期的当前状态'],['暂存',g.dormant.length,'截至所选日期的当前状态']].map(([n,v,f])=>`<div><span>${n}</span><strong>${v}</strong><small>${f}</small></div>`).join(''):'<div class="overview-locked">仅管理账号可查看销售效率</div>';
    $('salesThroughput').innerHTML=role==='super_admin'?`<p>统计所选批次在 ${filters.asOf} 提交的去重任务数</p>`+state.baicDealers.map(d=>{const ids=new Set(g.total.filter(r=>r.dealer===d.name).flatMap(r=>r.events.filter(e=>e.taskId&&e.at.slice(0,10)===filters.asOf).map(e=>e.taskId)));return `<p>${esc(d.salesId+' '+d.salesName)}：<strong>${ids.size}</strong></p>`;}).join(''):'';
    const keys=['total','valid','prospect','booked','arrived','won'];
    $('conversionFunnel').innerHTML=keys.map((k,i)=>`<div class="funnel-step" style="--step:${i};--funnel-width:${Math.max(34,g.total.length?g[k].length/g.total.length*100:0)}%"><span>${labels[k]}</span><strong>${count(k,g[k].length)}</strong><small>${pct(g[k].length,g.total.length)} / 本批次下发</small></div>`).join('');
    $('conversionRates').innerHTML=rates.map(([n,a,b,f])=>`<div><span>${n}</span><strong>${pct(a,b)}</strong><small>${a} ÷ ${b} · ${f}</small></div>`).join('');
    $('cohortOutcomes').innerHTML=['testDriven','direct','wonWithoutVisit','active','dormant','lost','won','invalid'].map(k=>`<div><span>${labels[k]}</span><strong>${count(k,g[k].length)}</strong></div>`).join('');
    $('formulaGrid').innerHTML=[['有效 / 无效 / 待判定占比','截至所选日期的质量分类数量 ÷ 本批次下发；三类互斥，合计100%'],['历史节点','每个节点按线索ID去重；后续战败仍保留曾预约、到店记录'],['当前结果','继续跟进、暂存、战败、成交、无效为截至日期的当前处理结果；不同于历史节点'],['首次联系平均时间','Σ（首次联系时间 − 分配时间）÷ 有完整时间的首次联系线索数'],['每日任务量','截至日期当天提交过跟进结果的不同任务ID数量'],['跨节点转化','分子仅统计分母人群中的转化客户；整体成交包含直接成交；确认金融购车不等于成交'],['历史归属','本批次采用下发时的门店、渠道归属；事件统一使用UTC-6'],['无分母','分母为0显示“—”；不把未知、缺失数据算作有效']].map(([n,f])=>`<div><strong>${n}</strong><code>${f}</code></div>`).join('');
  }
  return {init,render};
})();
