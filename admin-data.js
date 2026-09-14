(function () {
  const demo = window.CRM_DEMO_DATA || { leads: [], salesperson: { id: "sales 001", name: "Deng Yao" } };
  const profiles = window.CRM_CONFIG_TABLE?.leadProfiles || {};
  const workbenchConfig = window.LEAD_FLOW_CONFIG?.defaults || {};
  const stateDefinitions = [
    { code: "issued", name: "线索下发", group: "entry", businessStage: "系统入口", parent: null, level: 1, terminal: false, color: "#718096" },
    { code: "unfollowed", name: "正常等待跟进", group: "not_followed", businessStage: "未跟进", parent: "issued", level: 2, terminal: false, color: "#4d8df7" },
    { code: "overdue", name: "超过72小时", group: "overdue", businessStage: "过期未跟进", parent: "unfollowed", level: 3, terminal: false, color: "#f0a33a" },
    { code: "followup", name: "待确认购车方式", group: "followed", businessStage: "跟进中", parent: "unfollowed", level: 3, terminal: false, color: "#2fcf9f" },
    { code: "financeIntent", name: "有意向", group: "followed", businessStage: "跟进中", parent: "followup", level: 4, terminal: false, color: "#2fcf9f" },
    { code: "dormantCash", name: "全款", group: "dormant", businessStage: "暂存", parent: "followup", level: 4, terminal: false, color: "#8b95a6" },
    { code: "dormantTestDrive", name: "试驾", group: "dormant", businessStage: "暂存", parent: "followup", level: 4, terminal: false, color: "#8b95a6" },
    { code: "pendingSalesConfirmation", name: "待确认", group: "sales_confirmation", businessStage: "待销售确认", parent: "issued", level: 3, terminal: false, color: "#e3a936" },
    { code: "baicIssued", name: "北汽线索池", group: "issued", businessStage: "已下发", parent: "issued", level: 3, terminal: false, color: "#4d8df7" },
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
      category: code === "unreachable" ? "unreachable" : ["wrongNumber", "abandon", "abandonedMidway"].includes(code) ? "lost" : code === "callback" ? "callback" : "contact",
      requiresCallbackTime: item.deadline?.type === "manual",
      requiresReason: Boolean(item.requireReason || item.lostReason),
      requireDealer: Boolean(item.requireDealer)
    }))
  ];

  const taskRules = [
    { id: "RULE-FIRST", group: "FIRST_CONTACT", type: "首次联系", trigger: "新线索分配", deadline: "30分钟", assignee: "线索负责人", enabled: true },
    { id: "RULE-SALES-CONFIRM", group: "FIRST_CONTACT", type: "销售确认", trigger: "线索进入待销售确认", deadline: "立即处理", assignee: "线索负责人", enabled: true },
    { id: "RULE-RETRY", group: "FOLLOW_UP", type: "普通回访", trigger: "未接通且未达到3次上限", deadline: "+2小时", assignee: "原销售", enabled: true },
    { id: "RULE-FINANCE", group: "FOLLOW_UP", type: "普通回访", trigger: "明确贷款购车", deadline: "+1天", assignee: "原销售", enabled: true },
    { id: "RULE-DORMANT", group: "FOLLOW_UP", type: "普通回访", trigger: "全款、试驾或想法没有改变", deadline: "+30天", assignee: "原销售", enabled: true }
  ];

  const ruleForResult = {
    financeInterest: "RULE-FINANCE",
    cash: "RULE-DORMANT",
    testDrive: "RULE-DORMANT",
    unchangedCash: "RULE-DORMANT",
    unchangedTestDrive: "RULE-DORMANT",
    unreachable: "RULE-RETRY"
  };
  const deadlineForResult = {
    financeInterest: "+1天",
    cash: "+30天",
    testDrive: "+30天",
    unreachable: "+2小时"
  };

  const flows = [
    { id: 1, current: "issued", result: "assigned", next: "unfollowed", qualityUpdate: "UNKNOWN", task: "FIRST_CONTACT", taskRuleId: "RULE-FIRST", deadline: "30分钟" }
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
        requireDealer: Boolean(result.requireDealer),
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
      region: lead.region || "Ciudad de México",
      dealer: lead.dealer || "",
      address: lead.address || "",
      brand: lead.brand,
      series: lead.series,
      model: lead.model,
      price: lead.price || "—",
      downPayment: lead.downPayment || "30%",
      rate: lead.rate || "—",
      term: lead.term || "—",
      status: state.businessStage,
      subStatus: lead.lostReason || state.name,
      quality,
      assignee: demo.salesperson.id + " " + demo.salesperson.name,
      createdAt: lead.createdAt,
      task: lead.task?.group || "—",
      taskStatus: lead.task ? "处理中" : (state.terminal ? "已结束" : "待处理"),
      cleaningStatus: "清洗通过",
      cleaningResult: "有效",
      cleaningOperator: "autocava_admin_001 超级管理员",
      cleaningTime: lead.createdAt,
      cleaningNote: "已核对手机号、意向品牌与车型信息，可以进入销售跟进。",
      salesConfirmationStatus: lead.salesConfirmationStatus || (lead.state === "pendingSalesConfirmation" ? "待销售确认" : "—"),
      salesConfirmationBy: lead.salesConfirmationBy || "—",
      salesConfirmationAt: lead.salesConfirmationAt || "—",
      cleaningHistory: [{ status: "清洗通过", result: "有效", operator: "autocava_admin_001 超级管理员", time: lead.createdAt, note: "已核对基础信息并完成分配。" }]
    };
  });
  const demoNames = ["Sofía Ramírez", "Luis Torres", "María González", "Diego Hernández", "Ana Martínez", "Carlos Mendoza", "Fernanda Ruiz", "Ricardo Sánchez", "Valeria Cruz", "Jorge Navarro"];
  const demoCities = ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Querétaro", "Mérida"];
  const demoVehicles = [
    ["BAIC", "BJ40", "Plus"],
    ["NISSAN", "X-TRAIL", "Advance 2 Row"],
    ["MAZDA", "CX-30", "i Grand Touring"],
    ["BAIC", "BJ40", "Honor"],
    ["FORD", "Territory", "Titanium"],
    ["KIA", "Sportage", "EX Pack"],
    ["BAIC", "X55", "Luxury"],
    ["TOYOTA", "RAV4", "XLE"]
  ];
  const generatedLeads = Array.from({ length: Math.max(0, 100 - initialLeads.length) }, (_, index) => {
    const number = index + initialLeads.length + 1; const vehicle = demoVehicles[index % demoVehicles.length]; const date = `2026-09-${String(1 + (index % 30)).padStart(2, "0")} ${String(8 + (index % 10)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}`;
    const lostReasons = ["号码错误", "3次未接通", "放弃购买"];
    const statusCases = [["unfollowed", "正常等待跟进"], ["followup", "待确认购车方式"], ["overdue", "超过72小时"], ["pendingSalesConfirmation", "待确认"], ["dormantCash", "全款"], ["dormantTestDrive", "试驾"], ["lost", lostReasons[Math.floor(index / 6) % lostReasons.length]]]; const current = statusCases[index % statusCases.length];
    const manual = index % 7 === 0; const channel = ["Meta", "Google", "Ins", "官网"][index % 4]; const source = ["车型详情页", "AICTA选车推荐", "金融机构", "首页banner"][index % 4];
    const cleaningCases = ["待清洗", "待补充", "清洗不通过", "清洗通过"];
    const cleaningStatus = current[0] === "unfollowed" ? cleaningCases[Math.floor(index / 6) % cleaningCases.length] : "清洗通过";
    const cleaningResult = cleaningStatus === "清洗通过" ? "有效" : cleaningStatus === "待补充" ? "信息不完整" : cleaningStatus === "清洗不通过" ? (index % 2 ? "重复线索" : "非目标品牌") : "";
    const cleaned = cleaningStatus === "清洗通过";
    const assignee = ["sales 001 Deng Yao", "sales 002 María López", "sales 003 Carlos Ruiz"][index % 3];
    return {
      id: `LEAD-${String(1600 + number).padStart(4, "0")}`,
      name: demoNames[index % demoNames.length],
      phone: `55${String(10000000 + index * 137).slice(0, 8)}`,
      city: demoCities[index % demoCities.length],
      region: demoCities[index % demoCities.length],
      brand: vehicle[0], series: vehicle[1], model: vehicle[2],
      dealer: "", address: "", price: `$${(429900 + index * 3500).toLocaleString("en-US")} MXN`, downPayment: `${20 + index % 4 * 5}%`, rate: `${(13.9 + index % 5 * 0.35).toFixed(2)}%`, term: `${48 + index % 3 * 12}期`,
      type: index % 3 === 0 ? "试驾" : "金融", leadType: index % 3 === 0 ? "试驾" : "金融",
      entryType: manual ? "人工" : "自动", channel: manual ? "" : channel, source: manual ? "" : source,
      createdAt: date, status: cleaned ? stateMap[current[0]].businessStage : "", subStatus: cleaned ? current[1] : "",
      quality: ["unfollowed", "overdue"].includes(current[0]) ? "UNKNOWN" : current[0] === "lost" ? "INVALID" : "VALID",
      assignee: cleaned ? assignee : "—",
      task: cleaned && current[0] !== "lost" ? (index % 2 ? "普通回访" : "首次联系") : "—",
      taskStatus: cleaned ? (current[0] === "lost" ? "已结束" : index % 3 === 0 ? "待处理" : "处理中") : "未生成",
      cleaningStatus,
      cleaningResult,
      cleaningOperator: cleaningStatus === "待清洗" ? "—" : "autocava_admin_001 超级管理员",
      cleaningTime: cleaningStatus === "待清洗" ? "—" : date,
      cleaningNote: cleaningStatus === "待补充" ? "缺少可确认的车型信息，等待补充。" : cleaningStatus === "清洗不通过" ? "清洗校验未通过，不进入销售任务。" : cleaned ? "基础信息已核对，可以进入销售跟进。" : "",
      salesConfirmationStatus: current[0] === "pendingSalesConfirmation" ? (index % 2 ? "待销售确认" : "销售已确认") : "—",
      salesConfirmationBy: current[0] === "pendingSalesConfirmation" && !(index % 2) ? assignee : "—",
      salesConfirmationAt: current[0] === "pendingSalesConfirmation" && !(index % 2) ? date : "—",
      cleaningHistory: cleaningStatus === "待清洗" ? [] : [{ status: cleaningStatus, result: cleaningResult, operator: "autocava_admin_001 超级管理员", time: date, note: cleaningStatus === "待补充" ? "等待补充线索信息。" : "完成线索清洗。" }]
    };
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
      { id: "finance", label: "有意向", subtitle: "跟进中 · +1天回访", kind: "state", stateCode: "financeIntent", x: 1300, y: 100 },
      { id: "cash", label: "全款", subtitle: "暂存 · +30天回访", kind: "state", stateCode: "dormantCash", x: 1300, y: 280 },
      { id: "trial", label: "试驾", subtitle: "暂存 · +30天回访", kind: "state", stateCode: "dormantTestDrive", x: 1300, y: 460 },
      { id: "confirm", label: "待销售确认", subtitle: "确认后可下发", kind: "state", stateCode: "pendingSalesConfirmation", x: 1030, y: 650 },
      { id: "issuedBaic", label: "下发北汽", subtitle: "进入北汽线索池", kind: "state", stateCode: "baicIssued", x: 1600, y: 650 },
      { id: "lost", label: "战败", subtitle: "终态 · 原因必填", kind: "failure", stateCode: "lost", x: 1600, y: 420 }
    ],
    edges: [
      { from: "issued", to: "firstTask" }, { from: "firstTask", to: "unfollowed" },
      { from: "unfollowed", to: "overdue", label: "超过72小时" }, { from: "unfollowed", to: "contact" }, { from: "overdue", to: "contact" },
      { from: "contact", to: "retry", label: "未接通 / 稍后联系" }, { from: "retry", to: "contact", label: "到期回访" },
      { from: "contact", to: "followup", label: "贷款购车" }, { from: "followup", to: "finance", label: "有意向" },
      { from: "followup", to: "cash", label: "全款" }, { from: "followup", to: "trial", label: "先试驾" },
      { from: "contact", to: "confirm", label: "进入待销售确认" }, { from: "confirm", to: "issuedBaic", label: "可下发 / 选择经销商" },
      { from: "contact", to: "lost", label: "号码错误 / 放弃 / 3次未接通" },
      { from: "finance", to: "lost", label: "放弃买车 / 中途失联" }, { from: "cash", to: "finance", label: "明确贷款购车" }, { from: "trial", to: "finance", label: "明确贷款购车" },
      { from: "cash", to: "cash", label: "想法没有改变" }, { from: "trial", to: "trial", label: "想法没有改变" }
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
    baicDealers: [
      { id: "BAIC-DLR-001", name: "BAIC Santa Fe", region: "Ciudad de México", address: "Vasco de Quiroga 3800", salesId: "baic_sales_001", salesName: "Roberto García" },
      { id: "BAIC-DLR-002", name: "BAIC Lindavista", region: "Ciudad de México", address: "Av. Insurgentes Norte 1800", salesId: "baic_sales_002", salesName: "Daniela Hernández" },
      { id: "BAIC-DLR-003", name: "BAIC Tlalnepantla", region: "Estado de México", address: "Av. Gustavo Baz 2160", salesId: "baic_sales_003", salesName: "Miguel Torres" }
    ],
    permissions: {
      super_admin: ["查看平台全部普通线索", "清洗和分配线索", "配置账号与角色", "配置任务规则", "配置线索流转", "查看操作记录", "允许接收导入线索"],
      sales: ["查看本人负责线索", "处理销售任务", "提交跟进结果", "编辑用户当前信息", "添加跟踪记事"]
    },
    taskRules,
    transitionConfig: {
      brand: { name: "AutoCava", code: "autocava", version: "V2.0", status: "草稿", source: "普通线索一期规则·销售确认与主机厂下发" },
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
