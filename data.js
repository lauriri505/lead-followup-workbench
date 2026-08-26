window.CRM_DEMO_DATA = {
  salesperson: { id: "sales 001", name: "Deng Yao" },
  vehicleCatalog: {
    NISSAN: { "X-TRAIL": ["Advance 2 Row", "Exclusive CVT", "Platinum"], Kicks: ["Advance CVT", "Exclusive CVT"] },
    MAZDA: { "CX-30": ["i Sport", "i Grand Touring"], "CX-5": ["i Sport", "Signature"] },
    FORD: { Explorer: ["XLT", "Limited", "Platinum"], Territory: ["Trend", "Titanium"] },
    KIA: { Sportage: ["EX", "EX Pack", "SXL"], Seltos: ["EX", "SX"] },
    TOYOTA: { "Corolla Cross": ["LE", "XLE", "HEV"], RAV4: ["XLE", "Limited HEV"] },
    HONDA: { "CR-V": ["Turbo Plus", "Touring"], "HR-V": ["Uniq", "Touring"] },
    CHEVROLET: { Tracker: ["LT", "RS", "Premier"], Groove: ["LT", "Premier"] }
  },
  dealers: [
    { name: "Changan Polanco", brand: "NISSAN", region: "Ciudad de México", address: "Av. Ejército Nacional 843" },
    { name: "Nissan Polanco", brand: "NISSAN", region: "Ciudad de México", address: "Lago Alberto 320" },
    { name: "Nissan Satélite", brand: "NISSAN", region: "Estado de México", address: "Blvd. Manuel Ávila Camacho 2300" },
    { name: "Mazda Universidad", brand: "MAZDA", region: "Ciudad de México", address: "Av. Universidad 1000" },
    { name: "Mazda Interlomas", brand: "MAZDA", region: "Estado de México", address: "Vialidad de la Barranca 6" },
    { name: "Ford Dinastía", brand: "FORD", region: "Ciudad de México", address: "Calz. de Tlalpan 2750" },
    { name: "Ford Satélite", brand: "FORD", region: "Estado de México", address: "Circuito Centro Comercial 20" },
    { name: "KIA Lindavista", brand: "KIA", region: "Ciudad de México", address: "Av. Insurgentes Norte 1800" },
    { name: "KIA Metepec", brand: "KIA", region: "Estado de México", address: "Av. Tecnológico 1200" },
    { name: "Toyota Satélite", brand: "TOYOTA", region: "Estado de México", address: "Blvd. Manuel Ávila Camacho 2250" },
    { name: "Toyota Universidad", brand: "TOYOTA", region: "Ciudad de México", address: "Av. Universidad 936" },
    { name: "Honda Perisur", brand: "HONDA", region: "Ciudad de México", address: "Periférico Sur 3720" },
    { name: "Honda Interlomas", brand: "HONDA", region: "Estado de México", address: "Paseo de la Herradura 75" },
    { name: "Chevrolet Pedregal", brand: "CHEVROLET", region: "Ciudad de México", address: "Periférico Sur 4091" },
    { name: "Chevrolet Coacalco", brand: "CHEVROLET", region: "Estado de México", address: "Vía José López Portillo 101" }
  ],
  leads: [
    {
      id: "LEAD-1533", name: "Sofía Ramírez", phone: "5612345454", source: "车型详情页",
      leadType: "金融", brand: "NISSAN", series: "X-TRAIL", model: "Advance 2 Row",
      dealer: "Changan Polanco", address: "Av. Ejército Nacional 843", region: "Ciudad de México",
      price: "$589,900 MXN", rate: "14.99%", term: "72期", createdAt: "2026-08-25 09:30",
      original: { name: "Sofia Ramirez", phone: "5612345000", brand: "NISSAN", series: "Kicks", model: "Exclusive CVT", dealer: "Nissan Satélite", region: "Estado de México", address: "Blvd. Manuel Ávila Camacho 2300" },
      editRecords: [
        { time: "2026-08-25 09:45", operator: "sales 001 Deng Yao", changes: [
          { field: "车系", before: "Kicks", after: "X-TRAIL" },
          { field: "车型", before: "Exclusive CVT", after: "Advance 2 Row" }
        ] },
        { time: "2026-08-25 09:38", operator: "sales 001 Deng Yao", changes: [
          { field: "姓名", before: "Sofia Ramirez", after: "Sofía Ramírez" },
          { field: "手机号", before: "5612345000", after: "5612345454" },
          { field: "地区", before: "Estado de México", after: "Ciudad de México" }
        ] }
      ],
      state: "pending", unreachableCount: 0,
      orderStatusCode: "UNMARKED", orderStatusHistory: [],
      task: { id: "TASK-260825-001", group: "首次联系", trigger: "新线索已分配", due: "今天 10:00" },
      lastContact: "尚无联系记录",
      operations: [
        ["09:31", "线索分配", "系统按当前销售负载将线索分配给 sales 001 Deng Yao"],
        ["09:30", "线索创建", "用户从车型详情页提交金融咨询，意向车型为 NISSAN X-TRAIL Advance 2 Row"],
        ["09:30", "任务生成", "生成首次联系任务，要求在首响应时限内联系用户"]
      ],
      notes: [
        ["09:32", "用户在页面备注希望了解首付比例和月供区间。"],
        ["09:31", "线索来源参数显示用户重点浏览了 X-TRAIL 金融方案。"]
      ]
    },
    {
      id: "LEAD-1541", name: "Carlos Hernández", phone: "5587201136", source: "金融计算器",
      leadType: "金融", brand: "MAZDA", series: "CX-30", model: "i Grand Touring",
      dealer: "Mazda Universidad", address: "Av. Universidad 1000", region: "Ciudad de México",
      price: "$532,900 MXN", rate: "15.50%", term: "60期", createdAt: "2026-08-25 08:42",
      state: "following", unreachableCount: 1,
      orderStatusCode: "CREDIT_REVIEW", orderStatusUpdatedAt: "今天 10:25", orderStatusUpdatedBy: "sales 001 Deng Yao",
      orderStatusHistory: [{ from: "UNMARKED", to: "CREDIT_REVIEW", time: "今天 10:25", operator: "sales 001 Deng Yao" }],
      task: { id: "TASK-260825-008", group: "普通回访", trigger: "首次联系未接通", due: "今天 12:20" },
      lastContact: "拨打用户电话，无人接听。",
      operations: [
        ["10:20", "跟进提交", "跟进结果：未接通（第1次）；线索进入跟进中·已联系；未接通次数更新为1"],
        ["10:20", "任务完成", "首次联系任务已完成"],
        ["10:20", "任务生成", "生成普通回访任务；触发原因：首次联系未接通；截止时间：今天12:20"],
        ["08:45", "线索分配", "线索分配给 sales 001 Deng Yao"],
        ["08:42", "线索创建", "用户通过金融计算器提交 MAZDA CX-30 贷款咨询"]
      ],
      notes: [
        ["10:21", "电话响铃约30秒无人接听，暂未发送消息。"],
        ["08:46", "用户测算首付30%、60期方案，页面停留约6分钟。"],
        ["08:44", "用户所在地区为 Ciudad de México，优先安排本地经销商跟进。"]
      ]
    },
    {
      id: "LEAD-1560", name: "María González", phone: "5519083372", source: "WhatsApp活动页",
      leadType: "试驾", brand: "FORD", series: "Explorer", model: "Platinum",
      dealer: "Ford Dinastía", address: "Calz. de Tlalpan 2750", region: "Ciudad de México",
      price: "$1,439,000 MXN", rate: "—", term: "—", createdAt: "2026-08-24 16:05",
      state: "following", unreachableCount: 0,
      orderStatusCode: "CONTRACT_SIGNED", orderStatusUpdatedAt: "昨天 17:05", orderStatusUpdatedBy: "sales 001 Deng Yao",
      orderStatusHistory: [
        { from: "CREDIT_REVIEW", to: "CONTRACT_SIGNED", time: "昨天 17:05", operator: "sales 001 Deng Yao" },
        { from: "UNMARKED", to: "CREDIT_REVIEW", time: "昨天 16:40", operator: "sales 001 Deng Yao" }
      ],
      task: { id: "TASK-260825-011", group: "普通回访", trigger: "客户要求稍后联系", due: "今天 17:30" },
      lastContact: "我现在在开会，今天下午五点半以后再联系我。",
      operations: [
        ["昨天 16:28", "跟进提交", "跟进结果：要求稍后联系；线索状态保持跟进中·已联系"],
        ["昨天 16:28", "任务生成", "生成普通回访任务；截止时间采用销售填写的用户约定时间：今天17:30"],
        ["昨天 16:21", "跟进提交", "跟进结果：已沟通-有意向；用户希望安排 Explorer 试驾"],
        ["昨天 16:07", "线索分配", "线索分配给 sales 001 Deng Yao"],
        ["昨天 16:05", "线索创建", "用户从 WhatsApp 活动页提交试驾意向"]
      ],
      notes: [
        ["昨天 16:29", "我现在在开会，今天下午五点半以后再联系我。"],
        ["昨天 16:22", "周末方便到店，想先确认白色现车和试驾路线。"],
        ["昨天 16:18", "用户家庭用车，重点关注第三排空间和安全配置。"],
        ["昨天 16:10", "WhatsApp 已建立联系，用户回复较快。"]
      ]
    },
    {
      id: "LEAD-1577", name: "José Martínez", phone: "5544338210", source: "品牌落地页",
      leadType: "金融", brand: "KIA", series: "Sportage", model: "EX Pack",
      dealer: "KIA Lindavista", address: "Av. Insurgentes Norte 1800", region: "Ciudad de México",
      price: "$689,900 MXN", rate: "13.90%", term: "48期", createdAt: "2026-08-23 11:12",
      state: "following", unreachableCount: 0,
      orderStatusCode: "WAITING_DISBURSEMENT", orderStatusUpdatedAt: "昨天 15:20", orderStatusUpdatedBy: "sales 001 Deng Yao",
      orderStatusHistory: [
        { from: "CONTRACT_SIGNED", to: "WAITING_DISBURSEMENT", time: "昨天 15:20", operator: "sales 001 Deng Yao" },
        { from: "CREDIT_REVIEW", to: "CONTRACT_SIGNED", time: "08-24 11:30", operator: "sales 001 Deng Yao" }
      ],
      task: { id: "TASK-260825-015", group: "普通回访", trigger: "客户已沟通有意向", due: "今天 15:00" },
      lastContact: "首付预算约20%，请下午把48期和60期月供都发给我。",
      operations: [
        ["昨天 14:12", "跟进提交", "跟进结果：已沟通-有意向；状态保持跟进中·已联系"],
        ["昨天 14:12", "任务生成", "生成普通回访任务；采用客户承诺时间：今天15:00"],
        ["昨天 14:08", "用户信息变更", "意向车型由 Sportage EX 更新为 Sportage EX Pack"],
        ["08-23 11:16", "线索分配", "线索分配给 sales 001 Deng Yao"],
        ["08-23 11:12", "线索创建", "用户从品牌落地页提交金融购车意向"]
      ],
      notes: [
        ["昨天 14:13", "首付预算约20%，请下午把48期和60期月供都发给我。"],
        ["昨天 14:09", "用户确认更喜欢 EX Pack 的全景天窗和驾驶辅助配置。"],
        ["08-23 11:20", "家庭月收入约45,000 MXN，希望月供控制在12,000以内。"],
        ["08-23 11:18", "目前没有置换车辆。"]
      ]
    },
    {
      id: "LEAD-1602", name: "Ana López", phone: "5577610029", source: "车展二维码",
      leadType: "试驾", brand: "TOYOTA", series: "Corolla Cross", model: "HEV",
      dealer: "Toyota Satélite", address: "Blvd. Manuel Ávila Camacho 2250", region: "Estado de México",
      price: "$599,900 MXN", rate: "—", term: "—", createdAt: "2026-07-26 13:40",
      state: "testdrive", unreachableCount: 0,
      orderStatusCode: "UNMARKED", orderStatusHistory: [],
      task: { id: "TASK-260825-021", group: "普通回访", trigger: "暂存线索到期", due: "今天 11:00" },
      lastContact: "先安排试驾，购车时间可能在下个月。",
      operations: [
        ["07-26 14:08", "跟进提交", "跟进结果：试驾；线索转为暂存·试驾"],
        ["07-26 14:08", "任务生成", "生成30天后普通回访任务"],
        ["07-26 13:57", "跟进提交", "跟进结果：已沟通-有意向；用户暂未确定购车时间"],
        ["07-26 13:43", "线索分配", "线索分配给 sales 001 Deng Yao"],
        ["07-26 13:40", "线索创建", "用户扫描车展二维码提交试驾信息"]
      ],
      notes: [
        ["07-26 14:09", "先安排试驾，购车时间可能在下个月。"],
        ["07-26 14:00", "希望试驾混动版本，周六上午时间比较方便。"],
        ["07-26 13:52", "目前对 Corolla Cross 和 RAV4 都有兴趣。"],
        ["07-26 13:45", "用户住在 Satélite 附近，可到店距离较近。"]
      ]
    },
    {
      id: "LEAD-1618", name: "Luis Torres", phone: "5558104477", source: "经销商转介",
      leadType: "全款", brand: "HONDA", series: "CR-V", model: "Touring",
      dealer: "Honda Perisur", address: "Periférico Sur 3720", region: "Ciudad de México",
      price: "$839,900 MXN", rate: "—", term: "—", createdAt: "2026-07-25 12:10",
      state: "cash", unreachableCount: 1,
      orderStatusCode: "UNMARKED", orderStatusHistory: [],
      task: { id: "TASK-260825-025", group: "普通回访", trigger: "暂存线索到期", due: "今天 14:00" },
      lastContact: "不考虑贷款，等旧车出售后再决定。",
      operations: [
        ["07-25 12:48", "跟进提交", "跟进结果：已沟通-无意向；销售选择去向：确认全款"],
        ["07-25 12:48", "状态流转", "线索转为暂存·确认全款"],
        ["07-25 12:48", "任务生成", "生成30天后普通回访任务"],
        ["07-25 12:20", "跟进提交", "跟进结果：未接通（第1次）"],
        ["07-25 12:12", "线索分配", "线索分配给 sales 001 Deng Yao"]
      ],
      notes: [
        ["07-25 12:49", "不考虑贷款，等旧车出售后再决定。"],
        ["07-25 12:44", "旧车已经挂出出售，预计一个月内处理。"],
        ["07-25 12:36", "用户只接受黑色或深灰色外观。"],
        ["07-25 12:22", "首次电话无人接听，已通过 WhatsApp 留言。"]
      ]
    },
    {
      id: "LEAD-1630", name: "Fernanda Ruiz", phone: "5599021876", source: "内容文章页",
      leadType: "金融", brand: "NISSAN", series: "Kicks", model: "Exclusive CVT",
      dealer: "Nissan Polanco", address: "Lago Alberto 320", region: "Ciudad de México",
      price: "$548,900 MXN", rate: "16.20%", term: "60期", createdAt: "2026-07-24 18:22",
      state: "noIntent", unreachableCount: 1,
      orderStatusCode: "UNMARKED", orderStatusHistory: [],
      task: { id: "TASK-260825-029", group: "普通回访", trigger: "暂存线索到期", due: "今天 16:00" },
      lastContact: "近期预算不足，先暂停购车，后面情况合适再联系。",
      operations: [
        ["07-24 18:55", "跟进提交", "跟进结果：已沟通-无意向；原因：近期预算不足"],
        ["07-24 18:55", "状态流转", "线索转为暂存·无意向购买"],
        ["07-24 18:55", "任务生成", "生成30天后普通回访任务"],
        ["07-24 18:31", "跟进提交", "跟进结果：未接通（第1次）"],
        ["07-24 18:24", "线索分配", "线索分配给 sales 001 Deng Yao"]
      ],
      notes: [
        ["07-24 18:56", "近期预算不足，先暂停购车，后面情况合适再联系。"],
        ["07-24 18:51", "用户刚更换工作，希望收入稳定后再评估购车。"],
        ["07-24 18:42", "可接受二手车，但目前没有明确预算。"],
        ["07-24 18:33", "电话未接通，WhatsApp 消息显示已读。"]
      ]
    },
    {
      id: "LEAD-1646", name: "Ricardo Sánchez", phone: "5533074481", source: "车型对比页",
      leadType: "金融", brand: "CHEVROLET", series: "Tracker", model: "Premier",
      dealer: "Chevrolet Pedregal", address: "Periférico Sur 4091", region: "Ciudad de México",
      price: "$566,400 MXN", rate: "15.80%", term: "60期", createdAt: "2026-08-24 09:14",
      state: "following", unreachableCount: 2,
      orderStatusCode: "DISBURSEMENT_SUCCESS", orderStatusUpdatedAt: "今天 09:40", orderStatusUpdatedBy: "sales 001 Deng Yao",
      orderStatusHistory: [
        { from: "WAITING_DISBURSEMENT", to: "DISBURSEMENT_SUCCESS", time: "今天 09:40", operator: "sales 001 Deng Yao" },
        { from: "CONTRACT_SIGNED", to: "WAITING_DISBURSEMENT", time: "昨天 16:10", operator: "sales 001 Deng Yao" }
      ],
      task: { id: "TASK-260825-034", group: "普通回访", trigger: "累计第2次未接通", due: "今天 10:00" },
      lastContact: "第二次拨打仍无人接听，WhatsApp 消息未读。",
      operations: [
        ["昨天 17:42", "跟进提交", "跟进结果：未接通（第2次）；累计未接通次数更新为2"],
        ["昨天 17:42", "任务生成", "生成普通回访任务；触发原因：累计第2次未接通；截止时间：今天10:00"],
        ["昨天 11:18", "跟进提交", "跟进结果：未接通（第1次）；线索进入跟进中·已联系"],
        ["昨天 11:18", "任务生成", "生成普通回访任务；触发原因：首次联系未接通；截止时间：昨天13:18"],
        ["昨天 09:16", "线索分配", "线索分配给 sales 001 Deng Yao"]
      ],
      notes: [
        ["昨天 17:43", "第二次拨打仍无人接听，WhatsApp 消息未读。"],
        ["昨天 11:20", "首次电话响铃后转入语音信箱。"],
        ["昨天 09:22", "用户对比 Tracker 与 Kicks，重点查看后备箱空间。"],
        ["昨天 09:18", "页面留资未填写方便联系时间。"]
      ]
    }
  ]
};
