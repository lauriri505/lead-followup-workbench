const data = window.CRM_DEMO_DATA;
const leads = data.leads;
const vehicleCatalog = data.vehicleCatalog || {};
const dealerDirectory = data.dealers || [];
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
    "lead.info": "线索信息", "lead.source": "线索来源", "lead.type": "线索类型", "lead.created": "创建时间",
    "field.name": "姓名", "field.phone": "手机号", "field.brand": "品牌", "field.series": "车系", "field.model": "车型", "field.region": "地区", "field.address": "地址",
    "dealer.finance": "经销商与金融信息", "dealer.name": "经销商", "dealer.placeholder": "输入或选择经销商", "dealer.hint": "可输入名称联想选择", "finance.price": "车价格", "finance.rate": "年利率", "finance.term": "贷款期数",
    "follow.title": "本次跟进", "follow.description": "当前任务决定跟进内容，业务状态随跟进结果流转", "follow.scenario": "切换普通线索演示场景", "follow.currentState": "当前状态", "follow.result": "跟进结果", "follow.reason": "原因", "follow.reasonPlaceholder": "请输入具体原因", "follow.callbackNote": "用户约定说明", "follow.callbackPlaceholder": "例如：下班后方便接听", "follow.nextTime": "下一次联系时间", "follow.timeHint": "系统已按规则给出默认值，销售可以调整。", "follow.afterState": "提交后状态", "follow.nextTask": "下一任务", "follow.waiting": "等待选择跟进结果", "follow.noTask": "不再生成任务", "follow.attempts": "未接通 {count} 次",
    "records.operations": "操作记录", "records.notes": "跟踪记事", "records.description": "系统自动记录，按时间倒序展示。", "records.operator": "操作人：{operator}",
    "notes.addTitle": "销售手动添加跟踪记录", "notes.description": "记录沟通中的关键信息。", "notes.content": "跟踪内容", "notes.placeholder": "只记录用户输入或销售确认的关键信息", "notes.add": "添加记录", "notes.record": "跟踪记录",
    "edit.title": "编辑用户信息", "edit.tip": "修改后保留原始信息，并生成信息变更记录，不覆盖原始线索。", "edit.tabsLabel": "用户信息类型", "edit.original": "原始信息", "edit.current": "当前信息", "edit.history": "编辑记录", "edit.originalNotice": "首次进入 CRM 时保存的线索信息，只读且不会被后续编辑覆盖。", "edit.currentNoticeTitle": "工作台当前展示信息", "edit.currentNoticeText": "保存修改后，用户信息卡片立即更新。", "edit.historyTitle": "信息编辑记录", "edit.historyOrder": "按修改时间倒序展示", "edit.noHistory": "暂无编辑记录", "edit.close": "关闭",
    "order.label": "订单状态", "order.update": "更新状态", "order.dialogTitle": "更新订单状态", "order.dialogTip": "订单状态为独立标准字段，不会改变线索状态或生成跟踪记事。", "order.current": "当前订单状态", "order.newStatus": "更新为", "order.history": "订单状态变更记录", "order.historyDescription": "独立记录，不与跟踪记事混合", "order.save": "确认更新", "order.unmarkedMeta": "尚未人工标记", "order.updatedMeta": "{time} · {operator}", "order.noHistory": "暂无订单状态变更记录", "order.historyMeta": "{time} · 操作人：{operator}", "order.same": "订单状态没有变化",
    "order.status.UNMARKED": "未标记", "order.status.CREDIT_REVIEW": "信审中", "order.status.CONTRACT_SIGNED": "已签合同", "order.status.WAITING_DISBURSEMENT": "等待放款", "order.status.DISBURSEMENT_SUCCESS": "放款成功", "order.status.VEHICLE_DELIVERED": "已提车",
    "watch.on": "★ 已关注", "watch.off": "☆ 关注",
    "state.pending.main": "待跟进", "state.pending.sub": "—", "state.following.main": "跟进中", "state.following.sub": "已联系", "state.testdrive.main": "暂存", "state.testdrive.sub": "试驾", "state.cash.main": "暂存", "state.cash.sub": "确认全款", "state.noIntent.main": "暂存", "state.noIntent.sub": "无意向购买", "state.lost.main": "战败", "state.lost.sub": "—",
    "result.interested.label": "已沟通－有意向", "result.interested.action": "进入或保持已联系状态", "result.interested.deadline": "承诺时间优先；默认 +2小时",
    "result.unreachable.label": "未接通", "result.unreachable.action": "累计未接通次数", "result.unreachable.deadline": "按当前累计次数计算", "result.unreachable.attempt": "未接通（第{count}次{limit}）", "result.unreachable.limit": "，达上限", "result.unreachable.deadline1": "默认 +2小时", "result.unreachable.deadline2": "默认次日 10:00", "result.unreachable.deadline3": "系统自动转战败",
    "result.callback.label": "要求稍后联系", "result.callback.action": "按用户约定时间回访", "result.callback.deadline": "销售必须填写时间",
    "result.noIntent.label": "已沟通－无意向", "result.noIntent.action": "转入低频唤醒", "result.noIntent.deadline": "默认 +30天",
    "result.testdrive.label": "暂定试驾", "result.testdrive.action": "转入暂存·试驾", "result.testdrive.deadline": "默认 +30天",
    "result.cash.label": "确认全款", "result.cash.action": "转入暂存·确认全款", "result.cash.deadline": "默认 +30天",
    "result.invalid.label": "号码错误", "result.invalid.action": "转为战败终态", "result.invalid.deadline": "不再生成任务",
    "result.abandon.label": "放弃购买", "result.abandon.action": "转为战败终态", "result.abandon.deadline": "不再生成任务",
    "result.keepDormant.label": "继续暂存", "result.keepDormant.action": "保持当前暂存状态", "result.keepDormant.deadline": "默认 +30天",
    "validation.result": "请选择跟进结果", "validation.reason": "请填写原因；战败或无意向原因不能为空", "validation.callbackNote": "请填写用户约定说明", "validation.callbackTime": "请选择用户约定的下一次联系时间", "validation.nextTime": "请选择下一次联系时间", "validation.dealer": "请从联想列表中选择有效经销商",
    "toast.submitted": "{id} 已提交，当前任务已完成，已进入下一条", "toast.watched": "已关注当前线索", "toast.unwatched": "已取消关注", "toast.noteRequired": "请输入跟踪内容", "toast.noteAdded": "跟踪记录已添加", "toast.noChanges": "当前信息没有变化", "toast.userUpdated": "用户当前信息已更新，原始线索信息未被覆盖", "toast.orderUpdated": "订单状态已更新为：{status}"
  },
  "es-MX": {
    "brand.home": "Volver al inicio", "language.label": "Idioma", "account.role": "Rol actual: Ventas",
    "page.title": "Seguimiento de Leads", "page.subtitle": "Administra prospectos, acciones de seguimiento y el contexto de comunicación con clientes", "page.todayTasks": "Tareas pendientes hoy: {count}",
    "action.submit": "Enviar", "action.submitNext": "Enviar y abrir el siguiente", "action.close": "Cerrar", "action.cancel": "Cancelar", "action.save": "Guardar cambios",
    "task.current": "Mi tarea actual", "task.processing": "En proceso", "task.trigger": "Motivo de activación: ", "task.id": "ID de tarea",
    "user.title": "Información del cliente", "user.changed": "Información modificada", "user.edit": "Editar información",
    "lead.info": "Información del prospecto", "lead.source": "Origen del prospecto", "lead.type": "Tipo de prospecto", "lead.created": "Fecha de creación",
    "field.name": "Nombre", "field.phone": "Teléfono", "field.brand": "Marca", "field.series": "Línea", "field.model": "Versión", "field.region": "Región", "field.address": "Dirección",
    "dealer.finance": "Distribuidor e información financiera", "dealer.name": "Distribuidor", "dealer.placeholder": "Escribe o selecciona un distribuidor", "dealer.hint": "Escribe para buscar por nombre", "finance.price": "Precio del vehículo", "finance.rate": "Tasa anual", "finance.term": "Plazo del crédito",
    "follow.title": "Seguimiento actual", "follow.description": "La tarea define las acciones disponibles y el resultado actualiza el estado comercial", "follow.scenario": "Cambiar escenario de prospecto", "follow.currentState": "Estado actual", "follow.result": "Resultado del seguimiento", "follow.reason": "Motivo", "follow.reasonPlaceholder": "Ingresa el motivo específico", "follow.callbackNote": "Acuerdo con el cliente", "follow.callbackPlaceholder": "Ejemplo: llamar después del trabajo", "follow.nextTime": "Próximo contacto", "follow.timeHint": "El sistema propone una fecha según las reglas; el vendedor puede ajustarla.", "follow.afterState": "Estado después de enviar", "follow.nextTask": "Siguiente tarea", "follow.waiting": "Selecciona un resultado", "follow.noTask": "No se generará otra tarea", "follow.attempts": "Sin respuesta: {count} intento(s)",
    "records.operations": "Registro de operaciones", "records.notes": "Notas de seguimiento", "records.description": "Registro automático en orden cronológico inverso.", "records.operator": "Operador: {operator}",
    "notes.addTitle": "Agregar nota de seguimiento", "notes.description": "Registra la información clave de la conversación.", "notes.content": "Contenido de la nota", "notes.placeholder": "Registra únicamente información proporcionada o confirmada por el cliente", "notes.add": "Agregar nota", "notes.record": "Nota de seguimiento",
    "edit.title": "Editar información del cliente", "edit.tip": "Los datos originales se conservan y cada cambio genera un registro de edición.", "edit.tabsLabel": "Tipo de información del cliente", "edit.original": "Información original", "edit.current": "Información actual", "edit.history": "Historial de cambios", "edit.originalNotice": "Información guardada al ingresar por primera vez al CRM. Es de solo lectura y no se sobrescribe.", "edit.currentNoticeTitle": "Información mostrada en la mesa", "edit.currentNoticeText": "Al guardar, la tarjeta del cliente se actualiza de inmediato.", "edit.historyTitle": "Historial de edición", "edit.historyOrder": "Del más reciente al más antiguo", "edit.noHistory": "No hay cambios registrados", "edit.close": "Cerrar",
    "order.label": "Estado del pedido", "order.update": "Actualizar estado", "order.dialogTitle": "Actualizar estado del pedido", "order.dialogTip": "Es un campo estandarizado independiente; no modifica el estado del prospecto ni crea notas de seguimiento.", "order.current": "Estado actual del pedido", "order.newStatus": "Actualizar a", "order.history": "Historial del estado del pedido", "order.historyDescription": "Registro independiente de las notas de seguimiento", "order.save": "Confirmar actualización", "order.unmarkedMeta": "Sin actualización manual", "order.updatedMeta": "{time} · {operator}", "order.noHistory": "No hay cambios de estado del pedido", "order.historyMeta": "{time} · Operador: {operator}", "order.same": "El estado del pedido no cambió",
    "order.status.UNMARKED": "Sin marcar", "order.status.CREDIT_REVIEW": "En evaluación crediticia", "order.status.CONTRACT_SIGNED": "Contrato firmado", "order.status.WAITING_DISBURSEMENT": "En espera de desembolso", "order.status.DISBURSEMENT_SUCCESS": "Desembolso completado", "order.status.VEHICLE_DELIVERED": "Vehículo entregado",
    "watch.on": "★ Siguiendo", "watch.off": "☆ Seguir",
    "state.pending.main": "Por contactar", "state.pending.sub": "—", "state.following.main": "En seguimiento", "state.following.sub": "Contactado", "state.testdrive.main": "En pausa", "state.testdrive.sub": "Prueba de manejo", "state.cash.main": "En pausa", "state.cash.sub": "Pago de contado", "state.noIntent.main": "En pausa", "state.noIntent.sub": "Sin intención de compra", "state.lost.main": "Perdido", "state.lost.sub": "—",
    "result.interested.label": "Contactado con interés", "result.interested.action": "Entra o permanece como contactado", "result.interested.deadline": "Prioriza la hora acordada; predeterminado +2 h",
    "result.unreachable.label": "Sin respuesta", "result.unreachable.action": "Acumula intentos sin respuesta", "result.unreachable.deadline": "Según los intentos acumulados", "result.unreachable.attempt": "Sin respuesta (intento {count}{limit})", "result.unreachable.limit": ", límite alcanzado", "result.unreachable.deadline1": "Predeterminado +2 h", "result.unreachable.deadline2": "Mañana a las 10:00", "result.unreachable.deadline3": "El sistema lo marcará como perdido",
    "result.callback.label": "Solicita contacto posterior", "result.callback.action": "Contactar en la hora acordada", "result.callback.deadline": "El vendedor debe indicar la hora",
    "result.noIntent.label": "Contactado sin interés", "result.noIntent.action": "Pasar a reactivación de baja frecuencia", "result.noIntent.deadline": "Predeterminado +30 días",
    "result.testdrive.label": "Prueba de manejo prevista", "result.testdrive.action": "Pausar por prueba de manejo", "result.testdrive.deadline": "Predeterminado +30 días",
    "result.cash.label": "Pago de contado confirmado", "result.cash.action": "Pausar como pago de contado", "result.cash.deadline": "Predeterminado +30 días",
    "result.invalid.label": "Número incorrecto", "result.invalid.action": "Marcar como perdido", "result.invalid.deadline": "No se generará otra tarea",
    "result.abandon.label": "Desiste de la compra", "result.abandon.action": "Marcar como perdido", "result.abandon.deadline": "No se generará otra tarea",
    "result.keepDormant.label": "Mantener en pausa", "result.keepDormant.action": "Conservar el estado actual", "result.keepDormant.deadline": "Predeterminado +30 días",
    "validation.result": "Selecciona un resultado de seguimiento", "validation.reason": "Ingresa un motivo; es obligatorio para prospectos perdidos o sin interés", "validation.callbackNote": "Describe el acuerdo con el cliente", "validation.callbackTime": "Selecciona la fecha acordada con el cliente", "validation.nextTime": "Selecciona la fecha del próximo contacto", "validation.dealer": "Selecciona un distribuidor válido de la lista",
    "toast.submitted": "{id} enviado. La tarea actual se completó y se abrió el siguiente prospecto", "toast.watched": "Prospecto agregado a seguimiento", "toast.unwatched": "Prospecto eliminado de seguimiento", "toast.noteRequired": "Ingresa el contenido de la nota", "toast.noteAdded": "Nota de seguimiento agregada", "toast.noChanges": "No hay cambios en la información actual", "toast.userUpdated": "La información actual se actualizó; los datos originales se conservaron", "toast.orderUpdated": "Estado del pedido actualizado a: {status}"
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

const stateMeta = {
  pending: { main: "待跟进", sub: "—" },
  following: { main: "跟进中", sub: "已联系" },
  testdrive: { main: "暂存", sub: "试驾" },
  cash: { main: "暂存", sub: "确认全款" },
  noIntent: { main: "暂存", sub: "无意向购买" },
  lost: { main: "战败", sub: "—" }
};

const orderStatusCodes = ["UNMARKED", "CREDIT_REVIEW", "CONTRACT_SIGNED", "WAITING_DISBURSEMENT", "DISBURSEMENT_SUCCESS", "VEHICLE_DELIVERED"];
const orderStatusDataLabels = {
  UNMARKED: "未标记",
  CREDIT_REVIEW: "信审中",
  CONTRACT_SIGNED: "已签合同",
  WAITING_DISBURSEMENT: "等待放款",
  DISBURSEMENT_SUCCESS: "放款成功",
  VEHICLE_DELIVERED: "已提车"
};

const standardResults = {
  interested: { label: "已沟通－有意向", action: "进入或保持已联系状态", deadline: "承诺时间优先；默认 +2小时" },
  unreachable: { label: "未接通", action: "累计未接通次数", deadline: "按当前累计次数计算" },
  callback: { label: "要求稍后联系", action: "按用户约定时间回访", deadline: "销售必须填写时间" },
  noIntent: { label: "已沟通－无意向", action: "转入低频唤醒", deadline: "默认 +30天" },
  testdrive: { label: "暂定试驾", action: "转入暂存·试驾", deadline: "默认 +30天" },
  cash: { label: "确认全款", action: "转入暂存·确认全款", deadline: "默认 +30天" },
  invalid: { label: "号码错误", action: "转为战败终态", deadline: "不再生成任务" },
  abandon: { label: "放弃购买", action: "转为战败终态", deadline: "不再生成任务" },
  keepDormant: { label: "继续暂存", action: "保持当前暂存状态", deadline: "默认 +30天" }
};

function localizedResultConfig(code) {
  return {
    label: t("result." + code + ".label"),
    action: t("result." + code + ".action"),
    deadline: t("result." + code + ".deadline")
  };
}

function resultCodesFor(lead) {
  if (lead.state === "pending") return ["unreachable", "interested", "noIntent", "callback", "invalid"];
  if (lead.state === "following") return ["interested", "unreachable", "callback", "testdrive", "cash", "noIntent", "abandon"];
  if (["testdrive", "cash", "noIntent"].includes(lead.state)) return ["interested", "unreachable", "keepDormant", "abandon"];
  return [];
}

function stateLabel(key) {
  const state = stateMeta[key] ? key : "pending";
  return t("state." + state + ".main") + " · " + t("state." + state + ".sub");
}

function dataStateLabel(key) {
  const item = stateMeta[key] || stateMeta.pending;
  return item.main + " · " + item.sub;
}

function resultLabelFor(lead, code) {
  if (code !== "unreachable") return localizedResultConfig(code).label;
  const attempt = lead.unreachableCount + 1;
  return t("result.unreachable.attempt", { count: attempt, limit: attempt >= 3 ? t("result.unreachable.limit") : "" });
}

function dataResultLabelFor(lead, code) {
  if (code !== "unreachable") return standardResults[code].label;
  const attempt = lead.unreachableCount + 1;
  return "未接通（第" + attempt + "次" + (attempt >= 3 ? "，达上限" : "") + "）";
}

function demoNow() {
  return new Date(2026, 7, 25, 9, 45, 0, 0);
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

function readableTime(value) {
  if (!value) return "—";
  return value.replace("T", " ");
}

function getTransition(lead, code) {
  const nextCount = code === "unreachable" ? lead.unreachableCount + 1 : lead.unreachableCount;
  if (code === "invalid") return { state: "lost", reason: "号码错误", terminal: true, nextCount };
  if (code === "abandon") return { state: "lost", reason: "", terminal: true, nextCount };
  if (code === "unreachable" && nextCount >= 3) return { state: "lost", reason: "未接通（累计3次）", terminal: true, systemLost: true, nextCount };
  if (code === "unreachable") {
    return { state: lead.state === "pending" ? "following" : lead.state, task: "普通回访", trigger: nextCount === 1 ? "首次联系未接通" : "累计第2次未接通", time: nextCount === 1 ? addHours(2) : tomorrowAtTen(), nextCount };
  }
  if (code === "interested") return { state: "following", task: "普通回访", trigger: lead.state === "following" ? "客户已沟通有意向" : "客户恢复意向", time: addHours(2), nextCount };
  if (code === "callback") return { state: lead.state === "pending" ? "following" : lead.state, task: "普通回访", trigger: "客户要求稍后联系", time: "", manualTime: true, nextCount };
  if (code === "noIntent") return { state: "noIntent", task: "普通回访", trigger: "线索进入暂存", time: addDays(30), reason: "", nextCount };
  if (code === "testdrive") return { state: "testdrive", task: "普通回访", trigger: "线索进入暂存", time: addDays(30), nextCount };
  if (code === "cash") return { state: "cash", task: "普通回访", trigger: "线索进入暂存", time: addDays(30), nextCount };
  if (code === "keepDormant") return { state: lead.state, task: "普通回访", trigger: "暂存线索到期", time: addDays(30), nextCount };
  return { state: lead.state, nextCount };
}

function activeLead() {
  return leads[currentIndex];
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
    const option = el("option", "", lead.task.group + "｜" + stateLabel(lead.state) + "｜" + lead.name);
    option.value = String(index);
    option.selected = index === currentIndex;
    select.appendChild(option);
  });
}

