'use strict';
const {createHash}=require('node:crypto');
const MAX_FUTURE=366*86400000;
function alarmId(uid,eventId,offset){return createHash('sha256').update(JSON.stringify([uid,eventId,offset])).digest('hex');}
function validateEvent(value,now=Date.now()){
  if(!value||typeof value.id!=='string'||!value.id||value.id.length>200)throw new Error('Identificador inválido');
  if(typeof value.title!=='string'||!value.title.trim()||value.title.length>200)throw new Error('Título inválido');
  if(!Number.isSafeInteger(value.at)||value.at<=now||value.at>now+MAX_FUTURE)throw new Error('Escolha uma data futura até um ano');
  if(typeof value.day!=='boolean'||typeof value.two!=='boolean')throw new Error('Selecione os avisos');
  return {id:value.id,title:value.title.trim(),at:value.at,day:value.day,two:value.two};
}
function planAlarms(uid,event,now=Date.now()){
  return [{enabled:event.day,offset:86400000,label:'1 dia'},{enabled:event.two,offset:7200000,label:'2 horas'}]
    .filter(a=>a.enabled&&event.at-a.offset>now)
    .map(a=>({id:alarmId(uid,event.id,a.offset),uid,eventId:event.id,title:event.title,eventAt:event.at,dueAt:event.at-a.offset,offset:a.offset,label:a.label}));
}
module.exports={alarmId,validateEvent,planAlarms};
