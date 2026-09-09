(function(root) {
  function analyze(records, filters) {
    const end = Date.parse(filters.asOf + 'T23:59:59.999-06:00');
    const rows = records.filter(r => (!filters.channel || r.channel === filters.channel) && (!filters.dealer || r.dealer === filters.dealer)).map(r => ({...r, events:r.events.filter(e=>Date.parse(e.at)<=end).sort((a,b)=>Date.parse(a.at)-Date.parse(b.at))})).filter(r=> {
      const issued=r.events.find(e=>e.type==='issued');
      return issued && (!filters.start || issued.at.slice(0,10)>=filters.start) && (!filters.end || issued.at.slice(0,10)<=filters.end);
    });
    const has=(r,t)=>r.events.some(e=>e.type===t);
    const quality=r=>r.events.filter(e=>['valid','invalid'].includes(e.type)).at(-1)?.type || 'unknown';
    const latest=r=>r.events.filter(e=>['won','lost','invalid','dormant','active'].includes(e.type)).at(-1)?.type || 'active';
    const groups={total:rows, valid:rows.filter(r=>quality(r)==='valid'),invalid:rows.filter(r=>quality(r)==='invalid'),unknown:rows.filter(r=>quality(r)==='unknown')};
    for(const type of ['assigned','contact','prospect','booked','arrived','testDriven','won']) groups[type]=rows.filter(r=>has(r,type));
    groups.pending=rows.filter(r=>!has(r,'contact'));
    groups.direct=groups.won.filter(r=>!has(r,'booked'));
    groups.wonWithoutVisit=groups.won.filter(r=>!has(r,'arrived'));
    groups.lost=rows.filter(r=>latest(r)==='lost');
    groups.dormant=rows.filter(r=>latest(r)==='dormant');
    groups.active=rows.filter(r=>latest(r)==='active');
    groups.overdue=groups.pending.filter(r=>end-Date.parse(r.events.find(e=>e.type==='issued').at)>72*3600000);
    groups.inProgress=groups.active.filter(r=>has(r,'contact'));
    const intersection=(a,b)=>a.filter(r=>b.includes(r)).length;
    const rates=[['有意向率',intersection(groups.valid,groups.prospect),groups.valid.length,'有效客户中曾确认意向 ÷ 有效客户'],['预约试驾率',intersection(groups.prospect,groups.booked),groups.prospect.length,'潜客中曾预约 ÷ 潜客'],['预约到店率',intersection(groups.booked,groups.arrived),groups.booked.length,'预约客户中已到店 ÷ 预约客户'],['到店成交率',intersection(groups.arrived,groups.won),groups.arrived.length,'到店客户中已成交 ÷ 到店客户'],['试驾成交率',intersection(groups.testDriven,groups.won),groups.testDriven.length,'实际试驾客户中已成交 ÷ 实际试驾客户'],['整体成交率',groups.won.length,rows.length,'本批次全部成交 ÷ 本批次下发']];
    const minutes=rows.flatMap(r=>{const assigned=r.events.find(e=>e.type==='assigned'); const first=r.events.find(e=>e.type==='contact'); return assigned&&first&&Date.parse(first.at)>=Date.parse(assigned.at)?[(Date.parse(first.at)-Date.parse(assigned.at))/60000]:[];});
    return {rows,groups,rates,average:minutes.length?minutes.reduce((a,b)=>a+b,0)/minutes.length:null,averageSamples:minutes.length};
  }
  root.CohortEngine={analyze};
})(typeof window==='undefined'?globalThis:window);