function renderLead() {
  const lead = activeLead();
  selectedResult = null;
  fillText("leadId", lead.id);
  const todayPendingTasks = leads.filter((item) => item.task && item.task.due.includes("今天"));
  fillText("todayTaskCount", t("page.todayTasks", { count: todayPendingTasks.length }));
  fillText("taskTitle", lead.task.group);
  fillText("taskTrigger", lead.task.trigger);
  fillText("taskId", lead.task.id);
  fillText("taskGroupLabel", lead.task.group);
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
  fillText("currentState", stateLabel(lead.state));
  fillText("attemptCount", t("follow.attempts", { count: lead.unreachableCount }));
  renderOrderStatusSummary(lead);
  $("changedBadge").hidden = !lead.changed && !(lead.editRecords && lead.editRecords.length);
  $("watchButton").classList.toggle("watching", Boolean(lead.watched));
  $("watchButton").textContent = lead.watched ? t("watch.on") : t("watch.off");
  $("watchButton").setAttribute("aria-pressed", String(Boolean(lead.watched)));
  renderScenarioOptions();
  renderResults();
  renderRecords();
  resetDynamicFields();
}

function ensureOrderStatusData(lead) {
  if (!orderStatusCodes.includes(lead.orderStatusCode)) lead.orderStatusCode = "UNMARKED";
  if (!lead.orderStatusHistory) lead.orderStatusHistory = [];
}

