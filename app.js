const data = window.CRM_DEMO_DATA;
const leads = data.leads;
let currentIndex = 0;
let selectedResult = null;
let toastTimer;

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

function resultCodesFor(lead) {
  if (lead.state === "pending") return ["unreachable", "interested", "noIntent", "callback", "invalid"];
  if (lead.state === "following") return ["interested", "unreachable", "callback", "testdrive", "cash", "noIntent", "abandon"];
  if (["testdrive", "cash", "noIntent"].includes(lead.state)) return ["interested", "unreachable", "keepDormant", "abandon"];
  return [];
}

function stateLabel(key) {
  const item = stateMeta[key] || stateMeta.pending;
  return item.main + " · " + item.sub;
}

function resultLabelFor(lead, code) {
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
  fillText("todayTaskCount", "今日待处理任务 " + todayPendingTasks.length);
  fillText("taskTitle", lead.task.group);
  fillText("taskTrigger", lead.task.trigger);
  fillText("taskId", lead.task.id);
  fillText("taskGroup", lead.task.group);
  fillText("taskDue", lead.task.due);
  fillText("taskGroupLabel", lead.task.group);
  fillText("avatar", initials(lead.name));
  fillText("userName", lead.name);
  fillText("userPhone", lead.phone);
  fillText("statePill", stateMeta[lead.state].main);
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
  fillText("lastContact", lead.lastContact);
  fillText("currentState", stateLabel(lead.state));
  fillText("attemptCount", "未接通 " + lead.unreachableCount + " 次");
  $("changedBadge").hidden = !lead.changed && !(lead.editRecords && lead.editRecords.length);
  $("watchButton").classList.toggle("watching", Boolean(lead.watched));
  $("watchButton").textContent = lead.watched ? "★ 已关注" : "☆ 关注";
  $("watchButton").setAttribute("aria-pressed", String(Boolean(lead.watched)));
  renderScenarioOptions();
  renderResults();
  renderRecords();
  resetDynamicFields();
}

function renderResults() {
  const lead = activeLead();
  const list = $("resultList");
  list.innerHTML = "";
  resultCodesFor(lead).forEach((code) => {
    const config = { ...standardResults[code] };
    if (code === "unreachable") {
      const attempt = lead.unreachableCount + 1;
      config.label = resultLabelFor(lead, code);
      config.deadline = attempt === 1 ? "默认 +2小时" : attempt === 2 ? "默认次日 10:00" : "系统自动转战败";
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
  fillText("previewTask", "等待选择跟进结果");
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
  fillText("previewTask", transition.terminal ? "不再生成任务" : transition.task + " · " + transition.trigger);
}

function renderRecords() {
  const lead = activeLead();
  const operator = data.salesperson.id + " " + data.salesperson.name;
  const operationTimeline = $("operationTimeline");
  operationTimeline.innerHTML = "";
  lead.operations.forEach(([time, title, detail]) => {
    const item = el("li");
    item.append(el("div", "timeline-time", time), el("div", "timeline-title", title), el("div", "timeline-detail", detail), el("div", "timeline-operator", "操作人：" + operator));
    operationTimeline.appendChild(item);
  });
  const noteTimeline = $("noteTimeline");
  noteTimeline.innerHTML = "";
  lead.notes.forEach(([time, detail]) => {
    const item = el("li");
    item.append(el("div", "timeline-time", time), el("div", "timeline-title", "跟踪记录"), el("div", "timeline-detail", detail), el("div", "timeline-operator", "操作人：" + operator));
    noteTimeline.appendChild(item);
  });
  fillText("noteCount", lead.notes.length);
}

function validateSubmission(transition) {
  if (!selectedResult) return "请选择跟进结果";
  if (!$("reasonRow").hidden && !$("reasonInput").value.trim()) return "请填写原因；战败或无意向原因不能为空";
  if (selectedResult === "callback") {
    if (!$("callbackNote").value.trim()) return "请填写用户约定说明";
    if (!$("nextTime").value) return "请选择用户约定的下一次联系时间";
  }
  if (!transition.terminal && selectedResult !== "callback" && !$("nextTimeDefault").value) return "请选择下一次联系时间";
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
  const resultLabel = resultLabelFor(lead, selectedResult);
  const reason = $("reasonInput").value.trim();
  const nextTime = selectedResult === "callback" ? $("nextTime").value : $("nextTimeDefault").value;
  const oldState = stateLabel(lead.state);
  const newState = stateLabel(transition.state);
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
  showToast(completedLeadId + " 已提交，当前任务已完成，已进入下一条");
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
  { key: "region", label: "地区", input: "editRegion", original: "originalRegion" }
];

function ensureLeadEditData(lead) {
  if (!lead.original) {
    lead.original = {};
    editableUserFields.forEach((field) => { lead.original[field.key] = lead[field.key] || "—"; });
  }
  if (!lead.editRecords) lead.editRecords = [];
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
  $("cancelEditButton").textContent = tabName === "current" ? "取消" : "关闭";
}

function renderOriginalInfo(lead) {
  editableUserFields.forEach((field) => fillText(field.original, lead.original[field.key] || "—"));
}

function renderEditHistory(lead) {
  const list = $("editHistoryList");
  list.innerHTML = "";
  fillText("editHistoryCount", lead.editRecords.length);
  if (!lead.editRecords.length) {
    list.appendChild(el("li", "edit-history-empty", "暂无编辑记录"));
    return;
  }
  lead.editRecords.forEach((record) => {
    const item = el("li", "edit-history-item");
    const meta = el("div", "edit-history-meta");
    meta.append(el("span", "", record.time), el("span", "edit-history-operator", "操作人：" + record.operator));
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
  editableUserFields.forEach((field) => { $(field.input).value = lead[field.key] || ""; });
  renderOriginalInfo(lead);
  renderEditHistory(lead);
  switchEditTab("current");
  $("editDialog").showModal();
}

function saveUserInfo(event) {
  event.preventDefault();
  const lead = activeLead();
  ensureLeadEditData(lead);
  const changes = [];
  editableUserFields.forEach((field) => {
    const before = lead[field.key] || "";
    const after = $(field.input).value.trim();
    if (before !== after) changes.push({ field: field.label, before: before || "—", after: after || "—" });
  });
  if (!changes.length) {
    showToast("当前信息没有变化");
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
  showToast("用户当前信息已更新，原始线索信息未被覆盖");
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
  showToast(lead.watched ? "已关注当前线索" : "已取消关注");
});
$("operationsTab").addEventListener("click", () => switchTab("operations"));
$("notesTab").addEventListener("click", () => switchTab("notes"));
$("noteForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const value = $("noteInput").value.trim();
  if (!value) return showToast("请输入跟踪内容");
  activeLead().notes.unshift(["刚刚", value]);
  $("noteInput").value = "";
  renderRecords();
  showToast("跟踪记录已添加");
});
$("editUserButton").addEventListener("click", openEditDialog);
$("editForm").addEventListener("submit", saveUserInfo);
$("editOriginalTab").addEventListener("click", () => switchEditTab("original"));
$("editCurrentTab").addEventListener("click", () => switchEditTab("current"));
$("editHistoryTab").addEventListener("click", () => switchEditTab("history"));
$("closeEditButton").addEventListener("click", () => $("editDialog").close());
$("cancelEditButton").addEventListener("click", () => $("editDialog").close());

fillText("salespersonTop", data.salesperson.id + " " + data.salesperson.name);
renderLead();
