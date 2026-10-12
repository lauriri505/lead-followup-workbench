const {test}=require('node:test');
const assert=require('node:assert/strict');
const C=require('../workbench-core.js');
const recipients={active:{emails:['baic.leads@example.com']},trial:{emails:['trial.sales@example.com']},inactive:{emails:['new.partner@example.com']}};
const lead={id:'TEST-1',name:'Demo',phone:'5510000000'};
const now=new Date('2026-10-12T18:00:00Z');
test('active partner records email and API as pending, not sent',()=>{
 const r=C.buildDispatch('active',recipients.active.emails[0],recipients,lead,now);
 assert.equal(r.method,'email-and-api');assert.equal(r.actions.email,'pending');assert.equal(r.actions.api,'pending');assert.equal(r.saleListing,null);assert.equal(r.demo,true);
});
test('trial records only email',()=>{
 const r=C.buildDispatch('trial',recipients.trial.emails[0],recipients,lead,now);
 assert.equal(r.method,'email');assert.equal(r.actions.api,'not_applicable');assert.equal(r.saleListing,null);
});
test('inactive partner creates sale listing with pending email',()=>{
 const r=C.buildDispatch('inactive',recipients.inactive.emails[0],recipients,lead,now);
 assert.equal(r.method,'email-and-sale-table');assert.equal(r.actions.email,'pending');assert.equal(r.actions.saleTable,'saved_locally');
 assert.equal(r.saleListing.leadId,lead.id);assert.equal(r.saleListing.status,'pending_sale');assert.equal(r.saleListing.createdAt,now.toISOString());
});
test('requires known cooperation and matching email, rejecting stale or injected values',()=>{
 for(const [group,email]of [['',''],['unknown','x@example.com'],['trial',recipients.active.emails[0]],['active',''],['__proto__','x@example.com']])
 assert.throws(()=>C.buildDispatch(group,email,recipients,lead,now));
});