function orderStatusLabel(code) {
  return t("order.status." + (orderStatusCodes.includes(code) ? code : "UNMARKED"));
}

function orderStatusMetaText(lead) {
  if (!lead.orderStatusUpdatedAt) return t("order.unmarkedMeta");
  return t("order.updatedMeta", { time: lead.orderStatusUpdatedAt, operator: lead.orderStatusUpdatedBy || "—" });
}

function renderOrderStatusSummary(lead) {
  ensureOrderStatusData(lead);
  fillText("orderStatusBadge", orderStatusLabel(lead.orderStatusCode));
  $("orderStatusBadge").dataset.status = lead.orderStatusCode;
  fillText("orderStatusMeta", orderStatusMetaText(lead));
}

function renderOrderStatusHistory(lead) {
  const list = $("orderStatusHistory");
  list.innerHTML = "";
  if (!lead.orderStatusHistory.length) {
    list.appendChild(el("li", "order-history-empty", t("order.noHistory")));
    return;
  }
  lead.orderStatusHistory.forEach((record) => {
    const item = el("li", "order-history-item");
    const main = el("div", "order-history-main");
    main.append(el("strong", "", orderStatusLabel(record.from)), el("span", "", "→"), el("strong", "", orderStatusLabel(record.to)));
    item.append(main, el("div", "order-history-meta", t("order.historyMeta", { time: record.time, operator: record.operator })));
    list.appendChild(item);
  });
}

