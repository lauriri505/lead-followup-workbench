let config = window.LEAD_FLOW_CONFIG.load();
const $ = (id) => document.getElementById(id);

function stateLabel(key) {
  const item = config.states[key];
  return item ? item.main + " · " + item.sub : key;
}

function routeStatesFor(code) {
  return Object.entries(config.routes).filter(([, codes]) => codes.includes(code)).map(([state]) => config.states[state]?.main + "·" + config.states[state]?.sub).join("、");
}

function deadlineTextEditor(code, deadline) {
  if (!deadline || deadline.type === "none") return '<span class="muted-cell">不生成</span>';
  if (deadline.type === "manual") return '<span class="muted-cell">销售手动填写</span>';
  const unit = deadline.type === "days" ? "天" : "分钟";
  return '<span class="deadline-edit"><strong>' + deadline.value + '</strong><span>' + unit + '</span></span>';
}

function render() {
  $("configScope").textContent = config.scope;
  $("updatedAt").textContent = config.updatedAt;
  $("firstContactMinutes").value = config.taskTypes.FIRST_CONTACT.defaultMinutes;
  $("followUpMinutes").value = config.taskTypes.FOLLOW_UP.defaultMinutes;
  $("overdueHours").value = config.policies.overdueHours;
  $("unreachableLimit").value = config.policies.unreachableLimit;
  $("dormantDays").value = config.policies.dormantDays;

  $("stateRows").innerHTML = Object.entries(config.states).map(([code, state]) => {
    const type = state.terminal ? (state.outcome === "success" ? '<span class="terminal-chip success">成功终态</span>' : '<span class="terminal-chip lost">战败终态</span>') : '<span class="terminal-chip">过程状态</span>';
    return '<tr><td><code>' + code + '</code></td><td>' + state.main + '</td><td>' + state.sub + '</td><td>' + type + '</td></tr>';
  }).join("");

  $("ruleRows").innerHTML = Object.entries(config.results).map(([code, result]) => {
    const task = result.terminal ? '<span class="muted-cell">不生成</span>' : (config.taskTypes[result.task]?.name || "—");
    const required = [result.requireReason ? "原因" : "", result.requireNote ? "约定说明、时间" : ""].filter(Boolean).join("、") || "—";
    return '<tr data-code="' + code + '"><td><input type="checkbox" data-enabled="' + code + '" ' + (result.enabled !== false ? "checked" : "") + '></td><td><input type="text" data-label="' + code + '" value="' + result.label + '"><br><code>' + code + '</code></td><td>' + routeStatesFor(code) + '</td><td>' + stateLabel(result.target === "same" ? "unfollowed" : result.target) + (result.target === "same" ? "（保持当前状态）" : "") + '</td><td>' + task + '</td><td>' + deadlineTextEditor(code, result.deadline) + '</td><td>' + required + '</td></tr>';
  }).join("");
}

function readNumber(id, fallback) {
  const value = Number($(id).value);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function save() {
  config.taskTypes.FIRST_CONTACT.defaultMinutes = readNumber("firstContactMinutes", 30);
  config.taskTypes.FOLLOW_UP.defaultMinutes = readNumber("followUpMinutes", 120);
  config.policies.overdueHours = readNumber("overdueHours", 72);
  config.policies.unreachableLimit = readNumber("unreachableLimit", 3);
  config.policies.dormantDays = readNumber("dormantDays", 30);
  document.querySelectorAll("[data-enabled]").forEach((input) => { config.results[input.dataset.enabled].enabled = input.checked; });
  document.querySelectorAll("[data-label]").forEach((input) => { config.results[input.dataset.label].label = input.value.trim() || config.results[input.dataset.label].label; });
  config.results.unreachable.deadline.value = config.taskTypes.FOLLOW_UP.defaultMinutes;
  config.results.financeInterest.deadline.value = config.taskTypes.FOLLOW_UP.defaultMinutes;
  config.results.cash.deadline.value = config.policies.dormantDays;
  config.results.testDrive.deadline.value = config.policies.dormantDays;
  config = window.LEAD_FLOW_CONFIG.save(config);
  render();
  showToast("配置已保存，销售工作台重新打开或获得焦点后自动读取最新配置");
}

function showToast(message) {
  const toast = $("adminToast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

$("saveConfig").addEventListener("click", save);
$("resetConfig").addEventListener("click", () => {
  if (!window.confirm("确认恢复普通线索默认配置？")) return;
  config = window.LEAD_FLOW_CONFIG.reset();
  render();
  showToast("已恢复默认配置");
});

render();
