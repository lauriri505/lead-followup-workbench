/* Workbench v2026.10.12.1: conditional-form policy; no external delivery. */
(function(root){
  const results={
    unreachable:{label:'未接通',labelEs:'Sin respuesta',group:'pause',target:'dormantContact',task:'FOLLOW_UP',deadline:{type:'minutes',value:120},sequence:'unreachableCount'},
    missingInfo:{label:'信息待补充',labelEs:'Información pendiente',group:'pause',target:'dormantInfo',task:'FOLLOW_UP',deadline:{type:'minutes',value:120},sequence:'informationCount',requireNote:true},
    distantPurchase:{label:'购车计划较远',labelEs:'Compra a largo plazo',group:'pause',target:'dormantPlan',task:'FOLLOW_UP',deadline:{type:'manual'}},
    cash:{label:'全款购车',labelEs:'Compra de contado',group:'pause',target:'dormantCash',task:'FOLLOW_UP',deadline:{type:'manual'}},
    pauseOther:{label:'其他',labelEs:'Otro',group:'pause',target:'dormantOther',task:'FOLLOW_UP',deadline:{type:'manual'},requireNote:true},
    wrongNumber:{label:'号码错误',labelEs:'Número incorrecto',group:'lost',target:'lost',terminal:true,lostReason:'号码错误'},
    abandon:{label:'暂不买车',labelEs:'No comprará por ahora',group:'lost',target:'lost',terminal:true,lostReason:'暂不买车'},
    lostOther:{label:'其他',labelEs:'Otro',group:'lost',target:'lost',terminal:true,requireNote:true},
    readyToDistribute:{label:'可下发',labelEs:'Listo para enviar',group:'dispatch',target:'pendingDispatch',requireDealer:true}
  };
  function configure(base){
    const cfg=JSON.parse(JSON.stringify(base));
    cfg.policies.unreachableLimit=3;
    const sub={dormantContact:['未接通','Sin respuesta'],dormantInfo:['信息待补充','Información pendiente'],dormantPlan:['购车计划较远','Compra a largo plazo'],dormantOther:['其他','Otro']};
    for(const [code,[name,es]] of Object.entries(sub))cfg.states[code]={main:'暂存',sub:name,mainEs:'En pausa',subEs:es};
    cfg.states.pendingDispatch={main:'待下发',sub:'待处理',mainEs:'Pendiente de envío',subEs:'Por procesar'};
    for(const [code,r] of Object.entries(results))cfg.results[code]={...r,enabled:base.results[code]?.enabled!==false};
    const states=['unfollowed','overdue','followup','financeIntent','pendingSalesConfirmation','dormantCash','dormantTestDrive',...Object.keys(sub)];
    for(const state of states)cfg.routes[state]=Object.keys(results);
    cfg.routes.pendingDispatch=[];cfg.routes.baicIssued=[];cfg.routes.lost=[];
    // Versioned workbench rules only. Never overwrite saved legacy admin configuration.
    cfg.adminFlows=(cfg.adminFlows||[]).filter(f=>!states.includes(f.current));
    return cfg;
  }
  const api={configure,results};root.WorkbenchFlow=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