function openOrderStatusDialog() {
  const lead = activeLead();
  ensureOrderStatusData(lead);
  fillText("orderCurrentStatus", orderStatusLabel(lead.orderStatusCode));
  fillText("orderCurrentMeta", orderStatusMetaText(lead));
  const select = $("orderStatusSelect");
  select.innerHTML = "";
  orderStatusCodes.forEach((code) => {
    const option = el("option", "", orderStatusLabel(code));
    option.value = code;
    option.selected = code === lead.orderStatusCode;
    select.appendChild(option);
  });
  renderOrderStatusHistory(lead);
  $("orderDialog").showModal();
}

function saveOrderStatus(event) {
  event.preventDefault();
  const lead = activeLead();
  ensureOrderStatusData(lead);
  const previous = lead.orderStatusCode;
  const next = $("orderStatusSelect").value;
  if (previous === next) {
    showToast(t("order.same"));
    return;
  }
  const operator = data.salesperson.id + " " + data.salesperson.name;
  const time = "刚刚";
  lead.orderStatusCode = next;
  lead.orderStatusUpdatedAt = time;
  lead.orderStatusUpdatedBy = operator;
  lead.orderStatusHistory.unshift({ from: previous, to: next, time, operator });
  lead.operations.unshift([time, "订单状态标记", "订单状态：" + orderStatusDataLabels[previous] + " → " + orderStatusDataLabels[next]]);
  $("orderDialog").close();
  renderLead();
  showToast(t("toast.orderUpdated", { status: orderStatusLabel(next) }));
}

