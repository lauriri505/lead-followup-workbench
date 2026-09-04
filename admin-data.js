(function () {
  const demo = window.CRM_DEMO_DATA || { leads: [], salesperson: { id: "sales 001", name: "Deng Yao" } };
  const profiles = window.CRM_CONFIG_TABLE?.leadProfiles || {};
  const workbenchConfig = window.LEAD_FLOW_CONFIG?.defaults || {};
  const stateDefinitions = [
    { code: "issued", name: "线索下发", group: "entry", businessStage: "系统入口", parent: null, level: 1, terminal: false, color: "#718096" },
    { code: "unfollowed", name: "正常等待跟进", group: "not_followed", businessStage: "未跟进", parent: "issued", level: 2, terminal: false, color: "#4d8df7" },
    { code: "overdue", name: "超过72小时", group: "overdue", businessStage: "过期未跟进", parent: "unfollowed", level: 3, terminal: false, color: "#f0a33a" },
    { code: "followup", name: "待确认购车方式", group: "followed", businessStage: "跟进中", parent: "unfollowed", level: 3, terminal: false, color: "#2fcf9f" },
    { code: "financeIntent", name: "有金融购车意向", group: "followed", businessStage: "跟进中", parent: "followup", level: 4, terminal: false, color: "#2fcf9f" },
    { code: "dormantCash", name: "明确表示全款", group: "dormant", businessStage: "暂存", parent: "followup", level: 4, terminal: false, color: "#8b95a6" },
    { code: "dormantTestDrive", name: "表示要先试驾", group: "dormant", businessStage: "暂存", parent: "followup", level: 4, terminal: false, color: "#8b95a6" },
    { code: "confirmedFinance", name: "成功终态", group: "success", businessStage: "确认金融购车", parent: "financeIntent", level: 5, terminal: true, color: "#19a974" },
    { code: "lost", name: "战败终态", group: "lost", businessStage: "战败", parent: "followup", level: 5, terminal: true, color: "#dc6262" }
  ];

  const resultDefinitions = [
    { code: "assigned", name: "线索下发", actor: "system", enabled: true, sortOrder: 10, category: "contact", requiresCallbackTime: false, requiresReason: false },
    { code: "timeout", name: "超过72小时未有效跟进", actor: "system", enabled: true, sortOrder: 20, category: "unreachable", requiresCallbackTime: false, requiresReason: false },
    ...Object.entries(workbenchConfig.results || {}).map(([code, item], index) => ({
      code,
      name: item.label,
      actor: "sales",
      enabled: item.enabled !== false,
      sortOrder: (index + 1) * 10,
      category: code === "unreachable" ? "unreachable" : ["wrongNumber", "abandon"].includes(code) ? "lost" : code === "callback" ? "callback" : "contact",
      requiresCallbackTime: item.deadline?.type === "manual",
      requiresReason: Boolean(item.requireReason || item.lostReason)
    }))
  ];

  const taskRules = [
    { id: "RULE-FIRST", group: "FIRST_CONTACT", type: "首次联系", trigger: "新线索分配", deadline: "30分钟", assignee: "线索负责人", enabled: true },
    { id: "RULE-OVERDUE", group: "FIRST_CONTACT", type: "首次联系", trigger: "超过72小时仍未完成首次有效跟进", deadline: "立即处理", assignee: "线索负责人", enabled: true },
    { id: "RULE-RETRY", group: "FOLLOW_UP", type: "普通回访", trigger: "第1或第2次未接通", deadline: "+2小时", assignee: "原销售", enabled: true },
    { id: "RULE-CALLBACK", group: "FOLLOW_UP", type: "普通回访", trigger: "客户要求稍后联系", deadline: "销售手动时间", assignee: "原销售", enabled: true },
    { id: "RULE-FINANCE", group: "FOLLOW_UP", type: "普通回访", trigger: "客户有金融购车意向", deadline: "+2小时", assignee: "原销售", enabled: true },
    { id: "RULE-DORMANT", group: "FOLLOW_UP", type: "普通回访", trigger: "全款或试驾线索低频回访", deadline: "+30天", assignee: "原销售", enabled: true }
  ];

  const ruleForResult = {
    financeInterest: "RULE-FINANCE",
    cash: "RULE-DORMANT",
    testDrive: "RULE-DORMANT",
    callback: "RULE-CALLBACK",
    unreachable: "RULE-RETRY"
  };
  const deadlineForResult = {
    financeInterest: "+2小时",
    cash: "+30天",
    testDrive: "+30天",
    callback: "销售手动时间",
    unreachable: "+2小时"
  };

  const flows = [
    { id: 1, current: "issued", result: "assigned", next: "unfollowed", qualityUpdate: "UNKNOWN", task: "FIRST_CONTACT", taskRuleId: "RULE-FIRST", deadline: "30分钟" },
    { id: 2, current: "unfollowed", result: "timeout", next: "overdue", qualityUpdate: "UNKNOWN", task: "FIRST_CONTACT", taskRuleId: "RULE-OVERDUE", deadline: "立即处理" }
  ];
  const routeConfig = workbenchConfig.routes || {};
  const resultConfig = workbenchConfig.results || {};
  let flowId = 3;
  Object.entries(routeConfig).forEach(([current, resultCodes]) => {
    resultCodes.forEach((resultCode) => {
      const result = resultConfig[resultCode] || {};
      let next = result.target === "same" ? current : (result.target || current);
      if (resultCode === "callback" && ["unfollowed", "overdue"].includes(current)) next = "followup";
      flows.push({
        id: flowId++,
        current,
        result: resultCode,
        next,
        qualityUpdate: ["wrongNumber"].includes(resultCode) ? "INVALID" : ["unfollowed", "overdue"].includes(next) || resultCode === "unreachable" ? "UNKNOWN" : "VALID",
        unreachable: resultCode === "unreachable",
        terminalAt: resultCode === "unreachable" ? Number(workbenchConfig.policies?.unreachableLimit || 3) : undefined,
        terminalNext: resultCode === "unreachable" ? "lost" : undefined,
        terminalQuality: resultCode === "unreachable" ? "INVALID" : undefined,
        reason: Boolean(result.requireReason || result.lostReason),
        task: result.task || null,
        taskRuleId: ruleForResult[resultCode] || null,
        deadline: deadlineForResult[resultCode] || "—"
      });
    });
  });

  const mergedLeads = demo.leads.map((lead) => ({ ...lead, ...(profiles[lead.id] || {}) }));
  const stateMap = Object.fromEntries(stateDefinitions.map((item) => [item.code, item]));
  const initialLeads = mergedLeads.map((lead) => {
    const state = stateMap[lead.state] || stateMap.unfollowed;
    const invalid = lead.state === "lost" && /号码错误|未接通/.test(lead.lostReason || "");
    const quality = ["unfollowed", "overdue"].includes(lead.state) ? "UNKNOWN" : invalid ? "INVALID" : "VALID";
    return {
      id: lead.id,
      name: lead.name,
      phone: lead.phone,
      source: lead.entryType === "人工" ? "" : (lead.source || ["车型详情页", "AICTA选车推荐", "金融机构", "首页banner"][Math.abs(String(lead.id).length) % 4]),
      channel: lead.entryType === "人工" ? "" : (["Meta", "Google", "Ins", "官网"][Math.abs(String(lead.id).length) % 4]),
      type: ["金融", "试驾"].includes(lead.leadType) ? lead.leadType : "金融",
      leadType: ["金融", "试驾"].includes(lead.leadType) ? lead.leadType : "金融",
      entryType: lead.entryType === "人工" ? "人工" : "自动",
      city: lead.region || "Ciudad de México",
      brand: lead.brand,
      series: lead.series,
      model: lead.model,
      status: state.businessStage,
      subStatus: lead.lostReason || state.name,
      quality,
      assignee: demo.salesperson.id + " " + demo.salesperson.name,
      createdAt: lead.createdAt,
      task: lead.task?.group || "—",
      taskStatus: lead.task ? "处理中" : (state.terminal ? "已结束" : "待处理")
    };
  });
  const demoNames = ["Sofía Ramírez", "Luis Torres", "María González", "Diego Hernández", "Ana Martínez", "Carlos Mendoza", "Fernanda Ruiz", "Ricardo Sánchez", "Valeria Cruz", "Jorge Navarro"];
  const demoCities = ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Querétaro", "Mérida"];
  const demoVehicles = [["NISSAN", "X-TRAIL", "Advance 2 Row"], ["MAZDA", "CX-30", "i Grand Touring"], ["FORD", "Territory", "Titanium"], ["KIA", "Sportage", "EX Pack"], ["TOYOTA", "RAV4", "XLE"]];
  const generatedLeads = Array.from({ length: Math.max(0, 100 - initialLeads.length) }, (_, index) => {
    const number = index + initialLeads.length + 1; const vehicle = demoVehicles[index % demoVehicles.length]; const date = `2026-09-${String(1 + (index % 30)).padStart(2, "0")} ${String(8 + (index % 10)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}`;
    const statusCases = [["unfollowed", "正常等待跟进"], ["followup", "待确认购车方式"], ["overdue", "超过72小时"], ["dormantCash", "明确表示全款"], ["dormantTestDrive", "表示要先试驾"], ["lost", index % 2 ? "放弃购买" : "号码错误"]]; const current = statusCases[index % statusCases.length];
    const manual = index % 7 === 0; const channel = ["Meta", "Google", "Ins", "官网"][index % 4]; const source = ["车型详情页", "AICTA选车推荐", "金融机构", "首页banner"][index % 4];
    return { id: `LEAD-${String(1600 + number).padStart(4, "0")}`, name: demoNames[index % demoNames.length], phone: `55${String(10000000 + index * 137).slice(0, 8)}`, city: demoCities[index % demoCities.length], region: demoCities[index % demoCities.length], brand: vehicle[0], series: vehicle[1], model: vehicle[2], type: index % 3 === 0 ? "试驾" : "金融", leadType: index % 3 === 0 ? "试驾" : "金融", entryType: manual ? "人工" : "自动", channel: manual ? "" : channel, source: manual ? "" : source, createdAt: date, status: stateMap[current[0]].businessStage, subStatus: current[1], quality: ["unfollowed", "overdue"].includes(current[0]) ? "UNKNOWN" : current[0] === "lost" ? "INVALID" : "VALID", assignee: ["sales 001 Deng Yao", "sales 002 María López", "sales 003 Carlos Ruiz"][index % 3], task: current[0] === "lost" ? "—" : index % 2 ? "普通回访" : "首次联系", taskStatus: current[0] === "lost" ? "已结束" : index % 3 === 0 ? "待处理" : "处理中" };
  });
  const leads = [...initialLeads, ...generatedLeads];

  const journeyDiagram = {
    width: 1960,
    height: 820,
    nodes: [
      { id: "issued", label: "线索下发", subtitle: "系统入口", kind: "state", stateCode: "issued", x: 40, y: 330 },
      { id: "firstTask", label: "生成首次联系任务", subtitle: "30分钟", kind: "task", x: 245, y: 330 },
      { id: "unfollowed", label: "未跟进", subtitle: "正常等待", kind: "state", stateCode: "unfollowed", x: 500, y: 330 },
      { id: "overdue", label: "过期未跟进", subtitle: "超过72小时", kind: "state", stateCode: "overdue", x: 500, y: 80 },
      { id: "contact", label: "提交跟进结果", subtitle: "销售操作", kind: "decision", x: 760, y: 330 },
      { id: "retry", label: "生成普通回访任务", subtitle: "+2小时 / 手动时间", kind: "task", x: 760, y: 650 },
      { id: "followup", label: "跟进中", subtitle: "确认购车方式", kind: "state", stateCode: "followup", x: 1040, y: 280 },
      { id: "finance", label: "金融购车意向", subtitle: "继续确认方案", kind: "state", stateCode: "financeIntent", x: 1300, y: 130 },
      { id: "cash", label: "全款", subtitle: "暂存 · 低频回访", kind: "state", stateCode: "dormantCash", x: 1300, y: 330 },
      { id: "trial", label: "先试驾", subtitle: "暂存 · 低频回访", kind: "state", stateCode: "dormantTestDrive", x: 1300, y: 500 },
      { id: "confirmed", label: "确认金融购车", subtitle: "成功终态", kind: "success", stateCode: "confirmedFinance", x: 1600, y: 90 },
      { id: "lost", label: "战败", subtitle: "终态 · 原因必填", kind: "failure", stateCode: "lost", x: 1600, y: 560 }
    ],
    edges: [
      { from: "issued", to: "firstTask" }, { from: "firstTask", to: "unfollowed" },
      { from: "unfollowed", to: "overdue", label: "超过72小时" }, { from: "unfollowed", to: "contact" }, { from: "overdue", to: "contact" },
      { from: "contact", to: "retry", label: "未接通 / 稍后联系" }, { from: "retry", to: "contact", label: "到期回访" },
      { from: "contact", to: "followup", label: "已联系" }, { from: "followup", to: "finance", label: "金融意向" },
      { from: "followup", to: "cash", label: "全款" }, { from: "followup", to: "trial", label: "先试驾" },
      { from: "finance", to: "confirmed", label: "确认金融购车" },
      { from: "contact", to: "lost", label: "号码错误 / 放弃购买 / 3次未接通" },
      { from: "finance", to: "lost", label: "放弃购买" }, { from: "cash", to: "finance", label: "转金融" }, { from: "trial", to: "finance", label: "转金融" }
    ]
  };

  window.AUTOCAVA_ADMIN_DATA = {
    tenant: { id: "PLATFORM-AUTOCAVA", name: "AutoCava", brand: "MULTI_BRAND", scope: "普通线索一期" },
    currentAccount: { id: "autocava_admin_001", name: "超级管理员", role: "super_admin" },
    leads,
    accounts: [
      { id: "autocava_admin_001", username: "超级管理员", role: "super_admin", dataScope: "平台全部普通线索", status: "启用", lastLogin: "今天 09:12" },
      { id: "sales_001", username: "Deng Yao", role: "sales", dataScope: "本人负责线索", status: "启用", lastLogin: "今天 09:38" },
      { id: "sales_002", username: "María López", role: "sales", dataScope: "本人负责线索", status: "启用", lastLogin: "今天 09:26" },
      { id: "sales_003", username: "Carlos Ruiz", role: "sales", dataScope: "本人负责线索", status: "停用", lastLogin: "08-29 17:44" }
    ],
    permissions: {
      super_admin: ["查看平台全部普通线索", "配置账号与角色", "配置任务规则", "配置线索流转", "查看操作记录", "允许接收导入线索"],
      sales: ["查看本人负责线索", "处理销售任务", "提交跟进结果", "编辑用户当前信息", "添加跟踪记事"]
    },
    taskRules,
    transitionConfig: {
      brand: { name: "AutoCava", code: "autocava", version: "V1.0", status: "草稿", source: "普通线索一期规则" },
      states: stateDefinitions,
      qualityOptions: [
        { code: "UNKNOWN", name: "待判定", color: "#8b95a6" },
        { code: "VALID", name: "有效", color: "#19a974" },
        { code: "INVALID", name: "无效", color: "#dc6262" }
      ],
      leadTags: [],
      progressFields: [],
      progressStateRules: [],
      results: resultDefinitions,
      flows,
      journeyDiagram
    }
  };
})();
