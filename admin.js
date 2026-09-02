const adminData = window.CRM_DEMO_DATA;
const adminConfig = window.LEAD_FLOW_CONFIG.load();
const profileTable = window.CRM_CONFIG_TABLE?.leadProfiles || {};
// Tenant isolation: the BAIC administrator only receives BAIC-brand leads.
const adminLeads = adminData.leads.map((lead) => ({ ...lead, ...(profileTable[lead.id] || {}) })).filter((lead) => lead.brand === "BAIC");
const byId = (id) => document.getElementById(id);
const stateText = (lead) => { const state = adminConfig.states[lead.state] || {}; return (state.main || lead.state) + " · " + (lead.lostReason || state.sub || "—"); };
const esc = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[char]));

function renderMetrics() {
  byId("metricAll").textContent = adminLeads.length;
  byId("metricPending").textContent = adminLeads.filter((lead) => lead.task).length;
  byId("metricFollowing").textContent = adminLeads.filter((lead) => ["followup", "financeIntent"].includes(lead.state)).length;
  byId("metricLost").textContent = adminLeads.filter((lead) => lead.state === "lost").length;
}
function renderStateOptions() {
  const filter = byId("stateFilter");
  Object.entries(adminConfig.states).forEach(([code, state]) => { const option = document.createElement("option"); option.value = code; option.textContent = state.main + " · " + state.sub; filter.appendChild(option); });
}
function filteredLeads() {
  const query = byId("searchInput").value.trim().toLowerCase(); const state = byId("stateFilter").value; const brand = byId("brandFilter").value;
  return adminLeads.filter((lead) => (!query || [lead.id, lead.name, lead.phone].some((value) => String(value).toLowerCase().includes(query))) && (state === "all" || lead.state === state) && (brand === "all" || lead.brand === brand));
}
function renderRows() {
  const rows = byId("leadRows"); const list = filteredLeads(); byId("tableCount").textContent = list.length + " 条";
  rows.innerHTML = list.map((lead) => `<tr><td><button class="link-button" data-view="${esc(lead.id)}">${esc(lead.id)}</button></td><td><span class="state-chip state-${esc(lead.state)}">${esc(stateText(lead))}</span></td><td>${esc(lead.leadType)}</td><td class="strong-cell">${esc(lead.name)}</td><td>${esc(lead.phone)}</td><td>${esc(lead.region)}</td><td>${esc(lead.brand)}</td><td>${esc(lead.series)}</td><td>${esc(lead.model)}</td><td>${esc(lead.createdAt)}</td><td>${esc(lead.source)}</td><td><button class="link-button" data-view="${esc(lead.id)}">查看</button></td></tr>`).join("") || '<tr><td colspan="12" class="empty-cell">没有匹配的线索</td></tr>';
  rows.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => openDetail(button.dataset.view)));
}
function renderTasks() { byId("taskBoard").innerHTML = adminLeads.filter((lead) => lead.task).map((lead) => `<article><div><strong>${esc(lead.task.id)}</strong><span>${esc(lead.task.group)}</span></div><h3>${esc(lead.name)}</h3><p>${esc(lead.task.trigger)}</p><small>截止：${esc(lead.task.due)} · 处理中</small></article>`).join(""); }
function renderConfigSummary() { const enabled = Object.values(adminConfig.results).filter((result) => result.enabled !== false).length; byId("configSummary").innerHTML = `<div><span>配置版本</span><strong>${esc(adminConfig.version)}</strong></div><div><span>启用跟进结果</span><strong>${enabled} 项</strong></div><div><span>未接通上限</span><strong>${esc(adminConfig.policies.unreachableLimit)} 次</strong></div><div><span>过期判定</span><strong>${esc(adminConfig.policies.overdueHours)} 小时</strong></div>`; }
function openDetail(id) { const lead = adminLeads.find((item) => item.id === id); if (!lead) return; byId("dialogLeadTitle").textContent = lead.id + " · " + lead.name; byId("openWorkbench").href = "index.html?lead=" + encodeURIComponent(id); byId("leadDetail").innerHTML = [["姓名", lead.name],["手机号", lead.phone],["当前状态", stateText(lead)],["线索类型", lead.leadType],["品牌 / 车系 / 车型", `${lead.brand} / ${lead.series} / ${lead.model}`],["经销商", lead.dealer],["地区 / 地址", `${lead.region} / ${lead.address}`],["当前任务", lead.task ? `${lead.task.id} · ${lead.task.group}` : "无待处理任务"],["任务截止时间", lead.task?.due || "—"]].map(([label,value]) => `<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join(""); byId("leadDialog").showModal(); }
function bind() { document.querySelectorAll(".admin-nav-item").forEach((button) => button.addEventListener("click", () => { document.querySelectorAll(".admin-nav-item").forEach((item) => item.classList.toggle("active", item === button)); document.querySelectorAll(".admin-section").forEach((panel) => panel.hidden = panel.dataset.panel !== button.dataset.section); })); ["searchInput", "stateFilter", "brandFilter"].forEach((id) => byId(id).addEventListener(id === "searchInput" ? "input" : "change", renderRows)); byId("clearFilters").addEventListener("click", () => { byId("searchInput").value = ""; byId("stateFilter").value = "all"; byId("brandFilter").value = "all"; renderRows(); }); ["closeLeadDialog", "cancelLeadDialog"].forEach((id) => byId(id).addEventListener("click", () => byId("leadDialog").close())); }
renderMetrics(); renderStateOptions(); renderRows(); renderTasks(); renderConfigSummary(); bind();
