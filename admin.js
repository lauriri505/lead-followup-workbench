const storageKey = "autocava_admin_demo_config_v1";
const sourceData = window.AUTOCAVA_ADMIN_DATA;
const copy = (value) => JSON.parse(JSON.stringify(value));
let state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return saved ? { ...copy(sourceData), ...saved, leads: copy(sourceData.leads) } : copy(sourceData);
  } catch (error) { return copy(sourceData); }
})();
if (!state.transitionConfig) state.transitionConfig = copy(sourceData.transitionConfig);
state.transitionConfig.results.forEach((result, index) => {
  if (typeof result.enabled !== "boolean") result.enabled = true;
  if (!Number.isFinite(result.sortOrder)) result.sortOrder = (index + 1) * 10;
});
Object.keys(state.permissions || {}).forEach((role) => {
  state.permissions[role] = state.permissions[role].map((permission) => permission === "配置跟进节点" ? "配置线索流转" : permission);
});

const $ = (id) => document.getElementById(id);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const roleLabels = { super_admin: "超级管理员", sales: "AutoCava销售" };
const permissionOptions = ["查看平台全部普通线索", "查看本人负责线索", "配置账号与角色", "配置任务规则", "配置线索流转", "查看操作记录", "允许接收导入线索", "处理销售任务", "提交跟进结果", "编辑用户当前信息", "添加跟踪记事"];
const viewNames = { dashboard: "后台总览", leads: "线索数据", accounts: "账号与角色", tasks: "任务配置", nodes: "线索流转配置" };
const groupLabels = { entry: "系统入口", not_followed: "未跟进", followed: "跟进中", dormant: "暂存", overdue: "过期未跟进", success: "确认金融购车", lost: "战败" };
const mainStatusGroups = Object.fromEntries(Object.entries(groupLabels).map(([group, label]) => [label, group]));
const categoryLabels = { contact: "联系", unreachable: "未接通", callback: "约定回访", dormant: "暂存", lost: "终止" };
const taskLabels = { FIRST_CONTACT: "首次联系", FOLLOW_UP: "普通回访" };
const accountSessionKey = "autocava_admin_current_account";
let currentRole = (() => { try { return localStorage.getItem(accountSessionKey) || "super_admin"; } catch (error) { return "super_admin"; } })();
const protectedViews = new Set(["accounts", "tasks", "nodes"]);
const canAccess = (view) => currentRole === "super_admin" || !protectedViews.has(view);

