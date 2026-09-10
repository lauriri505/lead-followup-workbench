const storageKey = "autocava_admin_demo_config_v1";
const sourceData = window.AUTOCAVA_ADMIN_DATA;
const copy = (value) => JSON.parse(JSON.stringify(value));
let state = (() => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (!saved) return copy(sourceData);
    const cleaningOverrides = saved.cleaningOverrides || {};
    const sourceIds = new Set(sourceData.leads.map((lead) => lead.id));
    const importedLeads = (saved.importedLeads || []).filter((lead) => !sourceIds.has(lead.id));
    const leads = [...copy(importedLeads), ...copy(sourceData.leads)].map((lead) => {
      const override = cleaningOverrides[lead.id] || {};
      const cleaningData = {
        brand: override.brand ?? lead.brand,
        dealer: override.dealer ?? lead.dealer,
        address: override.address ?? lead.address,
        region: override.region ?? lead.region,
        baicDealerId: override.baicDealerId ?? lead.baicDealerId,
        baicSalesId: override.baicSalesId ?? lead.baicSalesId,
        cleaningStatus: override.cleaningStatus ?? lead.cleaningStatus,
        cleaningResult: override.cleaningResult ?? lead.cleaningResult,
        cleaningOperator: override.cleaningOperator ?? lead.cleaningOperator,
        cleaningTime: override.cleaningTime ?? lead.cleaningTime,
        cleaningNote: override.cleaningNote ?? lead.cleaningNote,
        cleaningHistory: override.cleaningHistory ?? lead.cleaningHistory,
        cleaningActionApplied: Boolean(override.cleaningActionApplied)
      };
      const taskData = override.cleaningActionApplied ? { assignee: override.assignee, task: override.task, taskStatus: override.taskStatus, status: override.status, subStatus: override.subStatus, quality: override.quality } : {};
      return { ...lead, ...cleaningData, ...taskData };
    });
    return { ...copy(sourceData), ...saved, leads };
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
if (!state.permissions.super_admin) state.permissions.super_admin = copy(sourceData.permissions.super_admin || []);
if (!state.permissions.super_admin.includes("清洗和分配线索")) state.permissions.super_admin.push("清洗和分配线索");

const $ = (id) => document.getElementById(id);
const qsa = (selector) => Array.from(document.querySelectorAll(selector));
const esc = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const roleLabels = { super_admin: "超级管理员", sales: "AutoCava销售" };
const permissionOptions = ["查看平台全部普通线索", "查看本人负责线索", "清洗和分配线索", "配置账号与角色", "配置任务规则", "配置线索流转", "查看操作记录", "允许接收导入线索", "处理销售任务", "提交跟进结果", "编辑用户当前信息", "添加跟踪记事"];
const viewNames = { dashboard: "后台总览", leads: "线索数据", baicLeads: "线索数据（北汽）", accounts: "账号与角色", tasks: "任务配置", nodes: "线索流转配置" };
const groupLabels = { entry: "系统入口", not_followed: "未跟进", followed: "跟进中", dormant: "暂存", overdue: "过期未跟进", success: "确认金融购车", lost: "战败" };
const mainStatusGroups = Object.fromEntries(Object.entries(groupLabels).map(([group, label]) => [label, group]));
const categoryLabels = { contact: "联系", unreachable: "未接通", callback: "约定回访", dormant: "暂存", lost: "终止" };
const taskLabels = { FIRST_CONTACT: "首次联系", FOLLOW_UP: "普通回访" };
const accountSessionKey = "autocava_admin_current_account";
let currentRole = (() => { try { return localStorage.getItem(accountSessionKey) || "super_admin"; } catch (error) { return "super_admin"; } })();
const protectedViews = new Set(["accounts", "tasks", "nodes"]);
const canAccess = (view) => currentRole === "super_admin" || !protectedViews.has(view);

function persist() {
  const sourceLeadIds = new Set(sourceData.leads.map((lead) => lead.id));
  const importedLeads = state.leads.filter((lead) => !sourceLeadIds.has(lead.id));
  const cleaningOverrides = Object.fromEntries(state.leads.map((lead) => [lead.id, {
    brand: lead.brand,
    dealer: lead.dealer,
    address: lead.address,
    region: lead.region,
    baicDealerId: lead.baicDealerId,
    baicSalesId: lead.baicSalesId,
    cleaningStatus: lead.cleaningStatus,
    cleaningResult: lead.cleaningResult,
    cleaningOperator: lead.cleaningOperator,
    cleaningTime: lead.cleaningTime,
    cleaningNote: lead.cleaningNote,
    cleaningHistory: lead.cleaningHistory || [],
    cleaningActionApplied: Boolean(lead.cleaningActionApplied),
    ...(lead.cleaningActionApplied ? { assignee: lead.assignee, task: lead.task, taskStatus: lead.taskStatus, status: lead.status, subStatus: lead.subStatus, quality: lead.quality } : {})
  }]));
  localStorage.setItem(storageKey, JSON.stringify({ accounts: state.accounts, permissions: state.permissions, taskRules: state.taskRules, transitionConfig: state.transitionConfig, importedLeads, cleaningOverrides }));
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
  if (!locked) ({ leads: renderLeads, baicLeads: renderBaicLeads, accounts: renderAccounts, tasks: renderTaskRules, nodes: renderTransitions })[view]?.();
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
const canCleanLeads = () => (state.permissions[currentRole] || []).includes("清洗和分配线索");
function statusClass(status) { return status === "战败" ? "lost" : ["暂存", "过期未跟进"].includes(status) ? "dormant" : ["跟进中", "确认金融购车"].includes(status) ? "won" : ""; }
function isEnteredFollowup(lead) { return Boolean(lead.cleaningActionApplied) || (lead.cleaningStatus === "清洗通过" && lead.assignee && lead.assignee !== "—"); }
function processingStatus(lead) {
  if (isEnteredFollowup(lead)) return "已下发";
  if (lead.cleaningStatus === "待补充") return "待补充资料";
  if (lead.cleaningStatus === "清洗不通过") return "线索无效";
  return "待清洗";
}
function leadRow(lead) {
  const enteredFollowup = isEnteredFollowup(lead);
  const processStatus = processingStatus(lead);
  const leadStatusText = enteredFollowup && lead.status ? `${lead.status}${lead.subStatus && lead.subStatus !== "—" ? ` · ${lead.subStatus}` : ""}` : "未进入销售跟进";
  const taskText = enteredFollowup && lead.task && lead.task !== "—"
    ? `${lead.task} · ${lead.taskStatus}`
    : enteredFollowup && lead.taskStatus === "已结束"
      ? "已结束"
      : "未生成";
  const action = String(lead.brand || "").toUpperCase() === "BAIC" ? `<button class="cleaning-action" data-clean-lead="${esc(lead.id)}" type="button">详情</button>` : `<span class="muted-cell">—</span>`;
  return `<tr><td><strong>${esc(lead.id)}</strong><small class="table-code">${esc(lead.type || lead.leadType)} · ${esc(lead.entryType || "自动")}</small></td><td class="lead-person"><strong>${esc(lead.name)}</strong><small>${esc(lead.phone)}</small></td><td><strong>${esc(lead.brand || "—")}</strong><small class="table-code">${esc(lead.series || "—")} · ${esc(lead.model || "—")}</small></td><td>${esc(lead.channel || "—")}<small class="table-code">${esc(lead.source || "—")}</small></td><td>${esc(lead.createdAt || "—")}</td><td><span class="processing-chip ${processStatus === "已下发" ? "distributed" : processStatus === "线索无效" ? "invalid" : processStatus === "待补充资料" ? "supplement" : "pending"}">${esc(processStatus)}</span></td><td><span class="table-status ${enteredFollowup ? statusClass(lead.status) : "pending-entry"}">${esc(leadStatusText)}</span></td><td>${esc(enteredFollowup ? lead.assignee || "—" : "—")}</td><td><span class="task-state ${enteredFollowup && lead.taskStatus === "处理中" ? "processing" : ""}">${esc(taskText)}</span></td><td>${action}</td></tr>`;
}
function compactLeadRow(lead) {
  const enteredFollowup = isEnteredFollowup(lead);
  const statusText = enteredFollowup && lead.status ? `${lead.status} · ${lead.subStatus}` : "未进入销售跟进";
  const taskText = enteredFollowup && lead.task && lead.task !== "—" ? `${lead.task} · ${lead.taskStatus}` : "未生成";
  return `<tr><td><strong>${esc(lead.id)}</strong></td><td class="lead-person"><strong>${esc(lead.name)}</strong><small>${esc(lead.phone)}</small></td><td>${esc(lead.source || lead.channel || "—")}</td><td>${esc(lead.brand)} ${esc(lead.series)} ${esc(lead.model)}</td><td><span class="table-status ${enteredFollowup ? statusClass(lead.status) : "pending-entry"}">${esc(statusText)}</span></td><td><span class="quality-chip ${(lead.quality || "UNKNOWN").toLowerCase()}">${esc(qualityLabels[lead.quality] || "待判定")}</span></td><td>${esc(enteredFollowup ? lead.assignee : "—")}</td><td><span class="task-state ${enteredFollowup && lead.taskStatus === "处理中" ? "processing" : ""}">${esc(taskText)}</span></td><td>${esc(lead.createdAt)}</td></tr>`;
}
function renderOverviewFilters() { CohortDashboard.init(state, renderDashboard); }
function renderDashboard() { CohortDashboard.render(state, currentRole); }
let leadPage = 1;
const leadPageSize = 30;
const leadSource = (lead) => lead.channel || lead.source || "—";
function buildLeadFilters() {
  const select = $("leadBrandFilter");
  const current = select.value;
  const brands = [...new Set(state.leads.map((lead) => lead.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  select.innerHTML = `<option value="">全部品牌</option>${brands.map((brand) => `<option value="${esc(brand)}">${esc(brand)}</option>`).join("")}`;
  select.value = brands.includes(current) ? current : "";
}
function renderLeadPagination(total) {
  const pages = Math.max(1, Math.ceil(total / leadPageSize));
  leadPage = Math.min(leadPage, pages);
  $("leadPagination").innerHTML = total ? `<span>第 ${leadPage} / ${pages} 页，共 ${total} 条</span><div><button class="page-button" data-page="${Math.max(1, leadPage - 1)}" ${leadPage === 1 ? "disabled" : ""}>上一页</button><button class="page-button" data-page="${Math.min(pages, leadPage + 1)}" ${leadPage === pages ? "disabled" : ""}>下一页</button></div>` : "";
}
function renderLeads() {
  const id = $("leadIdFilter").value.trim().toLowerCase();
  const brand = $("leadBrandFilter").value;
  const type = $("leadTypeFilter").value;
  const phone = $("leadPhoneFilter").value.trim().toLowerCase();
  const source = $("leadSourceFilter").value;
  const entryType = $("leadEntryTypeFilter").value;
  const start = $("leadCreatedStart").value;
  const end = $("leadCreatedEnd").value;
  const filtered = state.leads.filter((lead) => (!id || String(lead.id).toLowerCase().includes(id)) && (!brand || lead.brand === brand) && (!type || lead.type === type) && (!phone || String(lead.phone).toLowerCase().includes(phone)) && (!source || leadSource(lead) === source) && (!entryType || (lead.entryType || "自动") === entryType) && (!start || String(lead.createdAt).slice(0, 10) >= start) && (!end || String(lead.createdAt).slice(0, 10) <= end)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  $("leadTotal").textContent = filtered.length;
  const startIndex = (leadPage - 1) * leadPageSize;
  $("leadRows").innerHTML = filtered.slice(startIndex, startIndex + leadPageSize).map(leadRow).join("");
  $("leadEmpty").hidden = filtered.length > 0;
  renderLeadPagination(filtered.length);
}

let baicLeadPage = 1;
const baicLeadPageSize = 30;
const baicLeadStorageKey = "autocava_baic_leads_demo_v1";
let baicActiveTab = "autocava";
let baicLeads = (() => { try { return [...window.BAIC_LEADS_DEMO, ...(JSON.parse(localStorage.getItem(baicLeadStorageKey)) || [])]; } catch (error) { return [...window.BAIC_LEADS_DEMO]; } })();
function persistBaicLeads() { localStorage.setItem(baicLeadStorageKey, JSON.stringify(baicLeads.filter((lead) => lead.imported))); }
function renderBaicLeadPagination(total) {
  const pages = Math.max(1, Math.ceil(total / baicLeadPageSize));
  baicLeadPage = Math.min(baicLeadPage, pages);
  $("baicLeadPagination").innerHTML = total ? `<span>第 ${baicLeadPage} / ${pages} 页，共 ${total} 条</span><div><button class="page-button" data-baic-page="${Math.max(1, baicLeadPage - 1)}" ${baicLeadPage === 1 ? "disabled" : ""}>上一页</button><button class="page-button" data-baic-page="${Math.min(pages, baicLeadPage + 1)}" ${baicLeadPage === pages ? "disabled" : ""}>下一页</button></div>` : "";
}
function renderBaicLeads() {
  const id = $("baicLeadIdFilter").value.trim().toLowerCase(); const name = $("baicLeadNameFilter").value.trim().toLowerCase(); const phone = $("baicLeadPhoneFilter").value.trim().toLowerCase();
  const type = $("baicLeadTypeFilter").value; const source = $("baicLeadSourceFilter").value;
  const start = $("baicLeadCreatedStart").value; const end = $("baicLeadCreatedEnd").value;
  const filtered = baicLeads.filter((lead) => (baicActiveTab === "autocava" ? lead.source === "AutoCava" : lead.source !== "AutoCava") && (!id || lead.id.toLowerCase().includes(id)) && (!name || lead.name.toLowerCase().includes(name)) && (!phone || lead.phone.toLowerCase().includes(phone)) && (!type || lead.type === type) && (!source || lead.source === source) && (!start || lead.createdAt.slice(0, 10) >= start) && (!end || lead.createdAt.slice(0, 10) <= end));
  $("baicLeadTotal").textContent = filtered.length;
  const startIndex = (baicLeadPage - 1) * baicLeadPageSize;
  $("baicLeadRows").innerHTML = filtered.slice(startIndex, startIndex + baicLeadPageSize).map((lead) => `<tr><td><strong>${esc(lead.id)}</strong></td><td>${esc(lead.name)}</td><td>${esc(lead.phone)}</td><td>${esc(lead.series)}</td><td>${esc(lead.model)}</td><td>${esc(lead.source)}</td><td><span class="table-status ${lead.status === "战败" ? "lost" : lead.status === "成交" ? "won" : lead.status === "暂存" ? "dormant" : ""}">${esc(lead.status)}</span></td><td>${esc(lead.sales)}</td><td>${esc(lead.dealer)}</td><td>${esc(lead.createdAt)}</td><td><button class="text-action" type="button" data-baic-lead="${esc(lead.id)}">查看</button></td></tr>`).join("");
  $("baicLeadEmpty").hidden = filtered.length > 0; renderBaicLeadPagination(filtered.length);
}
function downloadBaicImportTemplate() {
  const headers = ["姓名*", "手机号*", "线索类型*（试驾/买车）", "城市*"];
  const example = ["Jorge Navarro", "5510001000", "买车", "Ciudad de México"];
  const table = `<table><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr><tr>${example.map((item) => `<td>${item}</td>`).join("")}</tr></table>`;
  const blob = new Blob([`<html><meta charset="UTF-8"><style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px;white-space:nowrap}th{background:#eaf1fb}</style>${table}</html>`], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "北汽线索导入模板.xls"; link.click(); URL.revokeObjectURL(link.href); toast("北汽线索导入模板已下载");
}
function addBaicImportedLead(name, phone, type, city) {
  const lead = { id: `BAIC-IMPORT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, name, phone, type, series: "待补充", model: "待补充", source: "官网", status: "待跟进", sales: "待分配", dealer: "待分配", city, createdAt: new Date().toISOString().slice(0, 16).replace("T", " "), imported: true };
  baicLeads.unshift(lead); persistBaicLeads(); baicLeadPage = 1; renderBaicLeads(); return lead;
}
function openBaicImportModal() { $("baicImportModal").hidden = false; $("baicImportName").focus(); }
function closeBaicImportModal() { $("baicImportModal").hidden = true; $("baicImportForm").reset(); $("baicImportFileName").textContent = "未选择文件"; }
function submitBaicImport(event) { event.preventDefault(); addBaicImportedLead($("baicImportName").value.trim(), $("baicImportPhone").value.trim(), $("baicImportType").value, $("baicImportCity").value.trim()); closeBaicImportModal(); toast("北汽线索已导入“其他来源”页签"); }
function importBaicUploadedFile(event) {
  const file = event.target.files[0]; if (!file) return; $("baicImportFileName").textContent = file.name;
  if (!/\.(csv|xls)$/i.test(file.name)) return toast("请使用 CSV 或下载的导入模板");
  const reader = new FileReader(); reader.onload = () => { const rows = parseImportFile(reader.result); if (rows.length < 2) return toast("文件中没有可导入的线索数据"); const headers = rows[0].map((item) => item.replace(/\*/g, "").split("（")[0]); const indexOf = (name) => headers.findIndex((item) => item === name); const nameIndex = indexOf("姓名"); const phoneIndex = indexOf("手机号"); const typeIndex = indexOf("线索类型"); const cityIndex = indexOf("城市"); if ([nameIndex, phoneIndex, typeIndex, cityIndex].some((index) => index < 0)) return toast("模板缺少必填字段：姓名、手机号、线索类型、城市"); let count = 0; rows.slice(1).forEach((row) => { const type = row[typeIndex]; if (row[nameIndex] && row[phoneIndex] && ["买车", "试驾"].includes(type) && row[cityIndex]) { addBaicImportedLead(row[nameIndex], row[phoneIndex], type, row[cityIndex]); count += 1; } }); if (count) { closeBaicImportModal(); toast(`已导入 ${count} 条北汽线索，进入“其他来源”页签`); } else toast("没有符合必填字段要求的数据"); }; reader.readAsText(file);
}

let currentCleaningLeadId = null;
const baicDealers = () => state.baicDealers || [];
function updateDealerPreview() {
  const dealer = baicDealers().find((item) => item.id === $("cleaningDealer").value);
  $("dealerPreview").innerHTML = dealer
    ? `<strong>${esc(dealer.name)}</strong><span>${esc(dealer.region)} · ${esc(dealer.address)}</span><span>将分配给：${esc(dealer.salesId)} ${esc(dealer.salesName)}</span>`
    : "请选择经销商";
}
function syncCleaningAction() {
  const action = $("cleaningAction").value;
  $("dealerAssignment").hidden = action !== "distribute";
  $("supplementFields").hidden = action !== "supplement";
  $("invalidFields").hidden = action !== "invalid";
  $("cleaningDealer").required = action === "distribute";
  $("cleaningNote").required = action === "supplement";
  $("cleaningInvalidReason").required = action === "invalid";
  const labels = { pending: "保存为待清洗", supplement: "保存并等待补充", invalid: "确认线索无效", distribute: "保存信息并下发线索" };
  $("saveCleaningAction").textContent = labels[action];
}
function renderCleaningHistory(lead) {
  const history = lead.cleaningHistory || [];
  $("cleaningHistory").innerHTML = history.length ? history.map((record) => `<li><div><strong>${esc(record.dealer || record.status || "已处理")}</strong><span>${esc(record.sales || record.result || "")}</span></div><p>${esc(record.note || "完成线索处理")}</p><small>${esc(record.time)} · ${esc(record.operator)}</small></li>`).join("") : `<li class="empty-history">尚未产生处理记录</li>`;
}
function openCleaningModal(leadId) {
  const lead = state.leads.find((item) => item.id === leadId);
  if (!lead || String(lead.brand || "").toUpperCase() !== "BAIC") return;
  currentCleaningLeadId = leadId;
  const detailFields = [
    ["线索ID", lead.id], ["姓名", lead.name], ["手机号", lead.phone], ["线索类型", lead.type || lead.leadType],
    ["品牌", lead.brand], ["车系", lead.series], ["车型", lead.model], ["线索来源", lead.source || "—"],
    ["线索渠道", lead.channel || "—"], ["车辆价格", lead.price || "—"], ["首付", lead.downPayment || "—"],
    ["年利率", lead.rate || "—"], ["贷款期数", lead.term || "—"], ["创建时间", lead.createdAt || "—"],
    ["当前经销商", lead.dealer || "未分配"], ["地区 / 地址", [lead.region, lead.address].filter(Boolean).join(" · ") || "—"]
  ];
  $("cleaningLeadSummary").innerHTML = detailFields.map(([label, value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join("");
  $("cleaningDealer").innerHTML = `<option value="">请选择经销商</option>${baicDealers().map((dealer) => `<option value="${esc(dealer.id)}">${esc(dealer.name)}</option>`).join("")}`;
  $("cleaningDealer").value = lead.baicDealerId || "";
  $("cleaningAction").value = isEnteredFollowup(lead) ? "distribute" : lead.cleaningStatus === "待补充" ? "supplement" : lead.cleaningStatus === "清洗不通过" ? "invalid" : "pending";
  $("cleaningNote").value = lead.cleaningStatus === "待补充" ? lead.cleaningNote || "" : "";
  $("cleaningInvalidReason").value = lead.cleaningStatus === "清洗不通过" && ["号码错误", "重复线索", "非目标品牌", "虚假或测试数据", "其他"].includes(lead.cleaningResult) ? lead.cleaningResult : "";
  $("cleaningInvalidNote").value = lead.cleaningStatus === "清洗不通过" ? lead.cleaningNote || "" : "";
  $("cleaningAction").disabled = !canCleanLeads();
  $("cleaningDealer").disabled = !canCleanLeads();
  $("cleaningNote").disabled = !canCleanLeads();
  $("cleaningInvalidReason").disabled = !canCleanLeads();
  $("cleaningInvalidNote").disabled = !canCleanLeads();
  $("cleaningForm").querySelector('button[type="submit"]').hidden = !canCleanLeads();
  renderCleaningHistory(lead);
  updateDealerPreview();
  syncCleaningAction();
  $("cleaningModal").hidden = false;
  document.body.classList.add("modal-open");
}
function closeCleaningModal() {
  $("cleaningModal").hidden = true;
  document.body.classList.remove("modal-open");
  currentCleaningLeadId = null;
}
function saveCleaningResult(event) {
  event.preventDefault();
  if (!canCleanLeads()) return toast("当前账号没有清洗和分配线索的权限");
  const lead = state.leads.find((item) => item.id === currentCleaningLeadId);
  if (!lead) return closeCleaningModal();
  const action = $("cleaningAction").value;
  const dealer = action === "distribute" ? baicDealers().find((item) => item.id === $("cleaningDealer").value) : null;
  if (action === "distribute" && !dealer) return toast("请选择北汽经销商");
  const supplementNote = $("cleaningNote").value.trim();
  const invalidReason = $("cleaningInvalidReason").value;
  const invalidNote = $("cleaningInvalidNote").value.trim();
  if (action === "supplement" && !supplementNote) return toast("请填写需要补充的资料");
  if (action === "invalid" && !invalidReason) return toast("请选择线索无效原因");
  if (action === "invalid" && invalidReason === "其他" && !invalidNote) return toast("选择其他原因时，请填写补充说明");
  const account = state.accounts.find((item) => item.role === currentRole) || state.accounts[0];
  const operator = `${account.id} ${account.username}`;
  const now = new Date().toLocaleString("zh-CN", { hour12: false });
  lead.cleaningOperator = operator;
  lead.cleaningTime = now;
  if (action === "distribute") {
    lead.dealer = dealer.name;
    lead.region = dealer.region;
    lead.city = dealer.region;
    lead.address = dealer.address;
    lead.baicDealerId = dealer.id;
    lead.baicSalesId = dealer.salesId;
    lead.cleaningStatus = "清洗通过";
    lead.cleaningResult = "有效";
    lead.cleaningNote = `已分配至 ${dealer.name}`;
    lead.cleaningActionApplied = true;
    lead.cleaningHistory = [{ status: "已下发", dealer: dealer.name, sales: `${dealer.salesId} ${dealer.salesName}`, note: "确认有效并分配给北汽销售", operator, time: now }, ...(lead.cleaningHistory || [])];
    lead.assignee = `${dealer.salesId} ${dealer.salesName}`;
    lead.status = "未跟进";
    lead.subStatus = "正常等待跟进";
    lead.quality = "UNKNOWN";
    lead.task = "首次联系";
    lead.taskStatus = "待处理";
  } else {
    const status = action === "supplement" ? "待补充" : action === "invalid" ? "清洗不通过" : "待清洗";
    const result = action === "supplement" ? "信息不完整" : action === "invalid" ? invalidReason : "";
    const note = action === "supplement" ? supplementNote : action === "invalid" ? invalidNote : "保留在线索清洗池";
    lead.cleaningStatus = status;
    lead.cleaningResult = result;
    lead.cleaningNote = note;
    lead.cleaningActionApplied = false;
    lead.cleaningHistory = [{ status: processingStatus({ ...lead, cleaningStatus: status, cleaningActionApplied: false, assignee: "—" }), result, note, operator, time: now }, ...(lead.cleaningHistory || [])];
    lead.dealer = "";
    lead.address = "";
    lead.baicDealerId = "";
    lead.baicSalesId = "";
    lead.assignee = "—";
    lead.status = "";
    lead.subStatus = "";
    lead.quality = action === "invalid" ? "INVALID" : "UNKNOWN";
    lead.task = "—";
    lead.taskStatus = "未生成";
  }
  persist();
  buildLeadFilters();
  renderLeads();
  renderDashboard();
  closeCleaningModal();
  toast(action === "distribute" ? `线索已分配给 ${dealer.salesId} ${dealer.salesName}` : action === "supplement" ? "线索已转为待补充资料，不生成销售任务" : action === "invalid" ? "线索已标记无效，不下发且不计入战败" : "线索保持待清洗，不生成销售任务");
}
function syncImportFields() {
  const manual = $("importEntryType").value === "人工";
  $("importChannel").disabled = manual;
  $("importSource").disabled = manual;
  if (manual) { $("importChannel").value = ""; $("importSource").value = ""; }
}
function openImportModal() {
  if (!(state.permissions[currentRole] || []).includes("允许接收导入线索")) return toast("当前账号没有导入线索权限");
  if (!$('importCreatedAt').value) $('importCreatedAt').value = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString().slice(0, 16);
  $("importModal").hidden = false; $("importName").focus();
}
function submitImport(event) {
  event.preventDefault();
  const manual = $("importEntryType").value === "人工";
  const prefix = state.tenant?.brand === "BAIC" ? "BAIC-LD" : "AC-LD";
  const lead = { id: `${prefix}-${Date.now()}`, name: $("importName").value.trim(), phone: $("importPhone").value.trim(), city: $("importCity").value.trim(), region: $("importCity").value.trim(), brand: $("importBrand").value.trim(), series: $("importSeries").value.trim(), model: $("importModel").value.trim(), type: $("importType").value, leadType: $("importType").value, entryType: $("importEntryType").value, channel: manual ? "" : $("importChannel").value, source: manual ? "" : $("importSource").value, createdAt: $("importCreatedAt").value.replace("T", " "), status: "", subStatus: "", quality: "UNKNOWN", assignee: "—", task: "—", taskStatus: "未生成", cleaningStatus: "待清洗", cleaningResult: "", cleaningOperator: "—", cleaningTime: "—", cleaningNote: "", cleaningHistory: [] };
  state.leads.unshift(lead); persist(); buildLeadFilters(); renderLeads(); renderDashboard(); $("importModal").hidden = true; event.target.reset(); syncImportFields(); toast("线索已导入，等待清洗和分配");
}
function downloadImportTemplate() {
  const headers = ["线索类型", "录入类型", "姓名", "手机号", "城市", "品牌", "车系", "车型", "创建时间（UTC-6）", "线索来源", "线索渠道"];
  const example = ["金融", "系统", "Sofía Ramírez", "5612345454", "Ciudad de México", "NISSAN", "X-TRAIL", "Advance 2 Row", "2026-09-04 10:30", "车型详情页", "Meta"];
  const table = `<table><tr>${headers.map((item) => `<th>${item}</th>`).join("")}</tr><tr>${example.map((item) => `<td>${item}</td>`).join("")}</tr><tr>${headers.map((item) => `<td>${item === "录入类型" ? "人工" : ""}</td>`).join("")}</tr></table>`;
  const blob = new Blob([`<html><meta charset="UTF-8"><style>table{border-collapse:collapse}th,td{border:1px solid #999;padding:6px 10px;white-space:nowrap}th{background:#eaf1fb}</style>${table}</html>`], { type: "application/vnd.ms-excel;charset=utf-8" });
  const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = "线索导入模板.xls"; link.click(); URL.revokeObjectURL(link.href); toast("导入线索模板已下载");
}
function parseImportCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) { const char = text[i]; const next = text[i + 1]; if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; } else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; } else cell += char; }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); return rows;
}
function parseImportFile(text) {
  if (!/<table[\s>]/i.test(text)) return parseImportCsv(text);
  const documentFromFile = new DOMParser().parseFromString(text, "text/html");
  return Array.from(documentFromFile.querySelectorAll("tr")).map((row) => Array.from(row.children).map((cell) => cell.textContent.trim())).filter((row) => row.some(Boolean));
}
function importUploadedFile(event) {
  const file = event.target.files[0]; if (!file) return;
  $("importFileName").textContent = file.name;
  if (!/\.(csv|xls)$/i.test(file.name)) return toast("已选择文件；请使用 CSV 或下载的 Excel 模板上传");
  const reader = new FileReader(); reader.onload = () => {
    const rows = parseImportFile(reader.result); if (rows.length < 2) return toast("文件中没有可导入的线索数据");
    const headers = rows[0]; const index = Object.fromEntries(headers.map((header, i) => [header.replace(/\s/g, ""), i])); const get = (row, name) => row[index[name.replace(/\s/g, "")]] || "";
    const leads = rows.slice(1).filter((row) => row.length > 1 && get(row, "姓名")).map((row, offset) => { const manual = get(row, "录入类型") === "人工"; return { id: `LEAD-${Date.now()}-${offset + 1}`, type: get(row, "线索类型") || "金融", leadType: get(row, "线索类型") || "金融", entryType: get(row, "录入类型") || "系统", name: get(row, "姓名"), phone: get(row, "手机号"), city: get(row, "城市"), region: get(row, "城市"), brand: get(row, "品牌"), series: get(row, "车系"), model: get(row, "车型"), createdAt: get(row, "创建时间（UTC-6）") || new Date().toISOString().slice(0, 16).replace("T", " "), source: manual ? "" : get(row, "线索来源"), channel: manual ? "" : get(row, "线索渠道"), status: "", subStatus: "", quality: "UNKNOWN", assignee: "—", task: "—", taskStatus: "未生成", cleaningStatus: "待清洗", cleaningResult: "", cleaningOperator: "—", cleaningTime: "—", cleaningNote: "", cleaningHistory: [] }; });
    if (!leads.length) return toast("请检查模板中的姓名和字段表头"); state.leads.unshift(...leads); persist(); buildLeadFilters(); renderLeads(); renderDashboard(); $("importModal").hidden = true; toast(`已导入 ${leads.length} 条线索，等待清洗和分配`);
  }; reader.readAsText(file, "UTF-8");
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
$("accountSwitcher").addEventListener("change", (event) => { currentRole = event.target.value; try { localStorage.setItem(accountSessionKey, currentRole); } catch (error) {} renderAccountSession(); renderDashboard(); openView("dashboard"); toast(currentRole === "super_admin" ? "已切换为超级管理员" : "已切换为 AutoCava销售；团队效率数据不可见"); });
qsa("[data-go]").forEach((button) => button.addEventListener("click", () => openView(button.dataset.go)));
$("menuButton").addEventListener("click", () => document.querySelector(".admin-sidebar").classList.toggle("open"));
[$("overviewChannelFilter"), $("overviewDealerFilter")].forEach((select) => select.addEventListener("change", renderDashboard));
$("resetOverviewFilters").addEventListener("click", () => { $("overviewChannelFilter").value = ""; $("overviewDealerFilter").value = ""; renderDashboard(); });
["leadIdFilter", "leadPhoneFilter"].forEach((id) => $(id).addEventListener("input", () => { leadPage = 1; renderLeads(); }));
["leadBrandFilter", "leadTypeFilter", "leadSourceFilter", "leadEntryTypeFilter", "leadCreatedStart", "leadCreatedEnd"].forEach((id) => $(id).addEventListener("change", () => { leadPage = 1; renderLeads(); }));
$("resetLeadFilters").addEventListener("click", () => { ["leadIdFilter", "leadPhoneFilter", "leadBrandFilter", "leadTypeFilter", "leadSourceFilter", "leadEntryTypeFilter", "leadCreatedStart", "leadCreatedEnd"].forEach((id) => { $(id).value = ""; }); leadPage = 1; renderLeads(); });
$("leadPagination").addEventListener("click", (event) => { const button = event.target.closest("[data-page]"); if (!button || button.disabled) return; leadPage = Number(button.dataset.page); renderLeads(); });
$("leadRows").addEventListener("click", (event) => { const button = event.target.closest("[data-clean-lead]"); if (button) openCleaningModal(button.dataset.cleanLead); });
["baicLeadIdFilter", "baicLeadNameFilter", "baicLeadPhoneFilter"].forEach((id) => $(id).addEventListener("input", () => { baicLeadPage = 1; renderBaicLeads(); }));
[$("baicLeadTypeFilter"), $("baicLeadSourceFilter"), $("baicLeadCreatedStart"), $("baicLeadCreatedEnd")].forEach((input) => input.addEventListener("change", () => { baicLeadPage = 1; renderBaicLeads(); }));
$("resetBaicLeadFilters").addEventListener("click", () => { ["baicLeadIdFilter", "baicLeadNameFilter", "baicLeadPhoneFilter", "baicLeadTypeFilter", "baicLeadSourceFilter", "baicLeadCreatedStart", "baicLeadCreatedEnd"].forEach((id) => { $(id).value = ""; }); baicLeadPage = 1; renderBaicLeads(); });
$("baicLeadPagination").addEventListener("click", (event) => { const button = event.target.closest("[data-baic-page]"); if (!button || button.disabled) return; baicLeadPage = Number(button.dataset.baicPage); renderBaicLeads(); });
$("baicLeadRows").addEventListener("click", (event) => { const button = event.target.closest("[data-baic-lead]"); if (button) { const lead = baicLeads.find((item) => item.id === button.dataset.baicLead); toast(lead ? `${lead.id} · ${lead.name}` : "未找到线索"); } });
qsa("[data-baic-tab]").forEach((button) => button.addEventListener("click", () => { baicActiveTab = button.dataset.baicTab; qsa("[data-baic-tab]").forEach((item) => item.classList.toggle("active", item === button)); baicLeadPage = 1; renderBaicLeads(); }));
$("openBaicImportButton").addEventListener("click", openBaicImportModal);
$("downloadBaicImportTemplate").addEventListener("click", downloadBaicImportTemplate);
$("baicImportFile").addEventListener("change", importBaicUploadedFile);
$("baicImportForm").addEventListener("submit", submitBaicImport);
[$("closeBaicImport"), $("cancelBaicImport")].forEach((button) => button.addEventListener("click", closeBaicImportModal));
$("cleaningAction").addEventListener("change", syncCleaningAction);
$("cleaningDealer").addEventListener("change", updateDealerPreview);
$("cleaningForm").addEventListener("submit", saveCleaningResult);
[$("closeCleaning"), $("cancelCleaning")].forEach((button) => button.addEventListener("click", closeCleaningModal));
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
$("downloadImportTemplate").addEventListener("click", downloadImportTemplate);
$("importFile").addEventListener("change", importUploadedFile);
$("importEntryType").addEventListener("change", syncImportFields);
$("importForm").addEventListener("submit", submitImport);
[$("closeImport"), $("cancelImport")].forEach((button) => button.addEventListener("click", () => { $("importModal").hidden = true; }));
renderAccountSession(); buildLeadFilters(); renderOverviewFilters(); renderDashboard(); renderAccounts(); renderTaskRules(); renderTransitions(); openView("dashboard"); syncImportFields();
