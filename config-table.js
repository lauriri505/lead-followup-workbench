/*
 * Static demo configuration table.
 * The workbench reads the same records that the admin console lists.
 * In production this object can be replaced by an API response without
 * changing the presentation layer.
 */
window.CRM_CONFIG_TABLE = {
  tenant: {
    id: "PLATFORM-AUTOCAVA",
    name: "AutoCava",
    scope: "普通线索一期平台数据"
  },
  leadProfiles: {
    "LEAD-1533": {
      name: "Sofía Ramírez",
      phone: "5612345454",
      source: "车型详情页",
      leadType: "待确认",
      brand: "NISSAN",
      series: "X-TRAIL",
      model: "Advance 2 Row",
      dealer: "Nissan Polanco",
      address: "Lago Alberto 320",
      region: "Ciudad de México",
      price: "$589,900 MXN",
      rate: "14.99%",
      term: "72期",
      state: "unfollowed"
    },
    "LEAD-1541": { name: "Luis Torres", phone: "5581267742", brand: "MAZDA", series: "CX-30", model: "i Grand Touring", state: "unfollowed" },
    "LEAD-1560": { name: "María González", phone: "5567342901", brand: "FORD", series: "Territory", model: "Titanium", state: "overdue" },
    "LEAD-1588": { name: "Diego Hernández", phone: "5576810394", brand: "KIA", series: "Sportage", model: "EX Pack", state: "financeIntent" },
    "LEAD-1602": { name: "Ana Martínez", phone: "5549081266", brand: "TOYOTA", series: "RAV4", model: "XLE", state: "dormantCash" },
    "LEAD-1614": { name: "Carlos Mendoza", phone: "5519236408", brand: "BAIC", series: "BJ40", model: "Honor", state: "dormantTestDrive" },
    "LEAD-1630": { name: "Fernanda Ruiz", phone: "5599021876", brand: "NISSAN", series: "Kicks", model: "Exclusive CVT", state: "followup" },
    "LEAD-1646": { name: "Ricardo Sánchez", phone: "5533074481", brand: "MAZDA", series: "CX-5", model: "Signature", state: "unfollowed" }
  }
};