function persist() {
  localStorage.setItem(storageKey, JSON.stringify({ accounts: state.accounts, permissions: state.permissions, taskRules: state.taskRules, transitionConfig: state.transitionConfig }));
}
let toastTimer;
function toast(message) {
  $("adminToast").textContent = message;
  $("adminToast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $("adminToast").classList.remove("show"), 2400);
}
function openView(view) {
  qsa(".admin-view").forEach((section) => {
    section.hidden = section.id !== view + "View";
    section.classList.toggle("active", section.id === view + "View");
  });
  qsa(".nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === view));
  $("viewTitle").textContent = viewNames[view];
  const locked = !canAccess(view);
  const selectedSection = $(view + "View");
  selectedSection?.classList.toggle("permission-locked", locked);
  selectedSection?.querySelector("[data-permission-message]")?.toggleAttribute("hidden", !locked);
  document.querySelector(".admin-sidebar").classList.remove("open");
  if (!locked) ({ leads: renderLeads, accounts: renderAccounts, tasks: renderTaskRules, nodes: renderTransitions })[view]?.();
}

function renderAccountSession() {
  const accounts = state.accounts.filter((account) => ["super_admin", "sales"].includes(account.role));
  const switcher = $("accountSwitcher");
  switcher.innerHTML = accounts.map((account) => `<option value="${esc(account.role)}">${esc(account.id)} · ${esc(roleLabels[account.role])}</option>`).join("");
  if (!accounts.some((account) => account.role === currentRole)) currentRole = "super_admin";
  switcher.value = currentRole;
  const account = accounts.find((item) => item.role === currentRole) || accounts[0];
  $("currentAccountLabel").textContent = account.id + " · " + roleLabels[account.role];
  $("currentAccountAvatar").textContent = currentRole === "super_admin" ? "管" : "销";
}

const qualityLabels = { UNKNOWN: "待判定", VALID: "有效", INVALID: "无效" };
function statusClass(status) { return status === "战败" ? "lost" : ["暂存", "过期未跟进"].includes(status) ? "dormant" : ["跟进中", "确认金融购车"].includes(status) ? "won" : ""; }
function leadRow(lead) {
  return `<tr><td><strong>${esc(lead.id)}</strong></td><td class="lead-person"><strong>${esc(lead.name)}</strong><small>${esc(lead.phone)}</small></td><td>${esc(lead.type || lead.leadType)}</td><td>${esc(lead.entryType || "系统")}</td><td>${esc(lead.channel || "—")}</td><td>${esc(lead.source || "—")}</td><td>${esc(lead.city || lead.region || "—")}</td><td>${esc(lead.brand)} ${esc(lead.series)} ${esc(lead.model)}</td><td><span class="table-status ${statusClass(lead.status)}">${esc(lead.status)} · ${esc(lead.subStatus)}</span></td><td><span class="quality-chip ${(lead.quality || "UNKNOWN").toLowerCase()}">${esc(qualityLabels[lead.quality] || "待判定")}</span></td><td>${esc(lead.assignee)}</td><td><span class="task-state ${lead.taskStatus === "处理中" ? "processing" : ""}">${esc(lead.task)} · ${esc(lead.taskStatus)}</span></td><td>${esc(lead.createdAt)}</td></tr>`;
}
function compactLeadRow(lead) {
  return `<tr><td><strong>${esc(lead.id)}</strong></td><td class="lead-person"><strong>${esc(lead.name)}</strong><small>${esc(lead.phone)}</small></td><td>${esc(lead.source || lead.channel || "—")}</td><td>${esc(lead.brand)} ${esc(lead.series)} ${esc(lead.model)}</td><td><span class="table-status ${statusClass(lead.status)}">${esc(lead.status)} · ${esc(lead.subStatus)}</span></td><td><span class="quality-chip ${(lead.quality || "UNKNOWN").toLowerCase()}">${esc(qualityLabels[lead.quality] || "待判定")}</span></td><td>${esc(lead.assignee)}</td><td><span class="task-state ${lead.taskStatus === "处理中" ? "processing" : ""}">${esc(lead.task)} · ${esc(lead.taskStatus)}</span></td><td>${esc(lead.createdAt)}</td></tr>`;
}
function renderDashboard() {
  const activeTasks = state.leads.filter((lead) => ["待处理", "处理中"].includes(lead.taskStatus)).length;
  const validCount = state.leads.filter((lead) => lead.quality === "VALID").length;
  const invalidCount = state.leads.filter((lead) => lead.quality === "INVALID").length;
  const judgedCount = validCount + invalidCount;
  const validRate = judgedCount ? `${Math.round(validCount / judgedCount * 100)}%` : "—";
  const invalidRate = judgedCount ? `${Math.round(invalidCount / judgedCount * 100)}%` : "—";
  const metrics = [["普通线索总数", state.leads.length, "平台普通线索一期数据", "emphasis"], ["已判定有效率", validRate, `${validCount} 条有效 / ${judgedCount} 条已判定`, ""], ["已判定无效率", invalidRate, `${invalidCount} 条无效 / ${judgedCount} 条已判定`, ""], ["待判定线索", state.leads.filter((lead) => !lead.quality || lead.quality === "UNKNOWN").length, "未跟进、过期或未接通未达上限", ""], ["有效销售任务", activeTasks, "待处理 + 处理中", ""]];
  $("metricGrid").innerHTML = metrics.map(([label, value, note, cls]) => `<article class="metric-card ${cls}"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
  const stages = ["未跟进", "过期未跟进", "跟进中", "暂存", "确认金融购车", "战败"].map((name) => [name, state.leads.filter((lead) => lead.status === name).length]);
  const max = Math.max(...stages.map((item) => item[1]), 1);
  $("stageBars").innerHTML = stages.map(([name, count]) => `<div class="stage-row"><span>${name}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(5, count / max * 100)}%"></div></div><strong>${count}</strong></div>`).join("");
  $("taskSummary").innerHTML = ["待处理", "处理中", "已逾期", "已完成", "已结束"].map((name) => `<div class="summary-cell"><span>${name}</span><strong>${state.leads.filter((lead) => lead.taskStatus === name).length}</strong></div>`).join("");
  $("recentLeadRows").innerHTML = state.leads.slice(0, 5).map(compactLeadRow).join("");
}
function buildLeadFilters() {
  $("leadStatusFilter").innerHTML = `<option value="">全部线索状态</option>${[...new Set(state.leads.map((lead) => lead.status))].map((item) => `<option>${esc(item)}</option>`).join("")}`;
  $("leadAssigneeFilter").innerHTML = `<option value="">全部负责人</option>${[...new Set(state.leads.map((lead) => lead.assignee))].map((item) => `<option>${esc(item)}</option>`).join("")}`;
}
function renderLeads() {
  const query = $("leadSearch").value.trim().toLowerCase();
  const filtered = state.leads.filter((lead) => (!query || [lead.id, lead.name, lead.phone].some((value) => value.toLowerCase().includes(query))) && (!$("leadStatusFilter").value || lead.status === $("leadStatusFilter").value) && (!$("leadAssigneeFilter").value || lead.assignee === $("leadAssigneeFilter").value));
  $("leadTotal").textContent = filtered.length;
  $("leadRows").innerHTML = filtered.map(leadRow).join("");
  $("leadEmpty").hidden = filtered.length > 0;
}
function importEligibleAccounts() {
  return state.accounts.filter((account) => account.status === "启用" && (state.permissions[account.role] || []).includes("允许接收导入线索"));
}
function syncImportFields() {
  const manual = $("importEntryType").value === "人工";
  $("importChannel").disabled = manual;
  $("importSource").disabled = manual;
  if (manual) { $("importChannel").value = ""; $("importSource").value = ""; }
}
function openImportModal() {
  if (!(state.permissions[currentRole] || []).includes("允许接收导入线索")) return toast("当前账号没有导入线索权限");
  const accounts = importEligibleAccounts();
  if (!accounts.length) return toast("没有可分配的账号，请先在账号与角色中勾选“允许接收导入线索”");
  $("importAssignee").innerHTML = accounts.map((account) => `<option value="${esc(account.id)}">${esc(account.id)} · ${esc(account.username)}</option>`).join("");
  if (!$('importCreatedAt').value) $('importCreatedAt').value = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 16);
  $("importModal").hidden = false; $("importName").focus();
}
function submitImport(event) {
  event.preventDefault();
  const assignee = importEligibleAccounts().find((account) => account.id === $("importAssignee").value);
  if (!assignee) return toast("当前账号没有导入线索权限，请先配置后再分配");
  const manual = $("importEntryType").value === "人工";
  const prefix = state.tenant?.brand === "BAIC" ? "BAIC-LD" : "AC-LD";
  const lead = { id: `${prefix}-${Date.now()}`, name: $("importName").value.trim(), phone: $("importPhone").value.trim(), city: $("importCity").value.trim(), region: $("importCity").value.trim(), brand: $("importBrand").value.trim(), series: $("importSeries").value.trim(), model: $("importModel").value.trim(), type: $("importType").value, leadType: $("importType").value, entryType: $("importEntryType").value, channel: manual ? "" : $("importChannel").value, source: manual ? "" : $("importSource").value, createdAt: $("importCreatedAt").value.replace("T", " "), status: "未跟进", subStatus: "正常等待跟进", quality: "UNKNOWN", assignee: assignee.id + " " + assignee.username, task: "首次联系", taskStatus: "待处理" };
  state.leads.unshift(lead); persist(); renderLeads(); renderDashboard(); $("importModal").hidden = true; event.target.reset(); syncImportFields(); toast("线索已导入并分配给 " + assignee.id + " " + assignee.username);
}
function renderAccounts() {
  $("accountRows").innerHTML = state.accounts.map((account, index) => `<tr><td><strong>${esc(account.id)}</strong></td><td>${esc(account.username)}</td><td><select class="account-role" data-index="${index}"><option value="super_admin" ${account.role === "super_admin" ? "selected" : ""}>超级管理员</option><option value="sales" ${account.role === "sales" ? "selected" : ""}>AutoCava销售</option></select></td><td>${account.role === "super_admin" ? "平台全部普通线索" : "本人负责线索"}</td><td><select class="account-status" data-index="${index}"><option ${account.status === "启用" ? "selected" : ""}>启用</option><option ${account.status === "停用" ? "selected" : ""}>停用</option></select></td><td>${esc(account.lastLogin)}</td></tr>`).join("");
  $("roleGrid").innerHTML = Object.keys(roleLabels).map((role) => `<article class="role-card"><h3>${roleLabels[role]}</h3><p>${role === "super_admin" ? "管理 AutoCava 平台普通线索、账号与规则配置" : "处理本人负责的线索和任务"}</p><div class="permission-list">${permissionOptions.map((permission) => `<label><input type="checkbox" data-role="${role}" value="${permission}" ${(state.permissions[role] || []).includes(permission) ? "checked" : ""}>${permission}</label>`).join("")}</div></article>`).join("");
}
function renderTaskRules() {
  $("taskRuleList").innerHTML = state.taskRules.map((rule, index) => `<article class="task-rule"><span class="rule-index">${String(index + 1).padStart(2, "0")}</span><div class="rule-field"><label>任务类型</label><input data-task-index="${index}" data-field="type" value="${esc(rule.type)}"></div><div class="rule-field"><label>触发事件</label><input data-task-index="${index}" data-field="trigger" value="${esc(rule.trigger)}"></div><div class="rule-field"><label>默认截止时间</label><input data-task-index="${index}" data-field="deadline" value="${esc(rule.deadline)}"></div><label class="switch-label"><input type="checkbox" data-task-index="${index}" data-field="enabled" ${rule.enabled ? "checked" : ""}>启用规则</label></article>`).join("");
}

function stateByCode(code) { return state.transitionConfig.states.find((item) => item.code === code); }
function resultByCode(code) { return state.transitionConfig.results.find((item) => item.code === code); }
function tagByCode(code) { return (state.transitionConfig.leadTags || []).find((item) => item.code === code); }
function stateName(code) { return stateByCode(code)?.name || code || "—"; }
function resultName(code) { return resultByCode(code)?.name || code || "—"; }
function markDirty() { $("transitionSaveHint").textContent = "有未保存的线索流转配置"; }

function renderTransitionSummary() {
  const config = state.transitionConfig;
  const salesResults = config.results.filter((item) => item.actor !== "system");
  const systemEvents = config.results.filter((item) => item.actor === "system");
  const enabledResults = salesResults.filter((item) => item.enabled !== false);
  const mainStatuses = new Set(config.states.filter((item) => item.group !== "entry").map((item) => item.businessStage));
  const values = [["主状态", mainStatuses.size, `${config.states.length - 1} 个业务子状态`], ["有效性口径", (config.qualityOptions || []).length, "待判定 / 有效 / 无效"], ["补充字段", (config.progressFields || []).length, "按需要配置"], ["销售跟进结果", enabledResults.length, `${salesResults.length} 个已配置 · ${systemEvents.length} 个系统事件`], ["流转规则", config.flows.length, "状态 + 结果的组合"], ["配置版本", config.brand.version, config.brand.status]];
  $("transitionSummary").innerHTML = values.map(([label, value, note]) => `<article><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
}
function renderStateTree() {
  const qualityItems = (state.transitionConfig.qualityOptions || []).map((item) => `<span class="lead-quality-tag" style="--tag-color:${item.color}"><i></i>有效性：${esc(item.name)}<small>${esc(item.code)}</small></span>`);
  const progressItems = (state.transitionConfig.progressFields || []).map((field) => `<span class="lead-quality-tag" style="--tag-color:#2fcf9f"><i></i>${esc(field.name)}<small>是 / 否</small></span>`);
  $("leadTagList").innerHTML = [...qualityItems, ...progressItems].join("");
  const levels = [...new Set(state.transitionConfig.states.map((item) => item.level))].sort((a, b) => a - b);
  $("stateTree").style.gridTemplateColumns = `repeat(${levels.length}, minmax(180px, 1fr))`;
  $("stateTree").innerHTML = levels.map((level) => {
    const items = state.transitionConfig.states.filter((item) => item.level === level);
    return `<div class="tree-level"><header><span>层级 ${level}</span><strong>${items.length}</strong></header><div>${items.map((item) => `<button class="tree-node ${item.terminal ? "terminal" : ""}" data-edit-state="${esc(item.code)}" type="button" style="--node-color:${item.color}" title="${esc(item.code)}"><span></span><strong>${esc(item.name)}</strong><small>${esc(item.businessStage || groupLabels[item.group])}</small></button>`).join("") || `<p>暂无节点</p>`}</div></div>`;
  }).join("");
}
function renderStateRows() {
  $("stateRows").innerHTML = state.transitionConfig.states.map((item) => `<tr><td><span class="group-chip ${item.group}">${esc(item.businessStage || groupLabels[item.group] || item.group)}</span></td><td><span class="state-name-cell"><i style="background:${item.color}"></i><strong>${esc(item.name)}</strong></span></td><td><code>${esc(item.code)}</code></td><td><span class="attribute-tags">${item.group === "entry" ? "<em>系统入口</em>" : item.terminal ? "<em>终态</em>" : "<em>可继续跟进</em>"}</span></td><td>${esc(stateName(item.parent))}</td><td><div class="row-actions"><button data-edit-state="${esc(item.code)}" type="button">编辑</button><button class="danger-text" data-delete-state="${esc(item.code)}" type="button">删除</button></div></td></tr>`).join("");
}
function renderResultRows() {
  const salesResults = state.transitionConfig.results
    .filter((result) => result.actor !== "system")
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "zh-CN"));
  $("resultRows").innerHTML = salesResults.map((result) => {
    const nodes = [...new Set(state.transitionConfig.flows.filter((flow) => flow.result === result.code).map((flow) => stateName(flow.current)))];
    const requirements = [result.requiresReason ? "原因必填" : "", result.requiresCallbackTime ? "下次联系时间必填" : ""].filter(Boolean);
    return `<tr><td><span class="result-order">${result.sortOrder}</span></td><td><strong>${esc(result.name)}</strong></td><td><code>${esc(result.code)}</code></td><td>${esc(categoryLabels[result.category] || result.category || "—")}</td><td><div class="requirement-list">${requirements.length ? requirements.map((item) => `<span>${item}</span>`).join("") : "<span>无附加填写</span>"}</div></td><td><div class="node-usage">${nodes.length ? nodes.map((node) => `<span>${esc(node)}</span>`).join("") : "<span>尚未配置</span>"}</div></td><td><span class="result-status ${result.enabled ? "" : "disabled"}">${result.enabled ? "启用" : "停用"}</span></td><td><div class="row-actions"><button data-edit-result="${esc(result.code)}" type="button">编辑</button><button class="danger-text" data-delete-result="${esc(result.code)}" type="button">删除</button></div></td></tr>`;
  }).join("") || `<tr><td colspan="8" class="empty-cell">尚未配置销售跟进结果</td></tr>`;
}
function renderStrategyFilter() {
  const current = $("strategyStateFilter").value;
  $("strategyStateFilter").innerHTML = `<option value="">全部当前节点</option>${state.transitionConfig.states.map((item) => `<option value="${esc(item.code)}">${esc(item.name)}</option>`).join("")}`;
  if (stateByCode(current)) $("strategyStateFilter").value = current;
}
function renderStrategyRows() {
  const flows = state.transitionConfig.flows.filter((item) => !$("strategyStateFilter").value || item.current === $("strategyStateFilter").value);
  $("strategyCount").textContent = `显示 ${flows.length} / ${state.transitionConfig.flows.length} 条规则`;
  $("strategyRows").innerHTML = flows.map((flow) => {
    const result = resultByCode(flow.result);
    const progressLabels = { trialStatus: "是否预约试驾", visitStatus: "是否到店", dealStatus: "是否成交" };
    const fieldUpdates = Object.entries(flow.fieldUpdates || {}).map(([field, value]) => `${progressLabels[field] || field}：${value === "YES" ? "是" : "否"}`);
    const limitUpdate = flow.terminalAt ? `累计${flow.terminalAt}次 → ${stateName(flow.terminalNext)}` : "";
    const qualityUpdate = flow.qualityUpdate ? `有效性：${qualityLabels[flow.qualityUpdate] || flow.qualityUpdate}` : "";
    const updates = [qualityUpdate, ...(flow.setTags || []).map((code) => `标签：${tagByCode(code)?.name || code}`), ...fieldUpdates, flow.unreachable ? "未接通次数 +1" : "", limitUpdate, flow.reason || result?.requiresReason ? "原因必填" : "", result?.requiresCallbackTime ? "时间必填" : "", flow.retry ? "生成重试" : "", flow.reactivation ? "到期回捞" : ""].filter(Boolean);
    const resultSource = result?.actor === "system" ? "系统事件" : "销售结果";
    const taskRule = state.taskRules.find((item) => item.id === flow.taskRuleId);
    return `<tr><td><strong>${esc(stateName(flow.current))}</strong><small class="table-code">${esc(flow.current)}</small></td><td><strong>${esc(resultName(flow.result))}</strong><small class="table-code">${resultSource} · ${categoryLabels[result?.category] || result?.category || "—"}</small></td><td><span class="flow-direction">→</span><strong>${esc(stateName(flow.next))}</strong>${flow.current === flow.next ? `<small class="self-loop">状态保持</small>` : ""}</td><td><div class="update-tags">${updates.length ? updates.map((item) => `<span>${item}</span>`).join("") : "<span>无</span>"}</div></td><td>${taskRule ? `<strong>${esc(taskRule.type)}</strong><small class="table-code">${esc(taskRule.id)} · ${esc(taskRule.trigger)}</small>` : flow.task ? `<strong>${taskLabels[flow.task] || esc(flow.task)}</strong><small class="table-code">未绑定具体任务规则</small>` : "不生成任务"}</td><td>${esc(taskRule?.deadline || flow.deadline || "—")}</td><td><div class="row-actions"><button data-edit-flow="${flow.id}" type="button">编辑</button><button class="danger-text" data-delete-flow="${flow.id}" type="button">删除</button></div></td></tr>`;
  }).join("") || `<tr><td colspan="7" class="empty-cell">当前筛选条件下没有流转规则</td></tr>`;
}
function renderProgressStateRows() {
  const fieldLabels = { trialStatus: "是否预约试驾", visitStatus: "是否到店", dealStatus: "是否成交" };
  const valueLabels = { YES: "是", NO: "否" };
  const rules = [...(state.transitionConfig.progressStateRules || [])].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  $("progressStateRows").innerHTML = rules.map((rule) => {
    const requirements = Object.entries(rule.requires || {}).map(([field, value]) => `${fieldLabels[field] || field}=${valueLabels[value] || value}`).join("；") || "无";
    return `<tr><td><strong>${rule.priority}</strong></td><td>${esc(fieldLabels[rule.field] || rule.field)}</td><td>${esc(valueLabels[rule.value] || rule.value)}</td><td>${esc(requirements)}</td><td><span class="flow-direction">→</span><strong>${esc(stateName(rule.next))}</strong></td></tr>`;
  }).join("") || `<tr><td colspan="5" class="empty-cell">尚未配置客户推进节点判定规则</td></tr>`;
}
function renderProgressFieldRows() {
  const fields = [...(state.transitionConfig.progressFields || [])].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const fieldLabels = Object.fromEntries(fields.map((item) => [item.code, item.name]));
  const valueLabels = { YES: "是", NO: "否" };
  $("progressFieldRows").innerHTML = fields.map((field) => {
    const results = (field.resultCodes || []).map((code) => resultName(code)).join("、") || "全部跟进结果";
    const states = (field.stateCodes || []).map((code) => stateName(code)).join("、") || "全部状态";
    const taskScenes = (field.taskRuleIds || []).map((id) => state.taskRules.find((rule) => rule.id === id)?.trigger || id).join("、");
    const scene = [results, states, taskScenes].filter(Boolean).join("；");
    const condition = field.dependsOn ? `${fieldLabels[field.dependsOn.field] || field.dependsOn.field} = ${valueLabels[field.dependsOn.value] || field.dependsOn.value}` : "进入适用场景后展示";
    const actions = [];
    if (field.required) actions.push("必填");
    if (field.inputWhen) actions.push(`${valueLabels[field.inputWhen.value] || field.inputWhen.value}时填写${field.inputWhen.name}`);
    Object.entries(field.taskRulesByValue || {}).forEach(([value, ids]) => actions.push(`${valueLabels[value] || value}：生成${ids.map((id) => state.taskRules.find((rule) => rule.id === id)?.trigger || id).join("、")}`));
    (field.reasonRequiredValues || []).forEach((value) => actions.push(`${valueLabels[value] || value}：原因必填`));
    (field.terminalValues || []).forEach((value) => actions.push(`${valueLabels[value] || value}：进入终态`));
    return `<tr><td><strong>${field.sortOrder || "—"}</strong></td><td><strong>${esc(field.name)}</strong><small class="table-code">${esc(field.code)} · ${(field.values || []).map((value) => valueLabels[value] || value).join(" / ")}</small></td><td>${esc(scene)}</td><td>${esc(condition)}</td><td><div class="update-tags">${actions.map((item) => `<span>${esc(item)}</span>`).join("")}</div></td></tr>`;
  }).join("") || `<tr><td colspan="5" class="empty-cell">尚未配置工作台推进字段</td></tr>`;
}
function renderFlowBoard() {
  const config = state.transitionConfig;
  const diagram = config.journeyDiagram || { width: 1200, height: 700, nodes: [], edges: [] };
  $("flowLegend").innerHTML = `<span><i class="legend-dot not-followed"></i>进行中状态</span><span><i class="legend-dot task"></i>销售任务</span><span><i class="legend-dot won"></i>成功终态</span><span><i class="legend-dot failure"></i>战败终态</span><strong>状态 + 跟进结果 → 新状态 + 有效性 + 下一任务</strong>`;
  const nodeMap = Object.fromEntries(diagram.nodes.map((item) => [item.id, item]));
  const nodeSize = (item) => item.kind === "decision" ? { width: 156, height: 88 } : { width: 184, height: 62 };
  const edgeSvg = diagram.edges.map((edge) => {
    const source = nodeMap[edge.from];
    const target = nodeMap[edge.to];
    if (!source || !target) return "";
    const sourceSize = nodeSize(source);
    const targetSize = nodeSize(target);
    let x1;
    let y1;
    let x2;
    let y2;
    let path;
    if (Math.abs(target.x - source.x) < 60) {
      const downward = target.y >= source.y;
      x1 = source.x + sourceSize.width / 2;
      y1 = downward ? source.y + sourceSize.height : source.y;
      x2 = target.x + targetSize.width / 2;
      y2 = downward ? target.y : target.y + targetSize.height;
      const bend = Math.max(54, Math.abs(y2 - y1) * .42);
      path = `M ${x1} ${y1} C ${x1} ${y1 + (downward ? bend : -bend)}, ${x2} ${y2 + (downward ? -bend : bend)}, ${x2} ${y2}`;
    } else {
      const forward = target.x > source.x;
      x1 = forward ? source.x + sourceSize.width : source.x;
      y1 = source.y + sourceSize.height / 2;
      x2 = forward ? target.x : target.x + targetSize.width;
      y2 = target.y + targetSize.height / 2;
      const bend = Math.max(72, Math.abs(x2 - x1) * .42);
      path = `M ${x1} ${y1} C ${x1 + (forward ? bend : -bend)} ${y1}, ${x2 + (forward ? -bend : bend)} ${y2}, ${x2} ${y2}`;
    }
    const labelX = (x1 + x2) / 2;
    const labelY = (y1 + y2) / 2 - 8;
    return `<g class="flow-edge journey-edge"><path d="${path}" marker-end="url(#flowArrow)"></path>${edge.label ? `<text x="${labelX}" y="${labelY}" text-anchor="middle">${esc(edge.label)}</text>` : ""}</g>`;
  }).join("");
  const nodeSvg = diagram.nodes.map((item) => {
    const size = nodeSize(item);
    const stateItem = item.stateCode ? stateByCode(item.stateCode) : null;
    const interactive = Boolean(stateItem);
    const className = `flow-node-svg journey-node ${item.kind}${stateItem?.terminal ? " terminal" : ""}`;
    const attributes = interactive ? `data-flow-state="${esc(item.stateCode)}" role="button" tabindex="0"` : `aria-hidden="true"`;
    const body = item.kind === "decision"
      ? `<polygon class="node-body" points="${size.width / 2},0 ${size.width},${size.height / 2} ${size.width / 2},${size.height} 0,${size.height / 2}"></polygon>`
      : item.kind === "task"
        ? `<polygon class="node-body" points="16,0 ${size.width - 16},0 ${size.width},${size.height / 2} ${size.width - 16},${size.height} 16,${size.height} 0,${size.height / 2}"></polygon>`
        : `<rect class="node-body" width="${size.width}" height="${size.height}" rx="${["success", "failure", "invalid"].includes(item.kind) ? size.height / 2 : 8}"></rect>`;
    return `<g class="${className}" ${attributes} transform="translate(${item.x} ${item.y})">${body}<text class="node-title" x="${size.width / 2}" y="${size.height / 2 - 3}" text-anchor="middle">${esc(item.label)}</text><text class="node-stage" x="${size.width / 2}" y="${size.height / 2 + 15}" text-anchor="middle">${esc(item.subtitle || "")}</text></g>`;
  }).join("");
  $("flowBoard").style.gridTemplateColumns = "none";
  $("flowBoard").innerHTML = `<svg class="transition-svg" viewBox="0 0 ${diagram.width} ${diagram.height}" width="${diagram.width}" height="${diagram.height}" aria-label="AutoCava普通线索状态与任务流转图"><defs><marker id="flowArrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,4 L0,8 z"></path></marker><filter id="flowShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#152136" flood-opacity=".12"></feDropShadow></filter></defs>${edgeSvg}${nodeSvg}</svg>`;
  showFlowDetail($("flowDetail").dataset.state && stateByCode($("flowDetail").dataset.state) ? $("flowDetail").dataset.state : "issued");
}
function showFlowDetail(code) {
  const item = stateByCode(code); if (!item) return;
  qsa(".flow-node-svg").forEach((node) => node.classList.toggle("selected", node.dataset.flowState === code));
  $("flowDetail").dataset.state = code;
  const incoming = state.transitionConfig.flows.filter((flow) => flow.next === code && flow.current !== code);
  const outgoing = state.transitionConfig.flows.filter((flow) => flow.current === code);
  const line = (flow, incomingDirection) => `<li><span>${esc(incomingDirection ? stateName(flow.current) : resultName(flow.result))}</span><b>${esc(incomingDirection ? resultName(flow.result) : stateName(flow.next))}</b><em>${flow.task ? taskLabels[flow.task] || flow.task : "不生成任务"}</em></li>`;
  $("flowDetail").innerHTML = `<header><div><span class="detail-color" style="background:${item.color}"></span><strong>${esc(item.name)}</strong><code>${esc(item.code)}</code></div><small>${esc(item.businessStage || groupLabels[item.group] || item.group)} · 层级 ${item.level}${item.terminal ? " · 终态" : ""}</small></header><div class="flow-detail-grid"><section><h3>进入该节点 <span>${incoming.length}</span></h3><ul>${incoming.map((flow) => line(flow, true)).join("") || "<li class='no-rule'>无进入规则</li>"}</ul></section><section><h3>离开该节点 <span>${outgoing.length}</span></h3><ul>${outgoing.map((flow) => line(flow, false)).join("") || "<li class='no-rule'>无离开规则</li>"}</ul></section></div>`;
}
function renderTransitions() {
  renderTransitionSummary(); renderStateTree(); renderStateRows(); renderResultRows(); renderStrategyFilter(); renderStrategyRows(); renderProgressFieldRows(); renderProgressStateRows(); renderFlowBoard();
  $("transitionJson").textContent = JSON.stringify(state.transitionConfig, null, 2);
}
function switchConfigTab(tab) {
  qsa(".config-tab").forEach((button) => button.classList.toggle("active", button.dataset.configTab === tab));
  qsa(".config-pane").forEach((pane) => { const active = pane.id === `config${tab[0].toUpperCase()}${tab.slice(1)}Pane`; pane.hidden = !active; pane.classList.toggle("active", active); });
  if (tab === "diagram") renderFlowBoard();
  if (tab === "preview") $("transitionJson").textContent = JSON.stringify(state.transitionConfig, null, 2);
}

let modalMode = "";
let editingKey = null;
function openTransitionModal(mode, key = null) {
  modalMode = mode; editingKey = key;
  const config = state.transitionConfig;
  const modalMeta = {
    state: ["STATE DICTIONARY", "节点"],
    result: ["FOLLOW-UP RESULT", "跟进结果"],
    flow: ["FOLLOW-UP STRATEGY", "策略"]
  }[mode];
  $("transitionModalEyebrow").textContent = modalMeta[0];
  $("transitionModalTitle").textContent = `${key === null ? "添加" : "编辑"}${modalMeta[1]}`;
  if (mode === "state") {
    const item = key ? stateByCode(key) : null;
    const parents = config.states.filter((entry) => entry.code !== key).map((entry) => `<option value="${esc(entry.code)}" ${item?.parent === entry.code ? "selected" : ""}>${esc(entry.name)}（${esc(entry.code)}）</option>`).join("");
    $("transitionModalBody").innerHTML = `<div class="modal-form-grid"><label><span>状态编码 *</span><input id="modalStateCode" required value="${esc(item?.code || "")}" ${item ? "readonly" : ""} placeholder="例如：not_followed"></label><label><span>子状态名称 *</span><input id="modalStateName" required value="${esc(item?.name || "")}" placeholder="例如：正常等待跟进"></label><label><span>主状态 *</span><select id="modalStateBusinessStage">${Object.values(groupLabels).map((label) => `<option ${item?.businessStage === label ? "selected" : ""}>${label}</option>`).join("")}</select></label><label><span>父节点</span><select id="modalStateParent"><option value="">无（根节点）</option>${parents}</select></label><label><span>流程层级 *</span><input id="modalStateLevel" type="number" min="1" max="8" value="${item?.level || 1}" required></label><label><span>节点颜色</span><input id="modalStateColor" type="color" value="${item?.color || "#345f9f"}"></label></div><div class="modal-checks"><label><input id="modalStateTerminal" type="checkbox" ${item?.terminal ? "checked" : ""}>终态（不再产生后续任务）</label></div>`;
  } else if (mode === "result") {
    const item = key ? resultByCode(key) : null;
    const nextOrder = Math.max(0, ...config.results.filter((result) => result.actor !== "system").map((result) => result.sortOrder || 0)) + 10;
    $("transitionModalBody").innerHTML = `<div class="modal-form-grid"><label><span>结果编码 *</span><input id="modalResultCode" required value="${esc(item?.code || "")}" ${item ? "readonly" : ""} placeholder="例如：interested"></label><label><span>结果名称 *</span><input id="modalResultName" required value="${esc(item?.name || "")}" placeholder="例如：有意向"></label><label><span>结果分类 *</span><select id="modalResultCategory">${Object.entries(categoryLabels).map(([value, label]) => `<option value="${value}" ${item?.category === value ? "selected" : ""}>${label}</option>`).join("")}</select></label><label><span>工作台展示顺序 *</span><input id="modalResultOrder" type="number" min="1" step="1" required value="${item?.sortOrder || nextOrder}"></label></div><div class="modal-checks"><label><input id="modalResultEnabled" type="checkbox" ${item?.enabled !== false ? "checked" : ""}>在销售工作台启用</label><label><input id="modalResultReason" type="checkbox" ${item?.requiresReason ? "checked" : ""}>选择后原因必填</label><label><input id="modalResultCallback" type="checkbox" ${item?.requiresCallbackTime ? "checked" : ""}>选择后下次联系时间必填</label></div><div class="result-source-note"><strong>销售结果</strong><span>保存后还需在“跟进策略”中绑定适用节点，工作台才会展示。</span></div>`;
  } else {
    const flow = key !== null ? config.flows.find((item) => item.id === Number(key)) : null;
    const stateOptions = (selected) => config.states.map((item) => `<option value="${esc(item.code)}" ${selected === item.code ? "selected" : ""}>${esc(item.name)}（${esc(item.code)}）</option>`).join("");
    const salesResults = config.results.filter((item) => item.actor !== "system").sort((a, b) => a.sortOrder - b.sortOrder).map((item) => `<option value="${esc(item.code)}" ${flow?.result === item.code ? "selected" : ""}>${esc(item.name)}${item.enabled === false ? "（已停用）" : ""}</option>`).join("");
    const systemEvents = config.results.filter((item) => item.actor === "system").map((item) => `<option value="${esc(item.code)}" ${flow?.result === item.code ? "selected" : ""}>${esc(item.name)}</option>`).join("");
    const results = `<optgroup label="销售跟进结果">${salesResults}</optgroup><optgroup label="系统事件">${systemEvents}</optgroup>`;
    const qualityOptions = (config.qualityOptions || []).map((item) => `<option value="${esc(item.code)}" ${flow?.qualityUpdate === item.code ? "selected" : ""}>${esc(item.name)}</option>`).join("");
    const taskRules = state.taskRules.filter((item) => item.enabled !== false).map((item) => `<option value="${esc(item.id)}" ${flow?.taskRuleId === item.id ? "selected" : ""}>${esc(item.type)}｜${esc(item.trigger)}｜${esc(item.deadline)}</option>`).join("");
    $("transitionModalBody").innerHTML = `<div class="modal-form-grid"><label><span>当前状态 *</span><select id="modalFlowCurrent">${stateOptions(flow?.current)}</select></label><label><span>跟进结果 / 系统事件 *</span><select id="modalFlowResult">${results}</select></label><label><span>转换到 *</span><select id="modalFlowNext">${stateOptions(flow?.next)}</select></label><label><span>更新线索有效性 *</span><select id="modalFlowQuality">${qualityOptions}</select></label><label class="modal-wide"><span>后续任务规则</span><select id="modalFlowTaskRule"><option value="" ${!flow?.task ? "selected" : ""}>不生成任务</option>${taskRules}</select></label></div><div class="result-source-note"><strong>跟进结果不是状态</strong><span>保存的是“当前状态 + 跟进结果 → 新状态 + 有效性 + 后续任务”。任务类型、触发说明和截止时间读取所选任务规则。</span></div><div class="modal-checks"><label><input id="modalFlowUnreachable" type="checkbox" ${flow?.unreachable ? "checked" : ""}>未接通次数 +1</label><label><input id="modalFlowReason" type="checkbox" ${flow?.reason ? "checked" : ""}>该状态下原因必填</label><label><input id="modalFlowRetry" type="checkbox" ${flow?.retry ? "checked" : ""}>生成重试任务</label><label><input id="modalFlowReactivation" type="checkbox" ${flow?.reactivation ? "checked" : ""}>到期生成回捞任务</label></div>`;
  }
  $("transitionModal").hidden = false;
  document.body.classList.add("modal-open");
  $("transitionModalBody").querySelector("input:not([readonly]), select")?.focus();
}
function closeTransitionModal() { $("transitionModal").hidden = true; document.body.classList.remove("modal-open"); $("transitionModalForm").reset(); }
function saveStateFromModal() {
  const code = $("modalStateCode").value.trim(); const name = $("modalStateName").value.trim();
  if (!code || !name) return toast("请填写状态编码和显示名称");
  if (editingKey === null && stateByCode(code)) return toast("状态编码已存在");
  const businessStage = $("modalStateBusinessStage").value;
  const item = { code, name, group: mainStatusGroups[businessStage], businessStage, parent: $("modalStateParent").value || null, level: Number($("modalStateLevel").value), terminal: $("modalStateTerminal").checked, dormant: false, color: $("modalStateColor").value };
  if (editingKey === null) state.transitionConfig.states.push(item); else Object.assign(stateByCode(editingKey), item);
  markDirty(); closeTransitionModal(); renderTransitions(); toast("节点已更新，保存后生效");
}
function saveResultFromModal() {
  const code = $("modalResultCode").value.trim();
  const name = $("modalResultName").value.trim();
  if (!code || !name) return toast("请填写结果编码和结果名称");
  if (editingKey === null && resultByCode(code)) return toast("跟进结果编码已存在");
  const item = {
    code,
    name,
    actor: "sales",
    category: $("modalResultCategory").value,
    enabled: $("modalResultEnabled").checked,
    sortOrder: Number($("modalResultOrder").value),
    requiresReason: $("modalResultReason").checked,
    requiresCallbackTime: $("modalResultCallback").checked
  };
  if (editingKey === null) state.transitionConfig.results.push(item);
  else Object.assign(resultByCode(editingKey), item);
  markDirty(); closeTransitionModal(); renderTransitions(); switchConfigTab("results"); toast("跟进结果已更新，保存后工作台生效");
}
function saveFlowFromModal() {
  const config = state.transitionConfig; const result = $("modalFlowResult").value;
  if (!result) return toast("请先选择跟进结果或系统事件");
  const current = $("modalFlowCurrent").value;
  if (config.flows.some((item) => item.current === current && item.result === result && item.id !== Number(editingKey))) return toast("该节点与跟进结果的组合已存在");
  const taskRuleId = $("modalFlowTaskRule").value || null;
  const taskRule = state.taskRules.find((item) => item.id === taskRuleId);
  const taskGroup = taskRule ? (taskRule.group || (taskRule.type.includes("首次联系") ? "FIRST_CONTACT" : "FOLLOW_UP")) : null;
  const flow = { id: editingKey === null ? Math.max(0, ...config.flows.map((item) => item.id)) + 1 : Number(editingKey), current, result, next: $("modalFlowNext").value, qualityUpdate: $("modalFlowQuality").value, setTags: [], fieldUpdates: {}, unreachable: $("modalFlowUnreachable").checked, reason: $("modalFlowReason").checked, task: taskGroup, taskRuleId, deadline: taskRule?.deadline || "—", retry: $("modalFlowRetry").checked, reactivation: $("modalFlowReactivation").checked };
  if (editingKey === null) config.flows.push(flow); else Object.assign(config.flows.find((item) => item.id === Number(editingKey)), flow);
  markDirty(); closeTransitionModal(); renderTransitions(); switchConfigTab("strategies"); toast("跟进策略已更新，保存后生效");
}
function deleteState(code) {
  if (state.transitionConfig.states.some((item) => item.parent === code)) return toast("该节点存在子节点，不能删除");
  if (state.transitionConfig.flows.some((item) => item.current === code || item.next === code)) return toast("该节点已被流转规则引用，不能删除");
  if (!confirm(`确定删除节点“${stateName(code)}”吗？`)) return;
  state.transitionConfig.states = state.transitionConfig.states.filter((item) => item.code !== code); markDirty(); renderTransitions();
}
function deleteFlow(id) {
  if (!confirm("确定删除这条流转策略吗？")) return;
  state.transitionConfig.flows = state.transitionConfig.flows.filter((item) => item.id !== Number(id)); markDirty(); renderTransitions(); switchConfigTab("strategies");
}
function deleteResult(code) {
  if (state.transitionConfig.flows.some((flow) => flow.result === code)) return toast("该跟进结果已被流转策略使用，请先删除对应策略");
  if (!confirm(`确定删除跟进结果“${resultName(code)}”吗？`)) return;
  state.transitionConfig.results = state.transitionConfig.results.filter((result) => result.code !== code);
  markDirty(); renderTransitions(); switchConfigTab("results"); toast("跟进结果已删除，保存后生效");
}
function validateTransitions() {
  const states = new Set(state.transitionConfig.states.map((item) => item.code)); const results = new Set(state.transitionConfig.results.map((item) => item.code)); const tags = new Set((state.transitionConfig.leadTags || []).map((item) => item.code)); const qualities = new Set((state.transitionConfig.qualityOptions || []).map((item) => item.code)); const taskRules = new Set(state.taskRules.map((item) => item.id)); const combinations = new Set(); const errors = [];
  state.transitionConfig.states.forEach((item) => { if (item.parent && !states.has(item.parent)) errors.push(`${item.name} 的父节点不存在`); });
  const progressFields = new Set((state.transitionConfig.progressFields || []).map((item) => item.code));
  (state.transitionConfig.progressFields || []).forEach((field) => { if (field.dependsOn && !progressFields.has(field.dependsOn.field)) errors.push(`推进字段 ${field.name} 的出现条件引用了不存在的字段`); (field.resultCodes || []).forEach((code) => { if (!results.has(code)) errors.push(`推进字段 ${field.name} 引用了不存在的跟进结果`); }); (field.stateCodes || []).forEach((code) => { if (!states.has(code)) errors.push(`推进字段 ${field.name} 引用了不存在的状态`); }); [...(field.taskRuleIds || []), ...Object.values(field.taskRulesByValue || {}).flat()].forEach((id) => { if (!taskRules.has(id)) errors.push(`推进字段 ${field.name} 引用了不存在的任务规则`); }); });
  state.transitionConfig.flows.forEach((flow) => { if (!states.has(flow.current) || !states.has(flow.next)) errors.push(`规则 ${flow.id} 引用了不存在的节点`); if (!results.has(flow.result)) errors.push(`规则 ${flow.id} 引用了不存在的跟进结果`); if (!qualities.has(flow.qualityUpdate)) errors.push(`规则 ${flow.id} 未配置有效性更新`); if (flow.task && !taskRules.has(flow.taskRuleId)) errors.push(`规则 ${flow.id} 未绑定有效的任务规则`); (flow.setTags || []).forEach((tag) => { if (!tags.has(tag)) errors.push(`规则 ${flow.id} 引用了不存在的线索标签`); }); const key = `${flow.current}:${flow.result}`; if (combinations.has(key)) errors.push(`${stateName(flow.current)} + ${resultName(flow.result)} 存在重复规则`); combinations.add(key); });
  return errors;
}

qsa(".nav-item").forEach((button) => button.addEventListener("click", () => openView(button.dataset.view)));
$("accountSwitcher").addEventListener("change", (event) => { currentRole = event.target.value; try { localStorage.setItem(accountSessionKey, currentRole); } catch (error) {} renderAccountSession(); openView("dashboard"); toast(currentRole === "super_admin" ? "已切换为超级管理员" : "已切换为 AutoCava销售；配置页面无权限"); });
qsa("[data-go]").forEach((button) => button.addEventListener("click", () => openView(button.dataset.go)));
$("menuButton").addEventListener("click", () => document.querySelector(".admin-sidebar").classList.toggle("open"));
["leadSearch", "leadStatusFilter", "leadAssigneeFilter"].forEach((id) => $(id).addEventListener(id === "leadSearch" ? "input" : "change", renderLeads));
$("resetLeadFilters").addEventListener("click", () => { $("leadSearch").value = ""; $("leadStatusFilter").value = ""; $("leadAssigneeFilter").value = ""; renderLeads(); });
$("showAccountForm").addEventListener("click", () => { $("accountForm").hidden = false; $("accountId").focus(); });
$("showTaskForm").addEventListener("click", () => { $("taskForm").hidden = false; $("taskType").focus(); });
qsa(".cancel-inline").forEach((button) => button.addEventListener("click", () => { button.closest("form").hidden = true; button.closest("form").reset(); }));
$("accountForm").addEventListener("submit", (event) => { event.preventDefault(); const id = $("accountId").value.trim(); if (state.accounts.some((account) => account.id === id)) return toast("账号ID已存在，请使用新的ID"); const role = $("accountRole").value; state.accounts.unshift({ id, username: $("accountName").value.trim(), role, dataScope: role === "super_admin" ? "平台全部普通线索" : "本人负责线索", status: "启用", lastLogin: "尚未登录" }); persist(); renderAccounts(); event.target.reset(); event.target.hidden = true; toast("AutoCava账号已创建"); });
$("accountRows").addEventListener("change", (event) => { const index = Number(event.target.dataset.index); if (event.target.classList.contains("account-role")) { state.accounts[index].role = event.target.value; state.accounts[index].dataScope = event.target.value === "super_admin" ? "平台全部普通线索" : "本人负责线索"; } if (event.target.classList.contains("account-status")) state.accounts[index].status = event.target.value; persist(); renderAccounts(); toast("账号配置已更新"); });
$("savePermissions").addEventListener("click", () => { state.permissions = {}; qsa(".permission-list input:checked").forEach((input) => { if (!state.permissions[input.dataset.role]) state.permissions[input.dataset.role] = []; state.permissions[input.dataset.role].push(input.value); }); persist(); toast("角色权限已保存"); });
$("taskForm").addEventListener("submit", (event) => { event.preventDefault(); const type = $("taskType").value.trim(); state.taskRules.push({ id: `RULE-${Date.now()}`, group: type.includes("首次联系") ? "FIRST_CONTACT" : "FOLLOW_UP", type, trigger: $("taskTriggerInput").value.trim(), deadline: $("taskDeadline").value.trim(), assignee: "原销售", enabled: true }); renderTaskRules(); event.target.reset(); event.target.hidden = true; toast("任务规则已添加，保存后生效"); });
$("taskRuleList").addEventListener("input", (event) => { const index = Number(event.target.dataset.taskIndex); if (Number.isNaN(index)) return; state.taskRules[index][event.target.dataset.field] = event.target.type === "checkbox" ? event.target.checked : event.target.value; if (event.target.dataset.field === "type") state.taskRules[index].group = event.target.value.includes("首次联系") ? "FIRST_CONTACT" : "FOLLOW_UP"; $("taskSaveHint").textContent = "有未保存的任务配置"; });
$("saveTaskRules").addEventListener("click", () => { persist(); $("taskSaveHint").textContent = "配置已保存，将应用到新生成的任务"; toast("任务配置已保存"); });

qsa(".config-tab").forEach((button) => button.addEventListener("click", () => switchConfigTab(button.dataset.configTab)));
$("showStateForm").addEventListener("click", () => openTransitionModal("state"));
$("showResultForm").addEventListener("click", () => openTransitionModal("result"));
$("showStrategyForm").addEventListener("click", () => openTransitionModal("flow"));
$("strategyStateFilter").addEventListener("change", renderStrategyRows);
$("stateTree").addEventListener("click", (event) => { const target = event.target.closest("[data-edit-state]"); if (target) openTransitionModal("state", target.dataset.editState); });
$("stateRows").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit-state]"); const remove = event.target.closest("[data-delete-state]"); if (edit) openTransitionModal("state", edit.dataset.editState); if (remove) deleteState(remove.dataset.deleteState); });
$("resultRows").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit-result]"); const remove = event.target.closest("[data-delete-result]"); if (edit) openTransitionModal("result", edit.dataset.editResult); if (remove) deleteResult(remove.dataset.deleteResult); });
$("strategyRows").addEventListener("click", (event) => { const edit = event.target.closest("[data-edit-flow]"); const remove = event.target.closest("[data-delete-flow]"); if (edit) openTransitionModal("flow", edit.dataset.editFlow); if (remove) deleteFlow(remove.dataset.deleteFlow); });
$("flowBoard").addEventListener("click", (event) => { const target = event.target.closest("[data-flow-state]"); if (target) showFlowDetail(target.dataset.flowState); });
$("flowBoard").addEventListener("keydown", (event) => { const target = event.target.closest("[data-flow-state]"); if (target && ["Enter", " "].includes(event.key)) { event.preventDefault(); showFlowDetail(target.dataset.flowState); } });
$("transitionModalForm").addEventListener("submit", (event) => { event.preventDefault(); if (modalMode === "state") saveStateFromModal(); else if (modalMode === "result") saveResultFromModal(); else saveFlowFromModal(); });
[$("closeTransitionModal"), $("cancelTransitionModal")].forEach((button) => button.addEventListener("click", closeTransitionModal));
$("transitionModal").addEventListener("click", (event) => { if (event.target === $("transitionModal")) closeTransitionModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !$("transitionModal").hidden) closeTransitionModal(); });
$("saveTransitions").addEventListener("click", () => { const errors = validateTransitions(); if (errors.length) return toast(`配置未保存：${errors[0]}`); const version = Number(state.transitionConfig.brand.version.replace(/[^0-9.]/g, "")) || 1; state.transitionConfig.brand.version = `V${(version + 0.1).toFixed(1)}`; state.transitionConfig.brand.status = "已保存"; state.transitionConfig.brand.updatedAt = new Date().toLocaleString("zh-CN", { hour12: false }); persist(); renderTransitions(); $("transitionSaveHint").textContent = `配置已保存 · ${state.transitionConfig.brand.version} · ${state.transitionConfig.brand.updatedAt}`; toast("线索流转配置已保存"); });
$("copyTransitionConfig").addEventListener("click", async () => { try { await navigator.clipboard.writeText(JSON.stringify(state.transitionConfig, null, 2)); toast("配置已复制"); } catch (error) { toast("浏览器未允许复制，请手动选择配置内容"); } });
$("exportTransitionConfig").addEventListener("click", () => { const blob = new Blob([JSON.stringify(state.transitionConfig, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `autocava-lead-transition-${state.transitionConfig.brand.version}.json`; link.click(); URL.revokeObjectURL(link.href); });

$("openImportButton").addEventListener("click", openImportModal);
$("importEntryType").addEventListener("change", syncImportFields);
$("importForm").addEventListener("submit", submitImport);
[$("closeImport"), $("cancelImport")].forEach((button) => button.addEventListener("click", () => { $("importModal").hidden = true; }));
renderAccountSession(); buildLeadFilters(); renderDashboard(); renderAccounts(); renderTaskRules(); renderTransitions(); openView("dashboard"); syncImportFields();
