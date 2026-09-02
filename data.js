window.CRM_DEMO_DATA = {
  salesperson: { id: "sales 001", name: "Deng Yao" },
  vehicleCatalog: {
    NISSAN: { "X-TRAIL": ["Advance 2 Row", "Exclusive CVT", "Platinum"], Kicks: ["Advance CVT", "Exclusive CVT"] },
    MAZDA: { "CX-30": ["i Sport", "i Grand Touring"], "CX-5": ["i Sport", "Signature"] },
    FORD: { Explorer: ["XLT", "Limited", "Platinum"], Territory: ["Trend", "Titanium"] },
    KIA: { Sportage: ["EX", "EX Pack", "SXL"], Seltos: ["EX", "SX"] },
    TOYOTA: { "Corolla Cross": ["LE", "XLE", "HEV"], RAV4: ["XLE", "Limited HEV"] },
    BAIC: { BJ40: ["Plus", "Honor"], X55: ["Luxury", "Honor"] }
  },
  dealers: [
    { name: "Nissan Polanco", brand: "NISSAN", region: "Ciudad de México", address: "Lago Alberto 320" },
    { name: "Nissan Satélite", brand: "NISSAN", region: "Estado de México", address: "Blvd. Manuel Ávila Camacho 2300" },
    { name: "Mazda Universidad", brand: "MAZDA", region: "Ciudad de México", address: "Av. Universidad 1000" },
    { name: "Mazda Interlomas", brand: "MAZDA", region: "Estado de México", address: "Vialidad de la Barranca 6" },
    { name: "Ford Dinastía", brand: "FORD", region: "Ciudad de México", address: "Calz. de Tlalpan 2750" },
    { name: "KIA Lindavista", brand: "KIA", region: "Ciudad de México", address: "Av. Insurgentes Norte 1800" },
    { name: "Toyota Satélite", brand: "TOYOTA", region: "Estado de México", address: "Blvd. Manuel Ávila Camacho 2250" },
    { name: "BAIC Santa Fe", brand: "BAIC", region: "Ciudad de México", address: "Vasco de Quiroga 3800" }
  ],
  leads: [
    {
      id: "LEAD-1533", name: "Sofía Ramírez", phone: "5612345454", source: "车型详情页",
      leadType: "待确认", brand: "NISSAN", series: "X-TRAIL", model: "Advance 2 Row",
      dealer: "Nissan Polanco", address: "Lago Alberto 320", region: "Ciudad de México",
      price: "$589,900 MXN", rate: "14.99%", term: "72期", createdAt: "2026-09-02 09:30",
      state: "unfollowed", unreachableCount: 0,
      task: { id: "TASK-260902-001", code: "FIRST_CONTACT", group: "首次联系", trigger: "线索下发", due: "2026-09-02 10:00" },
      original: { name: "Sofia Ramirez", phone: "5612345000", brand: "NISSAN", series: "Kicks", model: "Exclusive CVT", dealer: "Nissan Satélite", region: "Estado de México", address: "Blvd. Manuel Ávila Camacho 2300" },
      editRecords: [{ time: "2026-09-02 09:40", operator: "sales 001 Deng Yao", changes: [
        { field: "姓名", before: "Sofia Ramirez", after: "Sofía Ramírez" }, { field: "车系", before: "Kicks", after: "X-TRAIL" }, { field: "经销商", before: "Nissan Satélite", after: "Nissan Polanco" }
      ] }],
      operations: [
        ["今天 09:31", "任务生成", "根据普通线索规则生成首次联系任务，截止时间为线索下发后30分钟", "系统"],
        ["今天 09:30", "线索分配", "线索通过负载均衡分配给 sales 001 Deng Yao", "系统"]
      ],
      notes: [
        ["今天 09:42", "用户在车型页关注X-TRAIL两排座版本，尚未确认金融或全款购车。", "sales 001 Deng Yao"],
        ["今天 09:36", "留资手机号已通过格式校验，建议优先使用WhatsApp联系。", "sales 001 Deng Yao"]
      ]
    },
    {
      id: "LEAD-1541", name: "Luis Torres", phone: "5581267742", source: "金融试算器", leadType: "待确认", brand: "MAZDA", series: "CX-30", model: "i Grand Touring",
      dealer: "Mazda Universidad", address: "Av. Universidad 1000", region: "Ciudad de México", price: "$512,900 MXN", rate: "15.40%", term: "60期", createdAt: "2026-09-02 08:20",
      state: "unfollowed", unreachableCount: 1,
      task: { id: "TASK-260902-008", code: "FOLLOW_UP", group: "普通回访", trigger: "累计第1次未接通", due: "2026-09-02 12:20" },
      operations: [["今天 10:20", "跟进提交", "跟进结果：未接通（第1次）", "sales 001 Deng Yao"], ["今天 10:20", "任务生成", "生成普通回访任务，默认2小时后再次联系", "系统"], ["今天 08:21", "任务生成", "生成首次联系任务，截止时间为30分钟", "系统"]],
      notes: [["今天 10:22", "首次拨打无人接听，WhatsApp消息已发送但尚未读取。", "sales 001 Deng Yao"], ["今天 08:28", "用户在试算器中选择首付30%、贷款60期。", "sales 001 Deng Yao"]]
    },
    {
      id: "LEAD-1560", name: "María González", phone: "5567342901", source: "官网表单", leadType: "待确认", brand: "FORD", series: "Territory", model: "Titanium",
      dealer: "Ford Dinastía", address: "Calz. de Tlalpan 2750", region: "Ciudad de México", price: "$699,000 MXN", rate: "15.10%", term: "72期", createdAt: "2026-08-29 09:00",
      state: "overdue", unreachableCount: 0,
      task: { id: "TASK-260902-011", code: "FIRST_CONTACT", group: "首次联系", trigger: "下发超过72小时仍未有效跟进", due: "2026-09-02 09:00" },
      operations: [["今天 09:00", "状态更新", "线索下发超过72小时，系统更新为过期未跟进", "系统"], ["08-29 09:01", "任务生成", "生成首次联系任务，默认30分钟内处理", "系统"], ["08-29 09:00", "线索分配", "线索分配给 sales 001 Deng Yao", "系统"]],
      notes: [["昨天 17:12", "用户希望了解Territory Titanium是否有现车。", "sales 001 Deng Yao"], ["08-29 09:08", "官网表单未填写方便接听时间。", "sales 001 Deng Yao"]]
    },
    {
      id: "LEAD-1588", name: "Diego Hernández", phone: "5576810394", source: "WhatsApp广告", leadType: "金融", brand: "KIA", series: "Sportage", model: "EX Pack",
      dealer: "KIA Lindavista", address: "Av. Insurgentes Norte 1800", region: "Ciudad de México", price: "$679,900 MXN", rate: "14.80%", term: "60期", createdAt: "2026-09-01 12:40",
      state: "financeIntent", unreachableCount: 0,
      task: { id: "TASK-260902-015", code: "FOLLOW_UP", group: "普通回访", trigger: "有金融购车意向", due: "2026-09-02 15:00" },
      operations: [["今天 10:05", "状态流转", "未跟进 · 正常等待跟进 → 跟进中 · 有金融购车意向", "系统"], ["今天 10:05", "任务生成", "生成普通回访任务，继续确认金融购车方案", "系统"], ["今天 10:04", "跟进提交", "客户表示需要贷款购车，但还要确认首付金额", "sales 001 Deng Yao"]],
      notes: [["今天 10:06", "客户可以接受首付25%，希望月供控制在9,000比索以内。", "sales 001 Deng Yao"], ["今天 10:02", "客户有稳定工资收入，希望了解60期金融方案。", "sales 001 Deng Yao"]]
    },
    {
      id: "LEAD-1602", name: "Ana Martínez", phone: "5549081266", source: "门店录入", leadType: "全款", brand: "TOYOTA", series: "RAV4", model: "XLE",
      dealer: "Toyota Satélite", address: "Blvd. Manuel Ávila Camacho 2250", region: "Estado de México", price: "$748,400 MXN", rate: "—", term: "—", createdAt: "2026-08-03 16:20",
      state: "dormantCash", unreachableCount: 0,
      task: { id: "TASK-260902-021", code: "FOLLOW_UP", group: "普通回访", trigger: "全款线索到期回访", due: "2026-09-02 11:00" },
      operations: [["08-03 16:45", "状态流转", "跟进中 · 待确认购车方式 → 暂存 · 明确表示全款", "系统"], ["08-03 16:45", "任务生成", "生成30天后普通回访任务", "系统"], ["08-03 16:44", "跟进提交", "客户明确表示只考虑全款购买", "sales 001 Deng Yao"]],
      notes: [["昨天 15:18", "客户仍倾向全款，正在等待旧车出售。", "sales 001 Deng Yao"], ["08-03 16:46", "用户预计一个月后资金到账，可以届时再次联系。", "sales 001 Deng Yao"]]
    },
    {
      id: "LEAD-1614", name: "Carlos Mendoza", phone: "5519236408", source: "试驾活动页", leadType: "试驾", brand: "BAIC", series: "BJ40", model: "Honor",
      dealer: "BAIC Santa Fe", address: "Vasco de Quiroga 3800", region: "Ciudad de México", price: "$799,900 MXN", rate: "13.90%", term: "60期", createdAt: "2026-08-03 13:10",
      state: "dormantTestDrive", unreachableCount: 0,
      task: { id: "TASK-260902-025", code: "FOLLOW_UP", group: "普通回访", trigger: "试驾意向到期回访", due: "2026-09-02 14:00" },
      operations: [["08-03 13:35", "状态流转", "跟进中 · 待确认购车方式 → 暂存 · 表示要先试驾", "系统"], ["08-03 13:35", "任务生成", "生成30天后普通回访任务", "系统"], ["08-03 13:34", "跟进提交", "客户表示要先体验车辆再决定购车方式", "sales 001 Deng Yao"]],
      notes: [["昨天 16:30", "客户周末可到店，希望先确认BJ40试驾车是否可用。", "sales 001 Deng Yao"], ["08-03 13:36", "客户关注越野能力和后排空间，购车方式暂未确认。", "sales 001 Deng Yao"]]
    },
    {
      id: "LEAD-1630", name: "Fernanda Ruiz", phone: "5599021876", source: "内容文章页", leadType: "待确认", brand: "NISSAN", series: "Kicks", model: "Exclusive CVT",
      dealer: "Nissan Polanco", address: "Lago Alberto 320", region: "Ciudad de México", price: "$548,900 MXN", rate: "16.20%", term: "60期", createdAt: "2026-09-01 18:22",
      state: "followup", unreachableCount: 0,
      task: { id: "TASK-260902-029", code: "FOLLOW_UP", group: "普通回访", trigger: "客户要求稍后联系", due: "2026-09-02 17:30" },
      operations: [["昨天 18:55", "跟进提交", "跟进结果：要求稍后联系；用户约定今天17:30联系", "sales 001 Deng Yao"], ["昨天 18:55", "任务生成", "按销售填写时间生成普通回访任务", "系统"], ["昨天 18:23", "线索分配", "线索分配给 sales 001 Deng Yao", "系统"]],
      notes: [["昨天 18:56", "客户正在开会，约定今天17:30通过WhatsApp联系。", "sales 001 Deng Yao"], ["昨天 18:40", "用户主要关注日常通勤油耗和后备箱空间。", "sales 001 Deng Yao"]]
    },
    {
      id: "LEAD-1646", name: "Ricardo Sánchez", phone: "5533074481", source: "车型对比页", leadType: "待确认", brand: "MAZDA", series: "CX-5", model: "Signature",
      dealer: "Mazda Interlomas", address: "Vialidad de la Barranca 6", region: "Estado de México", price: "$739,900 MXN", rate: "15.80%", term: "60期", createdAt: "2026-09-01 09:14",
      state: "unfollowed", unreachableCount: 2,
      task: { id: "TASK-260902-034", code: "FOLLOW_UP", group: "普通回访", trigger: "累计第2次未接通", due: "2026-09-02 10:00" },
      operations: [["昨天 17:42", "跟进提交", "跟进结果：未接通（第2次），累计未接通次数更新为2", "sales 001 Deng Yao"], ["昨天 17:42", "任务生成", "生成普通回访任务，2小时后再次联系", "系统"], ["昨天 11:18", "跟进提交", "跟进结果：未接通（第1次）", "sales 001 Deng Yao"]],
      notes: [["昨天 17:43", "第二次拨打仍无人接听，WhatsApp消息未读。", "sales 001 Deng Yao"], ["昨天 11:20", "首次电话响铃后转入语音信箱。", "sales 001 Deng Yao"]]
    }
  ]
};
