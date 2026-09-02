(function () {
  const storageKey = "leadFollowupWorkbench.flowConfig.v1";

  const defaults = {
    version: "1.0",
    scope: "普通线索一期",
    updatedAt: "2026-09-02 12:00",
    states: {
      unfollowed: { main: "未跟进", sub: "正常等待跟进", mainEs: "Sin seguimiento", subEs: "En espera de contacto" },
      overdue: { main: "过期未跟进", sub: "超过72小时", mainEs: "Seguimiento vencido", subEs: "Más de 72 horas" },
      followup: { main: "跟进中", sub: "待确认购车方式", mainEs: "En seguimiento", subEs: "Por confirmar forma de compra" },
      financeIntent: { main: "跟进中", sub: "有金融购车意向", mainEs: "En seguimiento", subEs: "Interés en financiamiento" },
      dormantCash: { main: "暂存", sub: "明确表示全款", mainEs: "En pausa", subEs: "Compra de contado" },
      dormantTestDrive: { main: "暂存", sub: "表示要先试驾", mainEs: "En pausa", subEs: "Quiere prueba de manejo" },
      confirmedFinance: { main: "确认金融购车", sub: "成功终态", mainEs: "Compra financiada confirmada", subEs: "Estado final exitoso", terminal: true, outcome: "success" },
      lost: { main: "战败", sub: "终态", mainEs: "Perdido", subEs: "Estado final", terminal: true, outcome: "lost" }
    },
    taskTypes: {
      FIRST_CONTACT: { name: "首次联系", nameEs: "Primer contacto", defaultMinutes: 30, description: "线索下发后生成，默认30分钟内完成首次联系" },
      FOLLOW_UP: { name: "普通回访", nameEs: "Seguimiento", defaultMinutes: 120, description: "未接通、约定回访和意向确认等普通线索回访" }
    },
    policies: {
      overdueHours: 72,
      unreachableLimit: 3,
      dormantDays: 30
    },
    results: {
      financeInterest: { label: "有金融购车意向", labelEs: "Interés en compra financiada", description: "客户有贷款购车想法，继续确认方案", descriptionEs: "El cliente considera financiar; continuar confirmando la propuesta", target: "financeIntent", task: "FOLLOW_UP", deadline: { type: "minutes", value: 120 }, enabled: true },
      confirmFinance: { label: "确认金融购车", labelEs: "Confirma compra financiada", description: "客户确认使用金融方案购车", descriptionEs: "El cliente confirma la compra mediante financiamiento", target: "confirmedFinance", terminal: true, enabled: true },
      cash: { label: "明确表示全款", labelEs: "Confirma compra de contado", description: "暂存并进入低频普通回访", descriptionEs: "Pausar y continuar con seguimiento de baja frecuencia", target: "dormantCash", task: "FOLLOW_UP", deadline: { type: "days", value: 30 }, enabled: true },
      testDrive: { label: "表示要先试驾", labelEs: "Quiere prueba de manejo", description: "暂存并在后续普通回访中确认购车方式", descriptionEs: "Pausar y confirmar la forma de compra en el siguiente contacto", target: "dormantTestDrive", task: "FOLLOW_UP", deadline: { type: "days", value: 30 }, enabled: true },
      callback: { label: "要求稍后联系", labelEs: "Solicita contacto posterior", description: "按客户约定时间回访", descriptionEs: "Contactar en la fecha acordada con el cliente", target: "same", task: "FOLLOW_UP", deadline: { type: "manual" }, requireNote: true, enabled: true },
      unreachable: { label: "未接通", labelEs: "Sin respuesta", description: "前两次继续回访，累计3次自动战败", descriptionEs: "Reintentar dos veces; al tercer intento pasa a perdido", target: "same", task: "FOLLOW_UP", deadline: { type: "minutes", value: 120 }, dynamic: "unreachable", enabled: true },
      wrongNumber: { label: "号码错误", labelEs: "Número incorrecto", description: "无法触达，直接转为战败", descriptionEs: "No es posible contactar; pasa directamente a perdido", target: "lost", terminal: true, lostReason: "号码错误", enabled: true },
      abandon: { label: "放弃买车", labelEs: "Desiste de la compra", description: "客户明确放弃，转为战败", descriptionEs: "El cliente desiste; pasa a perdido", target: "lost", terminal: true, lostReason: "放弃买车", requireReason: true, enabled: true }
    },
    routes: {
      unfollowed: ["financeInterest", "cash", "testDrive", "callback", "unreachable", "wrongNumber", "abandon"],
      overdue: ["financeInterest", "cash", "testDrive", "callback", "unreachable", "wrongNumber", "abandon"],
      followup: ["confirmFinance", "financeInterest", "cash", "testDrive", "callback", "unreachable", "wrongNumber", "abandon"],
      financeIntent: ["confirmFinance", "cash", "testDrive", "callback", "unreachable", "wrongNumber", "abandon"],
      dormantCash: ["confirmFinance", "financeInterest", "testDrive", "callback", "unreachable", "wrongNumber", "abandon"],
      dormantTestDrive: ["confirmFinance", "financeInterest", "cash", "callback", "unreachable", "wrongNumber", "abandon"]
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

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      return merge(defaults, saved);
    } catch (error) {
      return clone(defaults);
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
