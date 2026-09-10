(function(root) {
  function analyze(records, filters) {
    const end = Date.parse(filters.asOf + 'T23:59:59.999-06:00');
    const rows = records.filter(r => (!filters.channel || r.channel === filters.channel) && (!filters.dealer || r.dealer === filters.dealer)).map(r => ({...r, events:r.events.filter(e=>Date.parse(e.at)<=end).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))})).filter(r=> {
      const issued=r.events.find(e=>e.type==='issued');
      return issued && (!filters.start || issued.at.slice(0,10)>=filters.start);
    });
    const has=(r,t)=>r.events.some(e=>e.type===t);
    const reasonMatches=(reason,values)=>values.some(value=>String(reason||'').includes(value));
    const validLostReasons=['明确拒绝','购买其他品牌','已购买其他品牌'];
    const invalidLostReasons=['3次未接通','号码错误'];
    const latestOutcome=r=>r.events.filter(e=>['won','lost','invalid','dormant','active'].includes(e.type)).at(-1);
    const quality=r=>{
      const outcome=latestOutcome(r);
      if(outcome&&reasonMatches(outcome.reason,invalidLostReasons))return 'invalid';
      if(has(r,'prospect')||(outcome&&outcome.type==='lost'&&reasonMatches(outcome.reason,validLostReasons)))return 'valid';
      return 'unknown';
    };
    const latest=r=>latestOutcome(r)?.type || 'active';
    const groups={total:rows, valid:rows.filter(r=>quality(r)==='valid'),invalid:rows.filter(r=>quality(r)==='invalid'),unknown:rows.filter(r=>quality(r)==='unknown')};
    for(const type of ['assigned','contact','prospect','booked','arrived','testDriven','won']) groups[type]=rows.filter(r=>has(r,type));
    groups.pending=rows.filter(r=>!has(r,'contact'));
    groups.direct=groups.won.filter(r=>!has(r,'booked'));
    groups.wonWithoutVisit=groups.won.filter(r=>!has(r,'arrived'));
    groups.lost=rows.filter(r=>['lost','invalid'].includes(latest(r)));
    groups.dormant=rows.filter(r=>latest(r)==='dormant');
    groups.active=rows.filter(r=>latest(r)==='active');
    groups.overdue=groups.pending.filter(r=>end-Date.parse(r.events.find(e=>e.type==='issued').at)>72*3600000);
    groups.inProgress=groups.contact;
    const intersection=(a,b)=>a.filter(r=>b.includes(r)).length;
    const rates=[['已跟进：有意向潜客率',groups.prospect.length,groups.valid.length,'有意向潜客 ÷ 有效线索'],['预约试驾率',groups.booked.length,groups.prospect.length,'已预约试驾 ÷ 有意向潜客'],['预约到店率',groups.arrived.length,groups.booked.length,'已到店 ÷ 已预约试驾'],['到店成交率',intersection(groups.arrived,groups.won),groups.arrived.length,'已到店且成交 ÷ 已到店'],['整体成交率',groups.won.length,rows.length,'已成交 ÷ 下发线索']];
    const minutes=rows.flatMap(r=>{const assigned=r.events.find(e=>e.type==='assigned'); const first=r.events.find(e=>e.type==='contact'); return assigned&&first&&Date.parse(first.at)>=Date.parse(assigned.at)?[(Date.parse(first.at)-Date.parse(assigned.at))/60000]:[];});
    return {rows,groups,rates,average:minutes.length?minutes.reduce((a,b)=>a+b,0)/minutes.length:null,averageSamples:minutes.length};
  }
  root.CohortEngine={analyze};
})(typeof window==='undefined'?globalThis:window);
