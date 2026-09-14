(function () {
  const storageKey = "leadFollowupWorkbench.flowConfig.v2";

  const defaults = {
    version: "2.0",
    scope: "普通线索一期",
    updatedAt: "2026-09-02 12:00",
    states: {
      unfollowed: { main: "未跟进", sub: "正常等待跟进", mainEs: "Sin seguimiento", subEs: "En espera de contacto" },
      overdue: { main: "过期未跟进", sub: "超过72小时", mainEs: "Seguimiento vencido", subEs: "Más de 72 horas" },
      followup: { main: "跟进中", sub: "待确认购车方式", mainEs: "En seguimiento", subEs: "Por confirmar forma de compra" },
      financeIntent: { main: "跟进中", sub: "有意向", mainEs: "En seguimiento", subEs: "Con interés" },
      dormantCash: { main: "暂存", sub: "全款", mainEs: "En pausa", subEs: "Compra de contado" },
      dormantTestDrive: { main: "暂存", sub: "试驾", mainEs: "En pausa", subEs: "Prueba de manejo" },
      pendingSalesConfirmation: { main: "待销售确认", sub: "待确认", mainEs: "Pendiente de confirmación", subEs: "Pendiente" },
      baicIssued: { main: "已下发", sub: "北汽线索池", mainEs: "Enviado", subEs: "池 BAIC" },
      lost: { main: "战败", sub: "终态", mainEs: "Perdido", subEs: "Estado final", terminal: true, outcome: "lost" }
    },
    taskTypes: {
      FIRST_CONTACT: { name: "首次联系", nameEs: "Primer contacto", defaultMinutes: 30, description: "线索下发或进入待销售确认后，完成首次处理" },
      FOLLOW_UP: { name: "普通回访", nameEs: "Seguimiento", defaultMinutes: 120, description: "未接通、购车意向和暂存线索的后续回访" }
    },
    policies: {
      overdueHours: 72,
      unreachableLimit: 3,
      dormantDays: 30
    },
    results: {
      unreachable: { label: "未接通", labelEs: "Sin respuesta", description: "记录未接通次数，第3次自动转战败", descriptionEs: "Registrar intentos; el tercero pasa a perdido", target: "followup", task: "FOLLOW_UP", deadline: { type: "minutes", value: 120 }, dynamic: "unreachable", enabled: true },
      wrongNumber: { label: "战败-号码错误", labelEs: "Perdido - número incorrecto", description: "战败原因必填，任务结束", descriptionEs: "Motivo obligatorio; finaliza la tarea", target: "lost", terminal: true, lostReason: "号码错误", requireReason: true, enabled: true },
      abandon: { label: "战败-放弃买车", labelEs: "Perdido - abandona compra", description: "战败原因必填，任务结束", descriptionEs: "Motivo obligatorio; finaliza la tarea", target: "lost", terminal: true, lostReason: "放弃买车", requireReason: true, enabled: true },
      financeInterest: { label: "跟进中-有意向", labelEs: "En seguimiento - con interés", description: "明确贷款购车，+1天生成回访任务", descriptionEs: "Interés en financiamiento; seguimiento en un día", target: "financeIntent", task: "FOLLOW_UP", deadline: { type: "days", value: 1 }, enabled: true },
      cash: { label: "暂存-全款", labelEs: "En pausa - contado", description: "30天后生成回访任务", descriptionEs: "Seguimiento en 30 días", target: "dormantCash", task: "FOLLOW_UP", deadline: { type: "days", value: 30 }, enabled: true },
      testDrive: { label: "暂存-试驾", labelEs: "En pausa - prueba de manejo", description: "30天后生成回访任务", descriptionEs: "Seguimiento en 30 días", target: "dormantTestDrive", task: "FOLLOW_UP", deadline: { type: "days", value: 30 }, enabled: true },
      readyToDistribute: { label: "可下发", labelEs: "Listo para enviar", description: "选择下发主机厂和经销商，进入对应线索池", descriptionEs: "Seleccionar marca y distribuidor para enviar", target: "baicIssued", requireDealer: true, enabled: true },
      baicIssued: { label: "下发北汽", labelEs: "Enviar a BAIC", description: "进入北汽线索池", descriptionEs: "Entra al pool de BAIC", target: "baicIssued", requireDealer: true, enabled: true },
      abandonedMidway: { label: "战败-中途失联", labelEs: "Perdido - contacto interrumpido", description: "战败原因必填，任务结束", descriptionEs: "Motivo obligatorio; finaliza la tarea", target: "lost", terminal: true, lostReason: "中途失联", requireReason: true, enabled: true },
      unchangedCash: { label: "想法没有改变", labelEs: "La intención no cambió", description: "继续暂存全款，30天后回访", descriptionEs: "Mantener en pausa y volver en 30 días", target: "dormantCash", task: "FOLLOW_UP", deadline: { type: "days", value: 30 }, enabled: true },
      unchangedTestDrive: { label: "想法没有改变", labelEs: "La intención no cambió", description: "继续暂存试驾，30天后回访", descriptionEs: "Mantener en pausa y volver en 30 días", target: "dormantTestDrive", task: "FOLLOW_UP", deadline: { type: "days", value: 30 }, enabled: true }
    },
    routes: {
      unfollowed: ["unreachable", "wrongNumber", "abandon", "financeInterest", "cash", "testDrive"],
      overdue: ["unreachable", "wrongNumber", "abandon", "financeInterest", "cash", "testDrive"],
      followup: ["abandonedMidway", "financeInterest", "cash", "testDrive", "readyToDistribute"],
      financeIntent: ["abandonedMidway", "financeInterest", "cash", "testDrive", "readyToDistribute"],
      pendingSalesConfirmation: ["readyToDistribute", "cash", "testDrive", "abandon", "financeInterest", "abandonedMidway"],
      dormantCash: ["financeInterest", "unchangedCash", "abandon"],
      dormantTestDrive: ["financeInterest", "unchangedTestDrive", "abandon"],
      baicIssued: ["baicIssued"]
    }
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const merge = (base, saved) => {
    const output = clone(base);
    if (!saved || typeof saved !== "object") return output;
    Object.keys(saved).forEach((key) => {
      if (saved[key] && typeof saved[key] === "object" && !Array.isArray(saved[key]) && output[key] && typeof output[key] === "object" && !Array.isArray(output[key])) {
        output[key] = merge(output[key], saved[key]);
      } else output[key] = saved[key];
    });
    return output;
  };

  function applyAdminConfiguration(config) {
    try {
      const saved = JSON.parse(localStorage.getItem("autocava_admin_demo_config_v2") || "null");
      if (!saved?.transitionConfig) return config;
      const transition = saved.transitionConfig;
      const output = clone(config);
      output.version = transition.brand?.version || output.version;
      output.updatedAt = transition.brand?.updatedAt || output.updatedAt;
      output.adminFlows = clone(transition.flows || []);
      output.adminTaskRules = clone(saved.taskRules || []);
      (transition.states || []).forEach((item) => {
        if (item.code === "issued") return;
        const existing = output.states[item.code] || {};
        output.states[item.code] = {
          ...existing,
          main: item.businessStage || existing.main || item.name,
          sub: item.name || existing.sub || "—",
          terminal: Boolean(item.terminal)
        };
      });
      (transition.results || []).filter((item) => item.actor !== "system").forEach((item) => {
        const existing = output.results[item.code] || {};
        output.results[item.code] = {
          ...existing,
          label: item.name,
          enabled: item.enabled !== false,
          requireReason: Boolean(item.requiresReason),
          requireNote: Boolean(item.requiresCallbackTime),
          requireDealer: Boolean(item.requireDealer)
        };
      });
      output.routes = {};
      output.adminFlows.forEach((flow) => {
        const result = (transition.results || []).find((item) => item.code === flow.result);
        if (!result || result.actor === "system") return;
        if (!output.routes[flow.current]) output.routes[flow.current] = [];
        if (!output.routes[flow.current].includes(flow.result)) output.routes[flow.current].push(flow.result);
      });
      return output;
    } catch (error) {
      return config;
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return applyAdminConfiguration(merge(defaults, saved));
    } catch (error) {
      return applyAdminConfiguration(clone(defaults));
    }
  }

  function save(config) {
    const next = merge(defaults, config);
    next.updatedAt = new Date().toLocaleString("zh-CN", { hour12: false });
    localStorage.setItem(storageKey, JSON.stringify(next));
    return next;
  }

  function reset() {
    localStorage.removeItem(storageKey);
    return load();
  }

  function text(item, key, locale) {
    if (!item) return "—";
    return locale === "es-MX" ? (item[key + "Es"] || item[key]) : item[key];
  }

  window.LEAD_FLOW_CONFIG = { storageKey, defaults: clone(defaults), load, save, reset, text };
})();
