const data = window.CRM_DEMO_DATA;
const table = window.CRM_CONFIG_TABLE || { leadProfiles: {} };
// The display model is assembled from the configuration table first, then
// enriched with demo-only history. This is the same seam an API adapter can use.
const leads = data.leads.map((lead) => ({ ...lead, ...(table.leadProfiles[lead.id] || {}) }));
const vehicleCatalog = data.vehicleCatalog || {};
const dealerDirectory = data.dealers || [];
let flowConfig = window.LEAD_FLOW_CONFIG.load();
let currentIndex = 0;
let selectedResult = null;
let toastTimer;

const messages = {
  "zh-CN": {
    "brand.home": "返回工作台首页", "language.label": "界面语言", "account.role": "当前角色：销售",
    "page.title": "线索跟进工作台", "page.subtitle": "集中管理普通线索信息、跟进动作与客户沟通上下文", "page.todayTasks": "今日待处理任务 {count}",
    "action.submit": "提交", "action.submitNext": "提交并进入下一条", "action.close": "关闭", "action.cancel": "取消", "action.save": "保存修改",
    "task.current": "我的当前任务", "task.processing": "处理中", "task.trigger": "触发原因：", "task.id": "任务 ID",
    "user.title": "用户信息", "user.changed": "信息已修改", "user.edit": "编辑信息",
    "lead.info": "线索信息", "lead.source": "线索来源", "lead.type": "线索类型", "lead.state": "当前线索状态", "lead.created": "创建时间", "config.link": "普通线索配置",
    "field.name": "姓名", "field.phone": "手机号", "field.brand": "品牌", "field.series": "车系", "field.model": "车型", "field.region": "地区", "field.address": "地址",
    "dealer.finance": "经销商与金融信息", "dealer.name": "经销商", "dealer.placeholder": "输入或选择经销商", "dealer.hint": "可输入名称联想选择", "finance.price": "车价格", "finance.rate": "年利率", "finance.term": "贷款期数",
    "follow.title": "本次跟进", "follow.description": "当前任务决定跟进内容，业务状态随跟进结果流转", "follow.scenario": "切换普通线索演示场景", "follow.currentState": "当前状态", "follow.result": "跟进结果", "follow.reason": "原因", "follow.reasonPlaceholder": "请输入具体原因", "follow.callbackNote": "用户约定说明", "follow.callbackPlaceholder": "例如：下班后方便接听", "follow.nextTime": "下一次联系时间", "follow.timeHint": "系统已按规则给出默认值，销售可以调整。", "follow.afterState": "提交后状态", "follow.nextTask": "下一任务", "follow.waiting": "等待选择跟进结果", "follow.noTask": "不再生成任务", "follow.attempts": "未接通 {count} 次",
    "records.operations": "操作记录", "records.notes": "跟踪记事", "records.description": "系统自动记录，按时间倒序展示。", "records.operator": "操作人：{operator}",
    "notes.addTitle": "销售手动添加跟踪记录", "notes.description": "记录沟通中的关键信息。", "notes.content": "跟踪内容", "notes.placeholder": "只记录用户输入或销售确认的关键信息", "notes.add": "添加记录", "notes.record": "跟踪记录",
    "edit.title": "编辑用户信息", "edit.tip": "修改后保留原始信息，并生成信息变更记录，不覆盖原始线索。", "edit.tabsLabel": "用户信息类型", "edit.original": "原始信息", "edit.current": "当前信息", "edit.history": "编辑记录", "edit.originalNotice": "首次进入 CRM 时保存的线索信息，只读且不会被后续编辑覆盖。", "edit.currentNoticeTitle": "工作台当前展示信息", "edit.currentNoticeText": "保存修改后，用户信息卡片立即更新。", "edit.historyTitle": "信息编辑记录", "edit.historyOrder": "按修改时间倒序展示", "edit.noHistory": "暂无编辑记录", "edit.initialRecord": "原始线索信息", "edit.initialValue": "原始值：{value}", "edit.close": "关闭",
    "watch.on": "★ 已关注", "watch.off": "☆ 关注",
    "validation.result": "请选择跟进结果", "validation.reason": "请填写原因；战败或无意向原因不能为空", "validation.callbackNote": "请填写用户约定说明", "validation.callbackTime": "请选择用户约定的下一次联系时间", "validation.nextTime": "请选择下一次联系时间", "validation.dealer": "请从联想列表中选择有效经销商",
    "toast.submitted": "{id} 已提交，当前任务已完成，已进入下一条", "toast.watched": "已关注当前线索", "toast.unwatched": "已取消关注", "toast.noteRequired": "请输入跟踪内容", "toast.noteAdded": "跟踪记录已添加", "toast.noChanges": "当前信息没有变化", "toast.userUpdated": "用户当前信息已更新，原始线索信息未被覆盖"
  },
  "es-MX": {
    "brand.home": "Volver al inicio", "language.label": "Idioma", "account.role": "Rol actual: Ventas",
    "page.title": "Seguimiento de Leads", "page.subtitle": "Administra prospectos, acciones de seguimiento y el contexto de comunicación con clientes", "page.todayTasks": "Tareas pendientes hoy: {count}",
    "action.submit": "Enviar", "action.submitNext": "Enviar y abrir el siguiente", "action.close": "Cerrar", "action.cancel": "Cancelar", "action.save": "Guardar cambios",
    "task.current": "Mi tarea actual", "task.processing": "En proceso", "task.trigger": "Motivo de activación: ", "task.id": "ID de tarea",
    "user.title": "Información del cliente", "user.changed": "Información modificada", "user.edit": "Editar información",
    "lead.info": "Información del prospecto", "lead.source": "Origen del prospecto", "lead.type": "Tipo de prospecto", "lead.state": "Estado actual del prospecto", "lead.created": "Fecha de creación", "config.link": "Configuración de prospectos",
    "field.name": "Nombre", "field.phone": "Teléfono", "field.brand": "Marca", "field.series": "Línea", "field.model": "Versión", "field.region": "Región", "field.address": "Dirección",
    "dealer.finance": "Distribuidor e información financiera", "dealer.name": "Distribuidor", "dealer.placeholder": "Escribe o selecciona un distribuidor", "dealer.hint": "Escribe para buscar por nombre", "finance.price": "Precio del vehículo", "finance.rate": "Tasa anual", "finance.term": "Plazo del crédito",
    "follow.title": "Seguimiento actual", "follow.description": "La tarea define las acciones disponibles y el resultado actualiza el estado comercial", "follow.scenario": "Cambiar escenario de prospecto", "follow.currentState": "Estado actual", "follow.result": "Resultado del seguimiento", "follow.reason": "Motivo", "follow.reasonPlaceholder": "Ingresa el motivo específico", "follow.callbackNote": "Acuerdo con el cliente", "follow.callbackPlaceholder": "Ejemplo: llamar después del trabajo", "follow.nextTime": "Próximo contacto", "follow.timeHint": "El sistema propone una fecha según las reglas; el vendedor puede ajustarla.", "follow.afterState": "Estado después de enviar", "follow.nextTask": "Siguiente tarea", "follow.waiting": "Selecciona un resultado", "follow.noTask": "No se generará otra tarea", "follow.attempts": "Sin respuesta: {count} intento(s)",
    "records.operations": "Registro de operaciones", "records.notes": "Notas de seguimiento", "records.description": "Registro automático en orden cronológico inverso.", "records.operator": "Operador: {operator}",
    "notes.addTitle": "Agregar nota de seguimiento", "notes.description": "Registra la información clave de la conversación.", "notes.content": "Contenido de la nota", "notes.placeholder": "Registra únicamente información proporcionada o confirmada por el cliente", "notes.add": "Agregar nota", "notes.record": "Nota de seguimiento",
    "edit.title": "Editar información del cliente", "edit.tip": "Los datos originales se conservan y cada cambio genera un registro de edición.", "edit.tabsLabel": "Tipo de información del cliente", "edit.original": "Información original", "edit.current": "Información actual", "edit.history": "Historial de cambios", "edit.originalNotice": "Información guardada al ingresar por primera vez al CRM. Es de solo lectura y no se sobrescribe.", "edit.currentNoticeTitle": "Información mostrada en la mesa", "edit.currentNoticeText": "Al guardar, la tarjeta del cliente se actualiza de inmediato.", "edit.historyTitle": "Historial de edición", "edit.historyOrder": "Del más reciente al más antiguo", "edit.noHistory": "No hay cambios registrados", "edit.initialRecord": "Información original del prospecto", "edit.initialValue": "Valor original: {value}", "edit.close": "Cerrar",
    "watch.on": "★ Siguiendo", "watch.off": "☆ Seguir",
    "validation.result": "Selecciona un resultado de seguimiento", "validation.reason": "Ingresa un motivo; es obligatorio para prospectos perdidos o sin interés", "validation.callbackNote": "Describe el acuerdo con el cliente", "validation.callbackTime": "Selecciona la fecha acordada con el cliente", "validation.nextTime": "Selecciona la fecha del próximo contacto", "validation.dealer": "Selecciona un distribuidor válido de la lista",
    "toast.submitted": "{id} enviado. La tarea actual se completó y se abrió el siguiente prospecto", "toast.watched": "Prospecto agregado a seguimiento", "toast.unwatched": "Prospecto eliminado de seguimiento", "toast.noteRequired": "Ingresa el contenido de la nota", "toast.noteAdded": "Nota de seguimiento agregada", "toast.noChanges": "No hay cambios en la información actual", "toast.userUpdated": "La información actual se actualizó; los datos originales se conservaron"
  }
};

