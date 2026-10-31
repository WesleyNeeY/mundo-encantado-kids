const {test}=require('node:test');const assert=require('node:assert/strict');
const {alarmId,validateEvent,planAlarms}=require('./policy');
const now=Date.UTC(2026,9,31,10),event={id:'consulta',title:'Consulta',at:Date.UTC(2026,10,2,17),day:true,two:true};
test('calcula um dia e duas horas antes sem depender de navegador aberto',()=>{const out=planAlarms('a',event,now);assert.deepEqual(out.map(a=>a.dueAt),[event.at-86400000,event.at-7200000]);});
test('identificadores isolam aparelhos e são idempotentes',()=>{assert.notEqual(alarmId('a','consulta',1),alarmId('b','consulta',1));assert.equal(alarmId('a','consulta',1),alarmId('a','consulta',1));});
test('não envia avisos de horário já passado',()=>{assert.equal(planAlarms('a',{...event,at:now+3600000},now).length,0);});
test('rejeita agendamento inválido e limites excessivos',()=>{for(const bad of [{...event,at:now-1},{...event,at:now+367*86400000},{...event,id:''},{...event,title:''}])assert.throws(()=>validateEvent(bad,now));});
