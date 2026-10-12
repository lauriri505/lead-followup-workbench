/* Pure configuration adapter, shared by the UI and regression tests. */
(function(root){
  const clone=v=>JSON.parse(JSON.stringify(v));
  const utc6=(date=new Date())=>new Date(date.getTime()-21600000).toISOString().slice(0,16);
  const parseTime=v=>v?new Date(v.replace(' ','T')+(/[Z]|[+-]\d\d:\d\d$/.test(v)?'':'-06:00')).getTime():NaN;
  const codes=(lead,cfg)=>(cfg.routes[lead.state]||[]).filter(c=>cfg.results[c]&&cfg.results[c].enabled!==false);
  function transition(lead,code,cfg,now=new Date()){
    if(!codes(lead,cfg).includes(code))throw Error('当前状态不允许这个跟进结果，请重新选择');
    const r=cfg.results[code],f=(cfg.adminFlows||[]).find(x=>x.current===lead.state&&x.result===code),rule=(cfg.adminTaskRules||[]).find(x=>x.id===f?.taskRuleId&&x.enabled!==false);
    const count=Number(lead.unreachableCount||0)+(code==='unreachable'?1:0),limit=Number(f?.terminalAt||cfg.policies.unreachableLimit||3);
    if(code==='unreachable'&&count>=limit)return{state:f?.terminalNext||'lost',terminal:true,reason:limit+'次未接通',count,taskCode:null,systemLost:true};
    let state=f?.next||r.target||lead.state;if(state==='same')state=lead.state;
    if(code==='unreachable'&&!r.group&&!f&&!['unfollowed','overdue'].includes(lead.state))state=lead.state;
    let timing=r.deadline;const text=rule?.deadline||f?.deadline||'';
    if(text.includes('手动'))timing={type:'manual'};
    else if(/(\d+)\s*天/.test(text))timing={type:'days',value:Number(text.match(/(\d+)\s*天/)[1])};
    else if(/(\d+)\s*小时/.test(text))timing={type:'minutes',value:Number(text.match(/(\d+)\s*小时/)[1])*60};
    else if(/(\d+)\s*分钟/.test(text))timing={type:'minutes',value:Number(text.match(/(\d+)\s*分钟/)[1])};
    if(r.sequence)timing={type:'minutes',value:Number(lead[r.sequence]||0)===0?120:1440};
    const taskCode=f&&Object.hasOwn(f,'task')?f.task:r.task;
    const due=!timing||['none','manual'].includes(timing.type)?'':utc6(new Date(now.getTime()+Number(timing.value||0)*(timing.type==='days'?86400000:60000)));
    return{state,terminal:Boolean(r.terminal||cfg.states[state]?.terminal),reason:r.lostReason||'',count,taskCode,taskName:rule?.type||cfg.taskTypes[taskCode]?.name||'',due,manual:timing?.type==='manual',requireReason:Boolean(f?.reason||r.requireReason),requireDealer:Boolean(f?.requireDealer||r.requireDealer),requireNote:Boolean(r.requireNote)};
  }
  function group(code,cfg){const r=cfg.results[code];if(r.group)return r.group;if(code==='unreachable')return'unreachable';if(r.terminal||cfg.states[r.target]?.terminal||/战败/.test(r.label))return'lost';if(r.requireDealer||/下发/.test(r.label))return'dispatch';if(/dormant/.test(r.target||'')||/暂存|想法没有改变/.test(r.label))return'pause';if(code==='financeInterest')return'finance';return code;}
  function normalize(lead){const x=clone(lead);x.operations=x.operations||[];x.notes=x.notes||[];x.city=x.city||x.region||'';x.purchaseDate=x.purchaseDate||'';
    if(!x.intentions)x.intentions=[{...clone(x),id:x.id+'-INTENT',operations:undefined,notes:undefined,task:undefined,editRecords:undefined,original:undefined}];
    x.originalSnapshot=x.originalSnapshot||{name:x.original?.name||x.name,phone:x.original?.phone||x.phone,city:x.original?.region||x.city,purchaseDate:x.purchaseDate,intentions:clone(x.intentions)};x.editRecords=x.editRecords||[];x.taskHistory=x.taskHistory||[];return x;}
  const api={clone,utc6,parseTime,codes,transition,group,normalize};root.WorkbenchCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