let currentLocale = (() => {
  try { return localStorage.getItem("crmLocale") || "zh-CN"; } catch (error) { return "zh-CN"; }
})();
if (!messages[currentLocale]) currentLocale = "zh-CN";

function t(key, params = {}) {
  const template = messages[currentLocale][key] || messages["zh-CN"][key] || key;
  return template.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? "");
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLocale;
  document.title = t("page.title");
  document.querySelectorAll("[data-i18n]").forEach((node) => { node.textContent = t(node.dataset.i18n); });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  document.querySelectorAll("[data-i18n-aria-label]").forEach((node) => { node.setAttribute("aria-label", t(node.dataset.i18nAriaLabel)); });
  $("languageSelect").value = currentLocale;
}

const $ = (id) => document.getElementById(id);
const el = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function stateMeta(key) {
  return flowConfig.states[key] || flowConfig.states.unfollowed;
}

function stateLabel(key, lead) {
  const state = stateMeta(key);
  const main = window.LEAD_FLOW_CONFIG.text(state, "main", currentLocale);
  let sub = window.LEAD_FLOW_CONFIG.text(state, "sub", currentLocale);
  if (key === "lost" && lead?.lostReason) sub = lead.lostReason;
  return main + " · " + sub;
}

function dataStateLabel(key, lead) {
  const state = stateMeta(key);
  return state.main + " · " + (key === "lost" && lead?.lostReason ? lead.lostReason : state.sub);
}

