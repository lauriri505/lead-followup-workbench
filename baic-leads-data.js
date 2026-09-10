window.BAIC_LEADS_DEMO = Array.from({ length: 100 }, (_, index) => {
  const names = ["Jorge Navarro", "Valeria Cruz", "Luis Torres", "María González", "Diego Hernández", "Ana Martínez", "Carlos Mendoza", "Fernanda Ruiz", "Ricardo Sánchez", "Sofía Ramírez"];
  const phones = ["551000", "552100", "553200", "554300", "555400", "556500", "557600", "558700", "559800", "561900"];
  const series = ["BJ40", "X35", "EU5", "BJ30", "X55"]; const models = ["Honor", "Plus", "Premium", "旗舰版", "智享版"];
  const sources = ["官网", "Meta", "Google", "AutoCava"]; const types = ["买车", "试驾"];
  const statuses = ["待跟进", "跟进中", "暂存", "战败", "成交"]; const sales = ["sales 001 Deng Yao", "sales 002 María López", "sales 003 Carlos Ruiz"];
  const dealers = ["BAIC Polanco", "BAIC Santa Fe", "BAIC Coyoacán", "BAIC Guadalajara"];
  const day = String(1 + (index % 10)).padStart(2, "0"); const hour = String(8 + (index % 10)).padStart(2, "0");
  const status = statuses[index % statuses.length];
  const terminal = ["战败", "成交"].includes(status);
  return {
    id: `BAIC-LEAD-${String(index + 1).padStart(4, "0")}`,
    name: names[index % names.length], phone: `${phones[index % phones.length]}${String(1000 + index).padStart(4, "0")}`,
    type: types[index % types.length], series: series[index % series.length], model: models[index % models.length],
    source: sources[index % sources.length], status, sales: sales[index % sales.length],
    dealer: dealers[index % dealers.length], city: ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla"][index % 4],
    taskId: terminal ? "—" : `BAIC-TASK-${String(index + 1).padStart(4, "0")}`,
    task: terminal ? "—" : "普通回访", taskStatus: terminal ? "已完成" : ["待处理", "处理中", "已逾期"][index % 3],
    taskDueAt: terminal ? "—" : `2026-09-${String(2 + (index % 9)).padStart(2, "0")} ${String(9 + (index % 8)).padStart(2, "0")}:${String((index * 7) % 60).padStart(2, "0")}`,
    createdAt: `2026-09-${day} ${hour}:${String((index * 7) % 60).padStart(2, "0")}`
  };
});
