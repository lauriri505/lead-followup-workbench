/* UI-only dictionaries; transitions still come from flow-config.js. */
window.WORKBENCH_CONFIG = {
  version:'2026.10.12.2',storageKey:'autocava.workbench.figma.v1',
  partners:{BAIC:{status:'active'}}, // Demo fixture; other brands require explicit configuration.
  financeEvents:['补充金融资料','确认金融方案','跟进审批进度'],recipients:[],
  cities:['La Paz','Ciudad de México','Monterrey','Guadalajara','Mérida','Querétaro'],
  catalog:{MG:{MG5:['Excite','Elegance']},Chevrolet:{Onix:['LS','LT','Premier']},Renault:{Kwid:['Intens','Iconic']}},
  dealers:[{name:'MG La Paz',brand:'MG',city:'La Paz',province:'Baja California Sur',address:'Boulevard Constituyentes de 1975 4655, El Conchalito'},{name:'Chevrolet La Paz',brand:'Chevrolet',city:'La Paz',province:'Baja California Sur',address:''},{name:'Renault La Paz',brand:'Renault',city:'La Paz',province:'Baja California Sur',address:''}],
  // Additional Figma fixture. Never replace or merge existing leads by name/phone.
  demoUser:{id:'DEMO-FIGMA-001',name:'Jorge Navarro',phone:'5510012193',city:'La Paz',purchaseDate:'',state:'pendingSalesConfirmation',unreachableCount:0,createdAt:'2026-10-10 08:56',task:{id:'DEMO-TASK-041',code:'FIRST_CONTACT',group:'首次联系',due:'2026-10-10 09:26'},operations:[['2026-10-10 09:50','销售确认任务生成','线索已进入待销售确认，等待确认是否可下发北汽','系统']],notes:[],intentions:[
    {id:'DEMO-INTENT-001',brand:'MG',series:'MG5',model:'',leadType:'金融',source:'榜单页',createdAt:'2026-10-10 08:56',dealer:'MG La Paz',city:'La Paz',province:'Baja California Sur',address:'Boulevard Constituyentes de 1975 4655, El Conchalito'},
    {id:'DEMO-INTENT-002',brand:'Chevrolet',series:'Onix',model:'',leadType:'金融',source:'车系页',createdAt:'2026-10-09 14:30',dealer:'',city:'La Paz'},
    {id:'DEMO-INTENT-003',brand:'Renault',series:'Kwid',model:'',leadType:'试驾',source:'车型页',createdAt:'2026-10-08 16:20',dealer:'',city:'La Paz',trialTime:'',trialNote:''}
  ]}
};