function resultConfig(code) {
  return flowConfig.results[code];
}

function resultCodesFor(lead) {
  return (flowConfig.routes[lead.state] || []).filter((code) => flowConfig.results[code]?.enabled !== false);
}

function resultLabelFor(lead, code) {
  const config = resultConfig(code);
  if (code !== "unreachable") return window.LEAD_FLOW_CONFIG.text(config, "label", currentLocale);
  const attempt = lead.unreachableCount + 1;
  return currentLocale === "es-MX"
    ? "Sin respuesta (intento " + attempt + (attempt >= flowConfig.policies.unreachableLimit ? ", límite alcanzado" : "") + ")"
    : "未接通（第" + attempt + "次" + (attempt >= flowConfig.policies.unreachableLimit ? "，达上限" : "") + "）";
}

function dataResultLabelFor(lead, code) {
  if (code !== "unreachable") return resultConfig(code).label;
  const attempt = lead.unreachableCount + 1;
  return "未接通（第" + attempt + "次" + (attempt >= flowConfig.policies.unreachableLimit ? "，达上限" : "") + "）";
}

function demoNow() {
  return new Date();
}

function toInputValue(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes());
}

function addHours(hours) {
  const date = demoNow();
  date.setHours(date.getHours() + hours);
  return toInputValue(date);
}

function addDays(days) {
  const date = demoNow();
  date.setDate(date.getDate() + days);
  return toInputValue(date);
}

function tomorrowAtTen() {
  const date = demoNow();
  date.setDate(date.getDate() + 1);
  date.setHours(10, 0, 0, 0);
  return toInputValue(date);
}

function addMinutes(minutes) {
  const date = demoNow();
  date.setMinutes(date.getMinutes() + Number(minutes || 0));
  return toInputValue(date);
}

function deadlineValue(deadline) {
  if (!deadline || deadline.type === "none") return "";
  if (deadline.type === "manual") return "";
  if (deadline.type === "days") return addDays(deadline.value);
  return addMinutes(deadline.value);
}

function deadlineLabel(deadline) {
  if (!deadline || deadline.type === "none") return currentLocale === "es-MX" ? "Sin tarea posterior" : "不生成后续任务";
  if (deadline.type === "manual") return currentLocale === "es-MX" ? "Hora indicada por el cliente" : "销售填写客户约定时间";
  if (deadline.type === "days") return "+" + deadline.value + (currentLocale === "es-MX" ? " días" : "天");
  return "+" + Math.round(deadline.value / 60 * 10) / 10 + (currentLocale === "es-MX" ? " h" : "小时");
}

