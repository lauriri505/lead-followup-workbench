/* AutoCava v2026.10.12.2. Local prototype; never sends data externally. */
(() => {
  'use strict';
  const C=window.WorkbenchCore,UI=window.WORKBENCH_CONFIG,source=window.CRM_DEMO_DATA;
  const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const blank=v=>v===undefined||v===null||v===''||v==='—'||v==='-'?'--':v;
  let locale='zh-CN',users,activeId,tab='operations',selectedGroup='',selectedCode='',draft={},editorState=null,editorSnapshot='',toastTimer;
  const expanded=new Set(),visited=new Set();
  const loadConfig=()=>window.WorkbenchFlow.configure(window.LEAD_FLOW_CONFIG.load());
  let config=loadConfig();
  const catalog={...source.vehicleCatalog,...UI.catalog},dealers=[...source.dealers,...UI.dealers];
  const strings={
    '管理员后台':'Administración','界面语言':'Idioma','线索跟进工作台':'Seguimiento de Leads','集中管理普通线索信息、跟进动作与客户沟通上下文':'Administra prospectos, acciones y el contexto de comunicación con clientes','购车报告':'Reporte de compra','提交并进入下一条':'Enviar y abrir el siguiente','我的当前任务':'Mi tarea actual','任务 ID':'ID de tarea','处理中':'En proceso','待处理':'Pendiente','已完成':'Completada','首次联系':'Primer contacto','普通回访':'Seguimiento',
    '用户信息':'Información del cliente','编辑用户信息':'Editar cliente','城市':'Ciudad','预计购车时间':'Fecha estimada de compra','购车意向':'Intenciones de compra','序号':'N.º','品牌 / 车系':'Marca / línea','线索类型':'Tipo de prospecto','来源':'Origen','创建时间（UTC-6）':'Creación (UTC-6)','操作':'Acciones','编辑线索':'Editar prospecto','展开详情':'Mostrar detalles','收起详情':'Ocultar detalles','信息已修改':'Información modificada','金融购车':'Compra financiada','预约试驾':'Prueba de manejo','全款购车':'Compra de contado','线索信息':'Información del prospecto','线索来源':'Origen del prospecto','车辆信息':'Vehículo','品牌':'Marca','车系':'Línea','车型':'Versión','车价格':'Precio','经销商信息':'Distribuidor','经销商':'Distribuidor','州':'Estado','地址':'Dirección','金融信息':'Financiamiento','首付比例':'Enganche (%)','贷款期限':'Plazo (meses)','贷款利率':'Tasa anual (%)','月供':'Mensualidad (MXN)','金融机构':'Institución financiera','试驾信息':'Prueba de manejo','预约试驾时间':'Fecha de prueba','试驾说明':'Observaciones',
    '本次跟进':'Seguimiento actual','跟进结果':'Resultado','单选':'Una opción','未接通':'Sin respuesta','战败':'Perdido','金融买车':'Financiamiento','暂存':'En pausa','可下发':'Listo para enviar','战败信息':'Información de pérdida','战败原因':'Motivo de pérdida','暂存安排':'Pausa del seguimiento','暂存原因':'Motivo de pausa','金融买车跟进安排':'Seguimiento financiero','跟进事件':'Evento de seguimiento','下一次跟进时间':'Próximo contacto','补充金融资料':'Completar información financiera','确认金融方案':'Confirmar plan financiero','跟进审批进度':'Consultar aprobación','请选择':'Selecciona una opción','下发方式':'Método de envío','联系邮箱':'Correo de contacto','等待下发':'Pendiente de envío','需要尽快消化线索':'Procesar el prospecto lo antes posible','选择下一次需要跟进的事项':'Selecciona la próxima actividad','可重新选择下一次跟进时间':'Puedes ajustar la fecha del próximo contacto','接收邮箱':'Correo receptor',
    '跟进记事':'Notas de seguimiento','补充本次沟通情况（选填）':'Agrega detalles de la conversación (opcional)','操作记录':'Registro de operaciones','编辑记录':'Historial de edición','系统自动记录，按时间倒序展示。':'Registro automático, del más reciente al más antiguo.','原始信息保留在第一条，其后展示修改记录。':'Los datos originales aparecen primero, seguidos de los cambios.','销售记录的沟通原文。':'Notas originales de la conversación.','原始信息':'Información original','暂无记录':'Sin registros','添加记事':'Agregar nota','编辑记事':'Editar nota','记事内容':'Contenido','编辑':'Editar','操作人':'Operador','修改前':'Antes','修改后':'Después',
    '演示场景':'Escenarios de demostración','切换用户':'Cambiar cliente','演示修改保存在当前浏览器，不代表服务器数据。':'Los cambios se guardan en este navegador, no en el servidor.','关闭':'Cerrar','取消':'Cancelar','保存':'Guardar','放弃本次修改？':'¿Descartar los cambios?','当前内容尚未保存，关闭后将丢失本次修改。':'Los cambios no están guardados y se perderán al cerrar.','继续编辑':'Seguir editando','放弃修改':'Descartar','姓名':'Nombre','手机号':'Teléfono','所在城市':'Ciudad de residencia','修改手机号后需校验用户关联关系。':'Al cambiar el teléfono se valida la relación con el cliente.','当前购车意向':'Intenciones actuales','暂无已生成的购车报告':'Todavía no hay un reporte de compra','今天的任务已处理完毕':'Has terminado las tareas disponibles','当前状态不允许此结果':'Este resultado no está permitido en el estado actual','尚未配置接收邮箱，请联系管理员':'No hay correos receptores configurados; contacta al administrador','邮箱下发和等待下发尚无后台流转规则，请先配置。':'Faltan reglas de transición para correo o envío pendiente. Configúralas primero.',
    '请选择跟进结果':'Selecciona un resultado','请补全必填内容':'Completa los campos obligatorios','请选择原因':'Selecciona un motivo','请选择跟进事件':'Selecciona un evento','请选择主机厂和经销商':'Selecciona la marca y el distribuidor','下一次联系时间必须晚于当前时间':'El próximo contacto debe ser posterior a la hora actual','请输入有效手机号':'Ingresa un teléfono válido','手机号已关联其他用户，不能直接覆盖':'El teléfono pertenece a otro cliente; no se puede sobrescribir','没有修改':'Sin cambios','已保存':'Guardado','请选择有效经销商':'Selecciona un distribuidor válido','跟进已提交，已完成当前任务':'Seguimiento guardado; tarea completada','保存失败，内容已保留，请检查浏览器存储权限。':'No se pudo guardar. Se conservaron los datos; revisa los permisos del navegador.','后台配置已更新，请重新选择跟进结果':'Se actualizó la configuración; vuelve a seleccionar un resultado','线索 ID':'ID de prospecto','今日待处理任务':'Tareas pendientes hoy','用户约定说明':'Acuerdo con el cliente','配置要求补充原因':'La configuración requiere un motivo','当前状态不允许这个跟进结果，请重新选择':'Este resultado ya no está permitido; vuelve a seleccionarlo'
  };
  strings['下次回访时间']='Fecha del próximo seguimiento';
  Object.assign(strings,{
    '提交跟进':'Guardar seguimiento','确认提交':'Confirmar','提交下发':'Registrar envío','待补充信息说明':'Información por completar','战败原因说明':'Detalle del motivo de pérdida','暂存原因说明':'Detalle del motivo de pausa',
    '下发主机厂':'Marca receptora','下发经销商':'Distribuidor receptor','合作状态':'Estado de colaboración','已合作':'Colaborador activo','试用期':'En prueba','未合作':'Sin colaboración','系统读取':'Según configuración',
    '累计未接通':'Intentos sin respuesta acumulados','本次提交次数':'Intento actual','请手动选择下次回访时间':'Selecciona la fecha del próximo contacto','已按默认规则带入，销售可手动调整。':'Fecha sugerida; puedes ajustarla.',
    '本次提交后自动转为战败，原因记录为3次未接通。不再安排回访。':'Se marcará como perdido por 3 intentos sin respuesta. No se crearán más tareas.',
    '提交后转为战败，结束销售跟进，不再生成回访任务。':'Se marcará como perdido y finalizará el seguimiento, sin nuevas tareas.',
    '已合作：按规则需接口下发并邮件通知王龙。演示仅保存待处理记录，未发送。':'Colaborador activo: requiere API y correo a Wang Long. Esta demo solo registra el envío pendiente; no envía datos.',
    '试用期：按规则需邮件通知王龙。演示仅保存待通知记录，未发送。':'En prueba: requiere correo a Wang Long. Esta demo solo registra la notificación pendiente; no envía correos.',
    '未合作：提交后标记为待下发，不生成回访任务。':'Sin colaboración: quedará pendiente de envío, sin tarea de seguimiento.'
  });
  Object.assign(strings,{'预计购车时间（UTC-6）':'Fecha estimada de compra (UTC-6)','用户所在城市':'Ciudad del cliente','其他留资车辆':'Otros vehículos consultados','贷款期数':'Plazo (meses)','请先保存或取消当前修改':'Guarda o cancela primero los cambios actuales'});
  const t=s=>locale==='es-MX'?(strings[s]||s):s;
  function translate(){document.documentElement.lang=locale;document.title=t('线索跟进工作台');document.querySelectorAll('[data-ui]').forEach(n=>n.textContent=t(n.dataset.ui));document.querySelectorAll('[data-placeholder]').forEach(n=>n.placeholder=t(n.dataset.placeholder));$('languageSelect').value=locale;$('closeEditor').ariaLabel=t('关闭');$('purchaseDate').ariaLabel=t('预计购车时间');}
  function toast(s){clearTimeout(toastTimer);$('toast').textContent=t(s);$('toast').classList.add('show');toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4000);}
  const active=()=>users.find(x=>x.id===activeId),operator=()=>source.salesperson.id+' '+source.salesperson.name,stamp=()=>C.utc6().replace('T',' ');
  function persist(next){try{localStorage.setItem(UI.storageKey,JSON.stringify({version:UI.version,users:next}));users=next;return true;}catch{toast('保存失败，内容已保留，请检查浏览器存储权限。');return false;}}
  function transaction(fn){const next=C.clone(users);fn(next.find(x=>x.id===activeId));return persist(next);}
  function stateName(u){const s=config.states[u.state];return s?window.LEAD_FLOW_CONFIG.text(s,'main',locale)+' · '+window.LEAD_FLOW_CONFIG.text(s,'sub',locale):u.state;}
  function taskName(u){return u.task?(config.taskTypes[u.task.code]?window.LEAD_FLOW_CONFIG.text(config.taskTypes[u.task.code],'name',locale):u.task.group):t('已完成');}
  const resultName=code=>window.LEAD_FLOW_CONFIG.text(config.results[code],'label',locale);
  const dueNow=u=>u.task&&(!u.task.availableAt||C.parseTime(u.task.availableAt)<=Date.now());
  const eligible=()=>users.filter(u=>dueNow(u)&&!visited.has(u.id));
  function options(values,current='',placeholder=true){return(placeholder?`<option value="">${esc(t('请选择'))}</option>`:'')+values.map(v=>{const value=typeof v==='object'?v.value:v,label=typeof v==='object'?v.label:t(v);return`<option value="${esc(value)}" ${String(current)===String(value)?'selected':''}>${esc(label)}</option>`;}).join('');}
  function input(name,label,value='',type='text',extra=''){const unit={downPayment:' (%)',rate:' (%)',price:' (MXN)',monthlyPayment:' (MXN)',trialTime:' (UTC-6)'}[name]||'';return`<label class="field"><span>${esc(t(label)+unit)}${extra.includes('required')?' <span class="required">*</span>':''}</span><input name="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;}
  function select(name,label,values,value='',extra=''){return`<label class="field"><span>${esc(t(label))}${extra.includes('required')?' <span class="required">*</span>':''}</span><select name="${name}" ${extra}>${options(values,value)}</select></label>`;}
  function error(id,message){$(id).textContent=t(message);$(id).hidden=!message;}
  function detailsGroup(title,values){return`<section class="detail-group"><h3>${esc(t(title))}</h3><dl>${values.map(([k,v])=>`<div><dt>${esc(t(k))}</dt><dd>${esc(blank(v))}</dd></div>`).join('')}</dl></section>`;}
  const kind=i=>/试驾/.test(i.leadType)?'预约试驾':/全款/.test(i.leadType)?'全款购车':/金融/.test(i.leadType)?'金融购车':i.leadType;
  function renderIntents(){
    const u=active(),i=u.intentions[0]||{};
    const unit=(v,suffix)=>blank(v)==='--'?'--':/^\d+(\.\d+)?$/.test(String(v))?v+suffix:v;
    $('otherVehicles').textContent=u.intentions.slice(1).map(v=>[v.brand,v.series].filter(Boolean).join(' ')).join('、')||'--';
    const group=(label,values)=>`<dl class="user-field-group" aria-label="${esc(t(label))}">${values.map(([key,value,wide])=>`<div class="${wide?'wide':''}"><dt>${esc(t(key))}</dt><dd>${esc(blank(value))}</dd></div>`).join('')}</dl>`;
    $('intentRows').innerHTML=group('线索信息',[['线索来源',i.source],['线索类型',i.leadType],['创建时间（UTC-6）',i.createdAt||u.createdAt]])+
      group('车辆信息',[['品牌',i.brand],['车系',i.series],['车型',i.model],['车价格',unit(i.price,' MXN')]])+
      group('经销商信息',[['经销商',i.dealer],['城市',i.city||i.region],['州',i.province],['地址',i.address,true]])+
      (kind(i)==='预约试驾'?group('试驾信息',[['预约试驾时间',i.trialTime?.replace('T',' ')],['试驾说明',i.trialNote,true]]):
      group('金融信息',[['首付比例',unit(i.downPayment,'%')],['贷款利率',unit(i.rate,'%')],['贷款期数',unit(i.term,locale==='es-MX'?' meses':'期')],['月供',unit(i.monthlyPayment,' MXN')],['金融机构',i.institution]]));
  }
  const groups=[['pause','暂存'],['lost','战败'],['dispatch','可下发']];
  const codesForGroup=group=>C.codes(active(),config).filter(c=>C.group(c,config)===group);
  function renderResults(){const allowed=C.codes(active(),config);$('followState').textContent=(locale==='es-MX'?'Estado actual: ':'当前状态：')+stateName(active());$('submitFollowButton').disabled=!allowed.length||!dueNow(active())||visited.has(activeId);$('submitFollowButton').textContent=t('提交跟进');$('resultList').innerHTML=groups.map(([key,title])=>`<label class="result-option" title="${esc(codesForGroup(key).length?'':t('当前状态不允许此结果'))}"><input type="radio" name="resultGroup" value="${key}" ${key===selectedGroup?'checked':''} ${codesForGroup(key).length&&dueNow(active())&&!visited.has(activeId)?'':'disabled'}><span>${esc(t(title))}</span></label>`).join('');}
  function readDraft(){document.querySelectorAll('#conditionalFields [name]').forEach(n=>{if(n.type!=='radio'||n.checked)draft[n.name]=n.value;});}
  function renderConditional(){
    const list=codesForGroup(selectedGroup);if(!selectedGroup){$('conditionalFields').innerHTML='';return;}if(!list.includes(selectedCode))selectedCode=list.length===1?list[0]:'';
    let html='';
    const hint=(message,danger=false)=>`<p class="follow-hint ${danger?'danger':''}">${esc(t(message))}</p>`;
    if(selectedGroup==='lost'||selectedGroup==='pause')html+=select('resultCode',selectedGroup==='lost'?'战败原因':'暂存原因',list.map(c=>({value:c,label:resultName(c)})),selectedCode,'required');
    if(selectedGroup==='dispatch'){
      selectedCode=list[0];
      html+=select('oem','下发主机厂',Object.keys(UI.partners),draft.oem,'required')+select('dispatchDealer','下发经销商',dealers.filter(d=>d.brand===draft.oem).map(d=>d.name),draft.dispatchDealer,'required');
      const status=UI.partners[draft.oem]?.status;
      if(status)html+=`<p class="cooperation-status">${esc(t('合作状态'))}：${esc(t({active:'已合作',trial:'试用期',inactive:'未合作'}[status]))}（${esc(t('系统读取'))}）</p>`+hint({active:'已合作：按规则需接口下发并邮件通知王龙。演示仅保存待处理记录，未发送。',trial:'试用期：按规则需邮件通知王龙。演示仅保存待通知记录，未发送。',inactive:'未合作：提交后标记为待下发，不生成回访任务。'}[status]);
    }
    const tr=selectedCode?C.transition(active(),selectedCode,config):null;
    if(tr?.requireNote){const label=selectedCode==='missingInfo'?'待补充信息说明':selectedGroup==='lost'?'战败原因说明':'暂存原因说明';html+=`<label class="field"><span>${esc(t(label))} <span class="required">*</span></span><textarea name="agreement" required maxlength="1000" rows="2">${esc(draft.agreement||'')}</textarea></label>`;}
    if(selectedCode==='unreachable')html+=`<p class="caption">${esc(t('累计未接通'))} ${Number(active().unreachableCount||0)} · ${esc(t('本次提交次数'))} ${tr.count}</p>`;
    if(tr?.systemLost)html+=hint('本次提交后自动转为战败，原因记录为3次未接通。不再安排回访。',true);
    else if(tr?.terminal)html+=hint('提交后转为战败，结束销售跟进，不再生成回访任务。',true);
    else if(tr?.taskCode)html+=input('nextTime','下次回访时间',Object.hasOwn(draft,'nextTime')?draft.nextTime:tr.due,'datetime-local','required')+`<small class="muted caption">UTC-6 · ${esc(t(tr.manual?'请手动选择下次回访时间':'已按默认规则带入，销售可手动调整。'))}</small>`;
    $('conditionalFields').innerHTML=html?`<div class="conditional-panel">${html}</div>`:'';
    $('submitFollowButton').textContent=t(tr?.systemLost?'确认提交':selectedGroup==='dispatch'?'提交下发':'提交跟进');
  }
  function renderRecords(){
    const u=active();$('editCount').textContent=u.editRecords.filter(r=>r.type!=='original').length+1;$('noteCount').textContent=u.notes.length;
    document.querySelectorAll('[data-tab]').forEach(b=>{b.ariaSelected=String(b.dataset.tab===tab);b.tabIndex=b.dataset.tab===tab?0:-1;});$('recordPanel').setAttribute('aria-labelledby',tab+'Tab');
    const title={operations:'操作记录',edits:'编辑记录',notes:'跟进记事'}[tab],copy={operations:'系统自动记录，按时间倒序展示。',edits:'原始信息保留在第一条，其后展示修改记录。',notes:'销售记录的沟通原文。'}[tab];let rows=[];
    if(tab==='operations')rows=u.operations.map(([time,title,detail,by])=>({time,title,detail,by}));
    if(tab==='notes')rows=u.notes.map(([time,detail,by],index)=>({time,detail,by,index}));
    if(tab==='edits'){const orig=u.originalSnapshot;rows=[{time:u.createdAt,title:t('原始信息'),detail:[orig.name,orig.phone,orig.city,...orig.intentions.map(i=>i.brand+' · '+i.series+' · '+blank(i.model))].join('\n'),by:'系统'},...u.editRecords.filter(r=>r.type!=='original').map(r=>({time:r.time,title:r.title||t('编辑记录'),by:r.operator,detail:(r.changes||[]).map(c=>t(c.field)+': '+t('修改前')+' '+blank(c.before)+' → '+t('修改后')+' '+blank(c.after)).join('\n')}))];}
    $('recordPanel').innerHTML=`<h3>${esc(t(title))}</h3><p class="activity-copy">${esc(t(copy))}</p>${tab==='notes'?`<button class="text-button" id="addNote">+ ${esc(t('添加记事'))}</button>`:''}<ol class="timeline">${rows.length?rows.map(r=>`<li><time>${esc(r.time)}</time>${r.title?`<strong>${esc(r.title)}</strong>`:''}<p>${esc(r.detail)}</p><small>${esc(t('操作人'))}：${esc(r.by||operator())}</small>${r.index!==undefined?`<button class="text-button" data-edit-note="${r.index}">${esc(t('编辑'))}</button>`:''}</li>`).join(''):`<li>${esc(t('暂无记录'))}</li>`}</ol>`;
  }
  function render(){const u=active();if(!u)return;translate();const available=eligible();$('todayTaskCount').textContent=t('今日待处理任务')+' '+available.length;$('taskStatus').textContent=t(dueNow(u)&&!visited.has(u.id)?'处理中':u.task?'待处理':'已完成');$('taskTitle').textContent=available.length||dueNow(u)&&!visited.has(u.id)?taskName(u):t('今天的任务已处理完毕');$('taskId').textContent=u.task?.id||'--';$('taskGroup').textContent=taskName(u);$('userName').textContent=u.name;$('userPhone').textContent=u.phone;$('userAvatar').textContent=(u.name||'?').trim().split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase();$('userCity').textContent=blank(u.city);$('purchaseDate').textContent=blank(u.purchaseDate);$('leadId').textContent=u.id;$('submitTopButton').disabled=!dueNow(u)||visited.has(u.id);$('scenarioSelect').innerHTML=users.map(x=>`<option value="${esc(x.id)}" ${x.id===activeId?'selected':''}>${esc(x.id+' · '+x.name+' · '+stateName(x))}</option>`).join('');renderIntents();renderResults();renderConditional();renderRecords();}
  function resetFollow(){selectedGroup='';selectedCode='';draft={};$('followNote').value='';error('followError','');}
  function changes(before,after,labels){return Object.keys(after).filter(k=>String(before[k]??'')!==String(after[k]??'')).map(k=>({field:labels[k]||k,before:before[k]??'',after:after[k]??''}));}
  function logEdit(u,title,diff){u.editRecords.unshift({title,time:stamp(),operator:operator(),changes:diff});u.operations.unshift([stamp(),title,diff.map(c=>c.field+'：'+blank(c.before)+' → '+blank(c.after)).join('；'),operator()]);}
  function submit(){
    config=loadConfig();readDraft();if(!selectedGroup||!selectedCode)return error('followError',['lost','pause'].includes(selectedGroup)?'请选择原因':'请选择跟进结果');
    let tr;try{tr=C.transition(active(),selectedCode,config);}catch(e){return error('followError',e.message);}if(!dueNow(active())||visited.has(activeId))return;
    if(selectedGroup==='dispatch'&&!['active','trial','inactive'].includes(UI.partners[draft.oem]?.status))return error('followError','请选择主机厂和经销商');
    if(tr.requireDealer&&!dealers.some(d=>d.name===draft.dispatchDealer&&d.brand===draft.oem))return error('followError','请选择主机厂和经销商');
    if(tr.requireNote&&!draft.agreement?.trim())return error('followError','请补全必填内容');
    const reason=tr.systemLost?tr.reason:tr.requireNote?draft.agreement.trim():config.results[selectedCode].lostReason||config.results[selectedCode].label;
    if(tr.requireReason&&!reason)return error('followError','请选择原因');
    const invalid=$('conditionalFields').querySelector(':invalid');if(invalid){invalid.reportValidity();return error('followError','请补全必填内容');}
    const nextTime=Object.hasOwn(draft,'nextTime')?draft.nextTime:tr.due;if(!tr.terminal&&tr.taskCode&&(!nextTime||!Number.isFinite(C.parseTime(nextTime))||C.parseTime(nextTime)<=Date.now()))return error('followError','下一次联系时间必须晚于当前时间');
    const note=$('followNote').value.trim(),doneId=activeId,code=selectedCode;
    if(!transaction(u=>{const previous=u.state,task=u.task;u.taskHistory.push({...task,status:'completed',completedAt:new Date().toISOString(),result:code});u.state=tr.state;u.unreachableCount=tr.count;u.lostReason=tr.terminal?reason:'';
      u.operations.unshift([stamp(),'跟进提交',config.results[code].label+(reason?'；'+reason:'')+(draft.financeEvent?'；'+draft.financeEvent:''),operator()],[stamp(),'任务完成',task.id+' · 已完成',operator()]);
      if(previous!==u.state)u.operations.unshift([stamp(),'状态流转',previous+' → '+u.state,'系统']);if(note)u.notes.unshift([stamp(),note,operator()]);if(draft.agreement)u.notes.unshift([stamp(),draft.agreement,operator()]);
      if(code==='missingInfo')u.informationCount=Number(u.informationCount||0)+1;
      u.followups=u.followups||[];u.followups.push({result:code,reason,explanation:tr.requireNote?draft.agreement.trim():'',nextTime:tr.taskCode?nextTime:null,at:new Date().toISOString(),operator:operator()});
      if(tr.requireDealer){const cooperation=UI.partners[draft.oem].status;u.dispatch={method:cooperation==='active'?'api-and-email':cooperation==='trial'?'email':'wait',oem:draft.oem,dealer:draft.dispatchDealer,cooperation,status:'pending',demo:true,recordedAt:new Date().toISOString()};}
      u.task=tr.terminal||!tr.taskCode?null:{id:'TASK-'+Date.now(),code:tr.taskCode,group:tr.taskName,due:nextTime.replace('T',' '),availableAt:nextTime,status:'pending',event:draft.financeEvent||''};
    }))return;
    visited.add(doneId);const next=eligible()[0];if(next)activeId=next.id;resetFollow();if(next)expanded.add(next.intentions[0].id);render();toast('跟进已提交，已完成当前任务');window.scrollTo({top:0,behavior:'smooth'});
  }
  const editorValues=()=>Object.fromEntries(new FormData($('editorForm')));
  function openEditor(type,index){
    editorState={type,index};$('editor').className='editor'+(type==='intent'?' intent-editor'+(kind(active().intentions[index])==='预约试驾'?' trial-editor':''):'');error('editorError','');$('saveEditor').hidden=type==='report';$('cancelEditor').textContent=t(type==='report'?'关闭':'取消');
    if(type==='user'){const u=active();$('editorTitle').textContent=t('编辑用户信息');$('editorBody').innerHTML=`<div class="single-column">${input('name','姓名',u.name,'text','required maxlength="100"')}${input('phone','手机号',u.phone,'tel','required maxlength="20"')}<p class="muted caption">${esc(t('修改手机号后需校验用户关联关系。'))}</p>${select('city','所在城市',[...new Set([...UI.cities,u.city].filter(Boolean))],u.city)}${input('purchaseDate','预计购车时间',u.purchaseDate,'date')}</div><section class="editor-section"><h3>${esc(t('车辆信息'))}</h3>${u.intentions.map((i,index)=>`<div class="report-row"><span>${esc(i.brand+' '+i.series)}</span><button type="button" class="text-button" data-edit-intent="${index}">${esc(t('编辑线索'))}</button></div>`).join('')}</section>`;}
    else if(type==='intent')renderIntentEditor(index);
    else if(type==='note'){const note=index===undefined?'':active().notes[index][1];$('editorTitle').textContent=t(index===undefined?'添加记事':'编辑记事');$('editorBody').innerHTML=`<label class="field"><span>${esc(t('记事内容'))}</span><textarea name="note" rows="5" required maxlength="5000">${esc(note)}</textarea></label>`;}
    else{const u=active();$('editorTitle').textContent=t('购车报告');$('editorBody').innerHTML=`<h3>${esc(u.name)}</h3><p class="muted">${esc(u.phone)}</p><h3 class="editor-section">${esc(t('当前购车意向'))}（${u.intentions.length}）</h3>${u.intentions.map(i=>`<div class="report-row"><strong>${esc(i.brand+' · '+i.series)}</strong><span class="pill">${esc(t(kind(i)))}</span></div>`).join('')}<div class="report-empty">${esc(t('暂无已生成的购车报告'))}</div>`;}
    editorSnapshot=JSON.stringify(editorValues());$('editor').showModal();
  }
  const numeric=v=>v===undefined?'':String(v).replace(/[^\d.]/g,'');
  function renderIntentEditor(index){const i=active().intentions[index],trial=kind(i)==='预约试驾';$('editorTitle').textContent=t('编辑线索')+' · '+i.brand+' / '+i.series;
    const sec=(title,html,cls='')=>`<section class="editor-section"><h3>${esc(t(title))}</h3><div class="form-grid ${cls}">${html}</div></section>`;
    $('editorBody').innerHTML=`<p class="muted caption">${esc(t(kind(i))+' · '+i.source+' · '+i.createdAt+'（UTC-6）')}</p>`+sec('车辆信息',select('brand','品牌',Object.keys(catalog),i.brand,'required')+select('series','车系',Object.keys(catalog[i.brand]||{}),i.series,'required')+select('model','车型',catalog[i.brand]?.[i.series]||[],i.model)+(trial?'':input('price','车价格',numeric(i.price),'number','min="0" step="0.01"')))+sec('经销商信息',select('dealer','经销商',dealers.filter(d=>d.brand===i.brand).map(d=>d.name),i.dealer)+input('province','州',i.province||'','text','readonly')+input('city','城市',i.city||i.region||'','text','readonly')+input('address','地址',i.address||'','text','readonly'))+(trial?sec('试驾信息',input('trialTime','预约试驾时间',i.trialTime||'','datetime-local')+`<label class="field full-width"><span>${esc(t('试驾说明'))}</span><textarea name="trialNote" rows="3">${esc(i.trialNote||'')}</textarea></label>`):sec('金融信息',input('downPayment','首付比例',numeric(i.downPayment),'number','min="0" max="100" step="0.01"')+select('term','贷款期限',[12,24,36,48,60,72,84],numeric(i.term))+input('rate','贷款利率',numeric(i.rate),'number','min="0" max="100" step="0.01"')+input('monthlyPayment','月供',numeric(i.monthlyPayment),'number','min="0" step="0.01"')+input('institution','金融机构',i.institution||''),'three'));
  }
  const labels={name:'姓名',phone:'手机号',city:'城市',purchaseDate:'预计购车时间',brand:'品牌',series:'车系',model:'车型',price:'车价格',dealer:'经销商',province:'州',address:'地址',downPayment:'首付比例',term:'贷款期限',rate:'贷款利率',monthlyPayment:'月供',institution:'金融机构',trialTime:'预约试驾时间',trialNote:'试驾说明'};
  function saveEditor(event){event.preventDefault();if(!editorState||editorState.type==='report')return;const{type,index}=editorState,values=editorValues();let diff;
    if(type==='user'){values.name=values.name.trim();values.phone=values.phone.trim();if(!values.name)return error('editorError','请补全必填内容');const digits=values.phone.replace(/\D/g,'');if(!/^\+?[\d ()-]+$/.test(values.phone)||digits.length<10||digits.length>15)return error('editorError','请输入有效手机号');if(values.phone!==active().phone&&users.some(u=>u.id!==activeId&&u.phone.replace(/\D/g,'')===digits))return error('editorError','手机号已关联其他用户，不能直接覆盖');diff=changes(active(),values,labels);}
    else if(type==='intent'){const i=active().intentions[index];if(values.dealer&&!dealers.some(d=>d.name===values.dealer&&d.brand===values.brand))return error('editorError','请选择有效经销商');const initial=JSON.parse(editorSnapshot);Object.keys(values).forEach(k=>{if(values[k]===initial[k])values[k]=i[k]??'';});diff=changes(i,values,labels);}
    else if(!values.note.trim())return error('editorError','请补全必填内容');
    if(type!=='note'&&!diff.length){$('editor').close();editorState=null;return toast('没有修改');}
    if(!transaction(u=>{if(type==='user'){Object.assign(u,values);logEdit(u,'用户信息变更',diff);}else if(type==='intent'){Object.assign(u.intentions[index],values,{changed:true});logEdit(u,'购车意向变更 · '+u.intentions[index].id,diff);}else if(index===undefined)u.notes.unshift([stamp(),values.note.trim(),operator()]);else{u.operations.unshift([stamp(),'跟进记事修改',u.notes[index][1]+' → '+values.note.trim(),operator()]);u.notes[index]=[stamp(),values.note.trim(),operator()];}}))return;
    $('editor').close();editorState=null;readDraft();render();toast('已保存');
  }
  function requestClose(){if(editorState?.type!=='report'&&JSON.stringify(editorValues())!==editorSnapshot){$('discardDialog').showModal();return;}$('editor').close();editorState=null;}
  $('editorForm').addEventListener('submit',saveEditor);$('closeEditor').onclick=requestClose;$('cancelEditor').onclick=requestClose;$('editor').addEventListener('cancel',e=>{e.preventDefault();requestClose();});$('keepEditing').onclick=()=>$('discardDialog').close();$('discardChanges').onclick=()=>{$('discardDialog').close();$('editor').close();editorState=null;};
  $('editorBody').addEventListener('change',e=>{if(editorState?.type!=='intent')return;const f=$('editorForm').elements;if(e.target.name==='brand'){f.series.innerHTML=options(Object.keys(catalog[f.brand.value]||{}));f.model.innerHTML=options([]);f.dealer.innerHTML=options(dealers.filter(d=>d.brand===f.brand.value).map(d=>d.name));['province','city','address'].forEach(k=>f[k].value='');}if(e.target.name==='series')f.model.innerHTML=options(catalog[f.brand.value]?.[f.series.value]||[]);if(e.target.name==='dealer'){const d=dealers.find(d=>d.name===f.dealer.value);f.province.value=d?.province||'';f.city.value=d?.city||d?.region||'';f.address.value=d?.address||'';}});
  $('editorBody').addEventListener('click',e=>{const edit=e.target.closest('[data-edit-intent]');if(!edit)return;if(JSON.stringify(editorValues())!==editorSnapshot){error('editorError','请先保存或取消当前修改');return;}$('editor').close();openEditor('intent',Number(edit.dataset.editIntent));});
  $('editUserButton').onclick=()=>openEditor('user');$('reportButton').onclick=()=>openEditor('report');
  $('resultList').onchange=e=>{selectedGroup=e.target.value;selectedCode='';draft={};error('followError','');renderConditional();};
  $('conditionalFields').addEventListener('input',e=>{if(e.target.name==='nextTime')draft.timeEdited=true;});
  $('conditionalFields').addEventListener('change',e=>{readDraft();if(e.target.name==='resultCode'){selectedCode=e.target.value;draft={resultCode:selectedCode};}if(e.target.name==='oem')delete draft.dispatchDealer;if(['resultCode','oem'].includes(e.target.name))renderConditional();});
  $('submitTopButton').onclick=submit;
  $('submitFollowButton').onclick=submit;
  document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;renderRecords();}});
  document.querySelector('.tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const keys=['operations','edits','notes'],i=keys.indexOf(tab);tab=e.key==='Home'?keys[0]:e.key==='End'?keys[2]:keys[(i+(e.key==='ArrowRight'?1:2))%3];renderRecords();$(tab+'Tab').focus();});
  $('recordPanel').addEventListener('click',e=>{if(e.target.closest('#addNote'))openEditor('note');const b=e.target.closest('[data-edit-note]');if(b)openEditor('note',Number(b.dataset.editNote));});
  $('scenarioSelect').onchange=e=>{if(($('followNote').value||selectedGroup)&&!window.confirm(t('当前内容尚未保存，关闭后将丢失本次修改。'))){e.target.value=activeId;return;}activeId=e.target.value;expanded.add(active().intentions[0].id);resetFollow();render();};
  $('languageSelect').onchange=e=>{readDraft();locale=e.target.value;try{localStorage.setItem('crmLocale',locale);}catch{}error('followError','');render();};
  function refreshConfig(){const next=loadConfig();if(JSON.stringify(next)!==JSON.stringify(config)){config=next;selectedCode='';selectedGroup='';draft={};render();toast('后台配置已更新，请重新选择跟进结果');}}
  window.addEventListener('focus',refreshConfig);window.addEventListener('storage',e=>{if([window.LEAD_FLOW_CONFIG.storageKey,'autocava_admin_demo_config_v2'].includes(e.key))refreshConfig();});
  window.addEventListener('beforeunload',e=>{if($('followNote').value||selectedGroup||editorState&&editorState.type!=='report'&&JSON.stringify(editorValues())!==editorSnapshot){e.preventDefault();e.returnValue='';}});
  let storageWarning=false;
  try{locale=localStorage.getItem('crmLocale')==='es-MX'?'es-MX':'zh-CN';const saved=JSON.parse(localStorage.getItem(UI.storageKey)||'null');if(['2026.10.11.1','2026.10.12.1',UI.version].includes(saved?.version)&&Array.isArray(saved.users)&&saved.users.length)users=saved.users.map(C.normalize);}catch{storageWarning=true;}
  if(!users)users=[UI.demoUser,...source.leads.map(l=>({...l,...window.CRM_CONFIG_TABLE?.leadProfiles?.[l.id]}))].map(C.normalize);
  const requested=new URLSearchParams(location.search).get('lead');activeId=users.some(u=>u.id===requested)?requested:(eligible()[0]||users[0]).id;expanded.add(active().intentions[0].id);$('salesperson').textContent=operator();render();if(storageWarning)toast('保存失败，内容已保留，请检查浏览器存储权限。');
})();
