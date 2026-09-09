// Explicit historical fixtures for dashboard demonstration only; not sales-state updates.
window.COHORT_DEMO = {
  updatedAt: '2026-09-09T18:00:00-06:00',
  records: [
    ['LEAD-1668',0,'Meta',[['issued','01 09:00'],['assigned','01 09:10'],['contact','01 09:40'],['valid','01 09:40'],['prospect','01 09:40'],['booked','02 10:00'],['arrived','04 10:00'],['testDriven','04 10:30'],['won','08 11:00']]],
    ['LEAD-1697',1,'Google',[['issued','01 09:00'],['assigned','01 09:15'],['contact','01 10:00'],['valid','01 10:00'],['prospect','02 10:00'],['arrived','03 11:00'],['won','07 11:00']]],
    ['LEAD-1636',2,'AutoCava',[['issued','01 10:00'],['assigned','01 10:00'],['contact','02 10:00'],['valid','02 10:00'],['prospect','02 10:00'],['booked','03 10:00'],['booked','04 10:00'],['arrived','05 10:00'],['lost','06 11:00','明确拒绝']]],
    ['LEAD-1665',0,'Google',[['issued','01 11:00'],['assigned','01 11:10'],['contact','01 12:00'],['invalid','01 12:00','号码错误']]],
    ['LEAD-1695',1,'Meta',[['issued','01 12:00'],['assigned','01 12:00'],['contact','01 12:30'],['contact','01 14:30'],['contact','02 10:00'],['invalid','02 10:00','3次未接通']]],
    ['LEAD-1692',2,'Meta',[['issued','01 13:00'],['assigned','01 13:10']]],
    ['LEAD-1631',0,'AutoCava',[['issued','01 14:00'],['assigned','01 14:05'],['contact','01 14:35'],['valid','01 14:35'],['prospect','01 14:35'],['dormant','03 11:00']]],
    ['LEAD-1660',1,'Google',[['issued','02 09:00'],['assigned','02 09:10'],['contact','02 09:30'],['valid','02 09:30'],['prospect','03 10:00'],['booked','05 10:00']]],
    ['LEAD-1689',2,'AutoCava',[['issued','02 10:00'],['assigned','02 10:10'],['contact','02 10:40'],['valid','02 10:40'],['prospect','03 10:00'],['booked','04 10:00'],['arrived','06 10:00'],['testDriven','06 10:30']]],
    ['LEAD-1614',0,'Meta',[['issued','09 09:00']]]
  ].map(([leadId,store,channel,events]) => ({leadId,store,channel,events:events.map(([type,date,reason],i)=>({type,at:`2026-09-${date.replace(' ','T')}:00-06:00`,reason,taskId:type==='contact'?`${leadId}-T${i}`:null}))}))
};