function readableTime(value) {
  if (!value) return "—";
  return value.replace("T", " ");
}

function getTransition(lead, code) {
  const config = resultConfig(code);
  const adminFlow = (flowConfig.adminFlows || []).find((flow) => flow.current === lead.state && flow.result === code);
  const adminTaskRule = adminFlow?.taskRuleId ? (flowConfig.adminTaskRules || []).find((rule) => rule.id === adminFlow.taskRuleId && rule.enabled !== false) : null;
  const nextCount = code === "unreachable" ? lead.unreachableCount + 1 : lead.unreachableCount;
  const unreachableLimit = Number(adminFlow?.terminalAt || flowConfig.policies.unreachableLimit);
  if (code === "unreachable" && nextCount >= unreachableLimit) {
    return { state: adminFlow?.terminalNext || "lost", reason: unreachableLimit + "次未接通", terminal: true, systemLost: true, nextCount };
  }
  let target = adminFlow?.next || (config.target === "same" ? lead.state : (config.target || lead.state));
  if (code === "callback" && ["unfollowed", "overdue"].includes(lead.state)) target = "followup";
  const terminal = Boolean(config.terminal || stateMeta(target).terminal);
  const taskCode = adminFlow?.task || config.task;
  const taskType = taskCode ? flowConfig.taskTypes[taskCode] : null;
  const trigger = code === "unreachable" ? "累计第" + nextCount + "次未接通" : config.label;
  const deadlineText = adminTaskRule?.deadline || adminFlow?.deadline || "";
  let deadline = config.deadline;
  if (deadlineText.includes("手动")) deadline = { type: "manual" };
  else if (/\+?\s*30\s*天/.test(deadlineText)) deadline = { type: "days", value: 30 };
  else if (/\+?\s*2\s*小时/.test(deadlineText)) deadline = { type: "minutes", value: 120 };
  else if (/30\s*分钟/.test(deadlineText)) deadline = { type: "minutes", value: 30 };
  return {
    state: target,
    reason: config.lostReason || "",
    terminal,
    taskCode,
    task: adminTaskRule?.type || taskType?.name,
    trigger: adminTaskRule?.trigger || trigger,
    time: deadlineValue(deadline),
    manualTime: deadline?.type === "manual",
    requireReason: Boolean(adminFlow?.reason || config.requireReason),
    requireNote: Boolean(config.requireNote || resultConfig(code)?.requireNote),
    nextCount
  };
}

function activeLead() {
  return leads[currentIndex];
}

function selectLeadFromUrl() {
  const requested = new URLSearchParams(window.location.search).get("lead");
  const index = leads.findIndex((lead) => lead.id === requested && lead.task);
  if (index >= 0) currentIndex = index;
}