function renderResults() {
  const lead = activeLead();
  const list = $("resultList");
  list.innerHTML = "";
  resultCodesFor(lead).forEach((code) => {
    const config = localizedResultConfig(code);
    if (code === "unreachable") {
      const attempt = lead.unreachableCount + 1;
      config.label = resultLabelFor(lead, code);
      config.deadline = t("result.unreachable.deadline" + Math.min(attempt, 3));
    }
    const label = el("label", "result-option");
    const radio = el("input");
    radio.type = "radio";
    radio.name = "followResult";
    radio.value = code;
    const copy = el("span", "result-copy");
    copy.append(el("strong", "", config.label), el("small", "", config.action));
    label.append(radio, copy, el("span", "result-deadline", config.deadline));
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
  fillText("previewState", stateLabel(activeLead().state));
  fillText("previewTask", t("follow.waiting"));
  $("submitButton").disabled = false;
  $("submitTopButton").disabled = false;
}

function selectResult(code, selectedLabel) {
  selectedResult = code;
  document.querySelectorAll(".result-option").forEach((item) => item.classList.toggle("selected", item === selectedLabel));
  const transition = getTransition(activeLead(), code);
  $("reasonRow").hidden = !["noIntent", "invalid", "abandon"].includes(code) && !transition.systemLost;
  $("reasonInput").readOnly = Boolean(transition.systemLost);
  if (code === "invalid") $("reasonInput").value = "号码错误";
  else if (transition.systemLost) $("reasonInput").value = transition.reason;
  else $("reasonInput").value = "";
  $("callbackRow").hidden = code !== "callback";
  $("nextTimeRow").hidden = code === "callback" || transition.terminal;
  if (code === "callback") $("nextTime").value = addHours(2);
  else $("nextTimeDefault").value = transition.time || "";
  fillText("previewState", stateLabel(transition.state));
  fillText("previewTask", transition.terminal ? t("follow.noTask") : transition.task + " · " + transition.trigger);
}

function renderRecords() {
  const lead = activeLead();
  const operator = data.salesperson.id + " " + data.salesperson.name;
  const operationTimeline = $("operationTimeline");
  operationTimeline.innerHTML = "";
  lead.operations.forEach(([time, title, detail]) => {
    const item = el("li");
    item.append(el("div", "timeline-time", time), el("div", "timeline-title", title), el("div", "timeline-detail", detail), el("div", "timeline-operator", t("records.operator", { operator })));
    operationTimeline.appendChild(item);
  });
  const noteTimeline = $("noteTimeline");
  noteTimeline.innerHTML = "";
  lead.notes.forEach(([time, detail]) => {
    const item = el("li");
    item.append(el("div", "timeline-time", time), el("div", "timeline-title", t("notes.record")), el("div", "timeline-detail", detail), el("div", "timeline-operator", t("records.operator", { operator })));
    noteTimeline.appendChild(item);
  });
  fillText("noteCount", lead.notes.length);
}

function validateSubmission(transition) {
  if (!selectedResult) return t("validation.result");
  if (!$("reasonRow").hidden && !$("reasonInput").value.trim()) return t("validation.reason");
  if (selectedResult === "callback") {
    if (!$("callbackNote").value.trim()) return t("validation.callbackNote");
    if (!$("nextTime").value) return t("validation.callbackTime");
  }
  if (!transition.terminal && selectedResult !== "callback" && !$("nextTimeDefault").value) return t("validation.nextTime");
  return "";
}

function nextTaskId() {
  return "TASK-260825-" + String(40 + Math.floor(Math.random() * 50)).padStart(3, "0");
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
  const nextTime = selectedResult === "callback" ? $("nextTime").value : $("nextTimeDefault").value;
  const oldState = dataStateLabel(lead.state);
  const newState = dataStateLabel(transition.state);
  const newOperations = [
    ["刚刚", "跟进提交", "跟进结果：" + resultLabel + (reason ? "；原因：" + reason : "")],
    ["刚刚", "任务完成", lead.task.group + "任务 " + lead.task.id + " 已由处理中更新为已完成"]
  ];
  if (oldState !== newState) newOperations.push(["刚刚", "状态流转", oldState + " → " + newState]);
  if (!transition.terminal) newOperations.push(["刚刚", "任务生成", "生成" + transition.task + "；触发原因：" + transition.trigger + "；截止时间：" + readableTime(nextTime)]);
  else newOperations.push(["刚刚", "任务结束", "线索进入战败终态，不再生成后续任务"]);
  lead.operations = newOperations.concat(lead.operations);
  lead.state = transition.state;
  lead.unreachableCount = transition.nextCount;
  if (selectedResult === "callback") {
    lead.lastContact = $("callbackNote").value.trim();
    lead.notes.unshift(["刚刚", lead.lastContact]);
  }
  if (transition.terminal) {
    lead.lostReason = reason || transition.reason;
    lead.task = null;
  } else {
    lead.task = { id: nextTaskId(), group: transition.task, trigger: transition.trigger, due: readableTime(nextTime) };
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
      return;
    }
  }
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
      row.append(el("span", "", change.field), el("strong", "", "修改前：" + change.before + "；修改后：" + change.after));
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
  lead.operations.unshift(["刚刚", "用户信息变更", detail + "。原始线索信息已保留"]);
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
  activeLead().notes.unshift(["刚刚", value]);
  $("noteInput").value = "";
  renderRecords();
  showToast(t("toast.noteAdded"));
});
$("editUserButton").addEventListener("click", openEditDialog);
$("editForm").addEventListener("submit", saveUserInfo);
$("orderStatusButton").addEventListener("click", openOrderStatusDialog);
$("orderStatusForm").addEventListener("submit", saveOrderStatus);
$("closeOrderButton").addEventListener("click", () => $("orderDialog").close());
$("cancelOrderButton").addEventListener("click", () => $("orderDialog").close());
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

applyStaticTranslations();
fillText("salespersonTop", data.salesperson.id + " " + data.salesperson.name);
renderLead();