function initials(name) {
  return name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function fillText(id, value) {
  $(id).textContent = value ?? "—";
}

function renderScenarioOptions() {
  const select = $("scenarioSelect");
  select.innerHTML = "";
  leads.forEach((lead, index) => {
    if (!lead.task) return;
    const option = el("option", "", lead.task.group + "｜" + stateLabel(lead.state, lead) + "｜" + lead.name);
    option.value = String(index);
    option.selected = index === currentIndex;
    select.appendChild(option);
  });
}

function renderLead() {
  const lead = activeLead();
  selectedResult = null;
  fillText("leadId", lead.id);
  const todayPendingTasks = leads.filter((item) => item.task);
  fillText("todayTaskCount", t("page.todayTasks", { count: todayPendingTasks.length }));
  fillText("taskTitle", lead.task?.group || "当前任务已完成");
  fillText("taskTrigger", lead.task?.trigger || "没有待处理任务");
  fillText("taskId", lead.task?.id || "—");
  fillText("taskGroupLabel", lead.task?.group || "已完成");
  fillText("avatar", initials(lead.name));
  fillText("userName", lead.name);
  fillText("userPhone", lead.phone);
  fillText("source", lead.source);
  fillText("leadType", lead.leadType);
  fillText("brand", lead.brand);
  fillText("series", lead.series);
  fillText("model", lead.model);
  fillText("createdAt", lead.createdAt);
  fillText("dealer", lead.dealer);
  fillText("region", lead.region);
  fillText("address", lead.address);
  fillText("price", lead.price);
  fillText("rate", lead.rate);
  fillText("term", lead.term);
  fillText("currentState", stateLabel(lead.state, lead));
  fillText("leadStateInUser", stateLabel(lead.state, lead));
  fillText("attemptCount", t("follow.attempts", { count: lead.unreachableCount }));
  $("changedBadge").hidden = !lead.changed && !(lead.editRecords && lead.editRecords.length);
  $("watchButton").classList.toggle("watching", Boolean(lead.watched));
  $("watchButton").textContent = lead.watched ? t("watch.on") : t("watch.off");
  $("watchButton").setAttribute("aria-pressed", String(Boolean(lead.watched)));
  renderScenarioOptions();
  renderResults();
  renderRecords();
  resetDynamicFields();
  $("submitButton").disabled = !lead.task;
  $("submitTopButton").disabled = !lead.task;
}

function renderResults() {
  const lead = activeLead();
  const list = $("resultList");
  list.innerHTML = "";
  if (!lead.task) {
    list.appendChild(el("div", "result-empty", currentLocale === "es-MX" ? "No hay tareas pendientes para este prospecto." : "当前线索没有待处理任务。"));
    return;
  }
  resultCodesFor(lead).forEach((code) => {
    const config = resultConfig(code);
    const transition = getTransition(lead, code);
    const label = el("label", "result-option");
    const radio = el("input");
    radio.type = "radio";
    radio.name = "followResult";
    radio.value = code;
    const copy = el("span", "result-copy");
    copy.append(el("strong", "", resultLabelFor(lead, code)), el("small", "", window.LEAD_FLOW_CONFIG.text(config, "description", currentLocale)));
    label.append(radio, copy, el("span", "result-deadline", transition.terminal ? t("follow.noTask") : deadlineLabel(config.deadline)));
    radio.addEventListener("change", () => selectResult(code, label));
    list.appendChild(label);
  });
}

function resetDynamicFields() {
  $("reasonRow").hidden = true;
  $("callbackRow").hidden = true;
  $("nextTimeRow").hidden = false;
  $("reasonInput").value = "";
  $("reasonInput").readOnly = false;
  $("callbackNote").value = "";
  $("nextTime").value = "";
  $("nextTimeDefault").value = "";
  fillText("previewState", stateLabel(activeLead().state, activeLead()));
  fillText("previewTask", t("follow.waiting"));
  $("submitButton").disabled = !activeLead().task;
  $("submitTopButton").disabled = !activeLead().task;
}

function selectResult(code, selectedLabel) {
  selectedResult = code;
  document.querySelectorAll(".result-option").forEach((item) => item.classList.toggle("selected", item === selectedLabel));
  const transition = getTransition(activeLead(), code);
  $("reasonRow").hidden = !transition.requireReason && !transition.systemLost;
  $("reasonInput").readOnly = Boolean(transition.systemLost);
  if (transition.systemLost) $("reasonInput").value = transition.reason;
  else $("reasonInput").value = "";
  $("callbackRow").hidden = !transition.requireNote;
  $("nextTimeRow").hidden = transition.manualTime || transition.terminal;
  if (transition.manualTime) $("nextTime").value = addHours(2);
  else $("nextTimeDefault").value = transition.time || "";
  fillText("previewState", stateLabel(transition.state, { lostReason: transition.reason }));
  fillText("previewTask", transition.terminal ? t("follow.noTask") : transition.task + " · " + transition.trigger);
}

function renderRecords() {
  const lead = activeLead();
  const defaultOperator = data.salesperson.id + " " + data.salesperson.name;
  const operationTimeline = $("operationTimeline");
  operationTimeline.innerHTML = "";
  lead.operations.forEach(([time, title, detail, operator]) => {
    const item = el("li");
    item.append(el("div", "timeline-time", time), el("div", "timeline-title", title), el("div", "timeline-detail", detail), el("div", "timeline-operator", t("records.operator", { operator: operator || defaultOperator })));
    operationTimeline.appendChild(item);
  });
  const noteTimeline = $("noteTimeline");
  noteTimeline.innerHTML = "";
  lead.notes.forEach(([time, detail, operator]) => {
    const item = el("li");
    item.append(el("div", "timeline-time", time), el("div", "timeline-title", t("notes.record")), el("div", "timeline-detail", detail), el("div", "timeline-operator", t("records.operator", { operator: operator || defaultOperator })));
    noteTimeline.appendChild(item);
  });
  fillText("noteCount", lead.notes.length);
}

function validateSubmission(transition) {
  if (!selectedResult) return t("validation.result");
  if (!$("reasonRow").hidden && !$("reasonInput").value.trim()) return t("validation.reason");
  if (transition.manualTime) {
    if (!$("callbackNote").value.trim()) return t("validation.callbackNote");
    if (!$("nextTime").value) return t("validation.callbackTime");
  }
  if (!transition.terminal && !transition.manualTime && !$("nextTimeDefault").value) return t("validation.nextTime");
  const nextValue = transition.manualTime ? $("nextTime").value : $("nextTimeDefault").value;
  if (!transition.terminal && new Date(nextValue).getTime() <= Date.now()) return currentLocale === "es-MX" ? "El próximo contacto debe ser posterior a la hora actual" : "下一次联系时间必须晚于当前时间";
  return "";
}

let taskSequence = 40;
function nextTaskId() {
  taskSequence += 1;
  const date = new Date();
  const stamp = String(date.getFullYear()).slice(-2) + String(date.getMonth() + 1).padStart(2, "0") + String(date.getDate()).padStart(2, "0");
  return "TASK-" + stamp + "-" + String(taskSequence).padStart(3, "0");
}

function submitFollowUp() {
  const lead = activeLead();
  const transition = selectedResult ? getTransition(lead, selectedResult) : {};
  const error = validateSubmission(transition);
  if (error) {
    showToast(error);
    return;
  }
  const resultLabel = dataResultLabelFor(lead, selectedResult);
  const reason = $("reasonInput").value.trim();
  const nextTime = transition.manualTime ? $("nextTime").value : $("nextTimeDefault").value;
  const oldState = dataStateLabel(lead.state, lead);
  const nextLostReason = reason || transition.reason;
  const newState = dataStateLabel(transition.state, { lostReason: nextLostReason });
  const operator = data.salesperson.id + " " + data.salesperson.name;
  const newOperations = [
    ["刚刚", "跟进提交", "跟进结果：" + resultLabel + (reason ? "；原因：" + reason : ""), operator],
    ["刚刚", "任务完成", lead.task.group + "任务 " + lead.task.id + " 已由处理中更新为已完成", operator]
  ];
  if (oldState !== newState) newOperations.push(["刚刚", "状态流转", oldState + " → " + newState, "系统"]);
  if (!transition.terminal) newOperations.push(["刚刚", "任务生成", "生成" + transition.task + "；触发原因：" + transition.trigger + "；截止时间：" + readableTime(nextTime), "系统"]);
  else newOperations.push(["刚刚", "任务结束", transition.state === "confirmedFinance" ? "线索已确认金融购车，普通线索流程结束" : "线索进入战败终态，不再生成后续任务", "系统"]);
  lead.operations = newOperations.concat(lead.operations);
  lead.state = transition.state;
  lead.unreachableCount = transition.nextCount;
  if (selectedResult === "financeInterest" || selectedResult === "confirmFinance") lead.leadType = "金融";
  if (selectedResult === "cash") lead.leadType = "全款";
  if (selectedResult === "testDrive") lead.leadType = "试驾";
  if (transition.requireNote) {
    lead.lastContact = $("callbackNote").value.trim();
    lead.notes.unshift(["刚刚", lead.lastContact, operator]);
  }
  if (transition.terminal) {
    lead.lostReason = transition.state === "lost" ? nextLostReason : "";
    lead.task = null;
  } else {
    lead.task = { id: nextTaskId(), code: transition.taskCode, group: transition.task, trigger: transition.trigger, due: readableTime(nextTime) };
  }
  const completedLeadId = lead.id;
  moveToNextActiveLead();
  renderLead();
  showToast(t("toast.submitted", { id: completedLeadId }));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function moveToNextActiveLead() {
  for (let step = 1; step <= leads.length; step += 1) {
    const candidate = (currentIndex + step) % leads.length;
    if (leads[candidate].task) {
      currentIndex = candidate;
      return true;
    }
  }
  return false;
}

function showToast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").classList.add("show");
  toastTimer = setTimeout(() => $("toast").classList.remove("show"), 3200);
}

function switchTab(tab) {
  const operationsActive = tab === "operations";
  $("operationsTab").classList.toggle("active", operationsActive);
  $("notesTab").classList.toggle("active", !operationsActive);
  $("operationsTab").setAttribute("aria-selected", String(operationsActive));
  $("notesTab").setAttribute("aria-selected", String(!operationsActive));
  $("operationsPanel").hidden = !operationsActive;
  $("notesPanel").hidden = operationsActive;
}

const editableUserFields = [
  { key: "name", label: "姓名", input: "editName", original: "originalName" },
  { key: "phone", label: "手机号", input: "editPhone", original: "originalPhone" },
  { key: "brand", label: "品牌", input: "editBrand", original: "originalBrand" },
  { key: "series", label: "车系", input: "editSeries", original: "originalSeries" },
  { key: "model", label: "车型", input: "editModel", original: "originalModel" },
  { key: "dealer", label: "经销商", input: "editDealer", original: "originalDealer" },
  { key: "region", label: "地区", input: "editRegion", original: "originalRegion" },
  { key: "address", label: "地址", input: "editAddress", original: "originalAddress" }
];

function ensureLeadEditData(lead) {
  if (!lead.original) {
    lead.original = {};
  }
  editableUserFields.forEach((field) => {
    if (lead.original[field.key] === undefined) lead.original[field.key] = lead[field.key] || "—";
  });
  if (!lead.editRecords) lead.editRecords = [];
  if (!lead.editRecords.some((record) => record.type === "original")) {
    lead.editRecords.unshift({ type: "original", time: lead.createdAt || "线索创建时", operator: "系统", changes: editableUserFields.map((field) => ({ field: field.label, value: lead.original[field.key] || "—" })) });
  }
}

function setSelectOptions(select, options, selectedValue) {
  select.innerHTML = "";
  options.forEach((value) => {
    const option = el("option", "", value);
    option.value = value;
    option.selected = value === selectedValue;
    select.appendChild(option);
  });
}

function populateModelOptions(selectedModel) {
  const models = vehicleCatalog[$("editBrand").value]?.[$("editSeries").value] || [];
  setSelectOptions($("editModel"), models, models.includes(selectedModel) ? selectedModel : models[0]);
}

function populateSeriesOptions(selectedSeries, selectedModel) {
  const series = Object.keys(vehicleCatalog[$("editBrand").value] || {});
  const seriesValue = series.includes(selectedSeries) ? selectedSeries : series[0];
  setSelectOptions($("editSeries"), series, seriesValue);
  populateModelOptions(selectedModel);
}

function populateVehicleOptions(lead) {
  const brands = Object.keys(vehicleCatalog);
  setSelectOptions($("editBrand"), brands, brands.includes(lead.brand) ? lead.brand : brands[0]);
  populateSeriesOptions(lead.series, lead.model);
}

function dealersForSelectedBrand() {
  return dealerDirectory.filter((dealer) => dealer.brand === $("editBrand").value);
}

function populateDealerOptions() {
  const list = $("dealerOptions");
  list.innerHTML = "";
  dealersForSelectedBrand().forEach((dealer) => {
    const option = el("option");
    option.value = dealer.name;
    option.label = dealer.region + " · " + dealer.address;
    list.appendChild(option);
  });
}

function selectedDealer() {
  const value = $("editDealer").value.trim().toLocaleLowerCase();
  return dealersForSelectedBrand().find((dealer) => dealer.name.toLocaleLowerCase() === value);
}

function syncDealerLocation() {
  const dealer = selectedDealer();
  $("editRegion").value = dealer?.region || "";
  $("editAddress").value = dealer?.address || "";
  return dealer;
}

function switchEditTab(tabName) {
  const tabs = {
    original: { button: $("editOriginalTab"), panel: $("editOriginalPanel") },
    current: { button: $("editCurrentTab"), panel: $("editCurrentPanel") },
    history: { button: $("editHistoryTab"), panel: $("editHistoryPanel") }
  };
  Object.entries(tabs).forEach(([name, item]) => {
    const active = name === tabName;
    item.button.classList.toggle("active", active);
    item.button.setAttribute("aria-selected", String(active));
    item.panel.hidden = !active;
  });
  $("saveUserButton").hidden = tabName !== "current";
  $("cancelEditButton").textContent = tabName === "current" ? t("action.cancel") : t("edit.close");
}

function renderOriginalInfo(lead) {
  editableUserFields.forEach((field) => fillText(field.original, lead.original[field.key] || "—"));
}

function renderEditHistory(lead) {
  const list = $("editHistoryList");
  list.innerHTML = "";
  fillText("editHistoryCount", lead.editRecords.length);
  if (!lead.editRecords.length) {
    list.appendChild(el("li", "edit-history-empty", t("edit.noHistory")));
    return;
  }
  lead.editRecords.forEach((record) => {
    const item = el("li", "edit-history-item");
    const meta = el("div", "edit-history-meta");
    meta.append(el("span", "", record.time), el("span", "edit-history-operator", t("records.operator", { operator: record.operator })));
    const changes = el("div", "edit-history-change");
    record.changes.forEach((change) => {
      const row = el("div");
      row.append(el("span", "", change.field), el("strong", "", record.type === "original" ? t("edit.initialValue", { value: change.value }) : "修改前：" + change.before + "；修改后：" + change.after));
      changes.appendChild(row);
    });
    item.append(meta, changes);
    list.appendChild(item);
  });
}

function openEditDialog() {
  const lead = activeLead();
  ensureLeadEditData(lead);
  populateVehicleOptions(lead);
  populateDealerOptions();
  editableUserFields.forEach((field) => { $(field.input).value = lead[field.key] || ""; });
  syncDealerLocation();
  renderOriginalInfo(lead);
  renderEditHistory(lead);
  switchEditTab("current");
  $("editDialog").showModal();
}

function saveUserInfo(event) {
  event.preventDefault();
  const lead = activeLead();
  ensureLeadEditData(lead);
  if (!syncDealerLocation()) {
    showToast(t("validation.dealer"));
    $("editDealer").focus();
    return;
  }
  const changes = [];
  editableUserFields.forEach((field) => {
    const before = lead[field.key] || "";
    const after = $(field.input).value.trim();
    if (before !== after) changes.push({ field: field.label, before: before || "—", after: after || "—" });
  });
  if (!changes.length) {
    showToast(t("toast.noChanges"));
    return;
  }
  editableUserFields.forEach((field) => { lead[field.key] = $(field.input).value.trim(); });
  lead.changed = true;
  const operator = data.salesperson.id + " " + data.salesperson.name;
  lead.editRecords.unshift({ time: "刚刚", operator, changes });
  const detail = changes.map((change) => change.field + "：" + change.before + " → " + change.after).join("；");
  lead.operations.unshift(["刚刚", "用户信息变更", detail + "。原始线索信息已保留", operator]);
  $("editDialog").close();
  renderLead();
  showToast(t("toast.userUpdated"));
}

$("scenarioSelect").addEventListener("change", (event) => {
  currentIndex = Number(event.target.value);
  renderLead();
});
$("submitButton").addEventListener("click", submitFollowUp);
$("submitTopButton").addEventListener("click", submitFollowUp);
$("watchButton").addEventListener("click", () => {
  const lead = activeLead();
  lead.watched = !lead.watched;
  renderLead();
  showToast(lead.watched ? t("toast.watched") : t("toast.unwatched"));
});
$("operationsTab").addEventListener("click", () => switchTab("operations"));
$("notesTab").addEventListener("click", () => switchTab("notes"));
$("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = $("noteInput").value.trim();
  if (!value) return showToast(t("toast.noteRequired"));
  activeLead().notes.unshift(["刚刚", value, data.salesperson.id + " " + data.salesperson.name]);
  $("noteInput").value = "";
  renderRecords();
  showToast(t("toast.noteAdded"));
});
$("editUserButton").addEventListener("click", openEditDialog);
$("editForm").addEventListener("submit", saveUserInfo);
$("editBrand").addEventListener("change", () => {
  populateSeriesOptions();
  populateDealerOptions();
  $("editDealer").value = "";
  syncDealerLocation();
});
$("editSeries").addEventListener("change", () => populateModelOptions());
$("editDealer").addEventListener("input", syncDealerLocation);
$("editDealer").addEventListener("change", syncDealerLocation);
$("editOriginalTab").addEventListener("click", () => switchEditTab("original"));
$("editCurrentTab").addEventListener("click", () => switchEditTab("current"));
$("editHistoryTab").addEventListener("click", () => switchEditTab("history"));
$("closeEditButton").addEventListener("click", () => $("editDialog").close());
$("cancelEditButton").addEventListener("click", () => $("editDialog").close());

$("languageSelect").addEventListener("change", (event) => {
  currentLocale = event.target.value;
  try { localStorage.setItem("crmLocale", currentLocale); } catch (error) { /* Storage may be unavailable in private mode. */ }
  applyStaticTranslations();
  renderLead();
});

function reloadFlowConfiguration() {
  flowConfig = window.LEAD_FLOW_CONFIG.load();
  renderLead();
}

window.addEventListener("storage", (event) => {
  if ([window.LEAD_FLOW_CONFIG.storageKey, "autocava_admin_demo_config_v1"].includes(event.key)) reloadFlowConfiguration();
});
window.addEventListener("focus", reloadFlowConfiguration);

selectLeadFromUrl();
applyStaticTranslations();
fillText("salespersonTop", data.salesperson.id + " " + data.salesperson.name);
renderLead();
