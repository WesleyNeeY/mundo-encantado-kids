'use strict';
const {initializeApp}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getMessaging}=require('firebase-admin/messaging');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const {onRequest}=require('firebase-functions/v2/https');
const {onSchedule}=require('firebase-functions/v2/scheduler');
const {createHash,randomUUID}=require('node:crypto');
const {alarmId,validateEvent,planAlarms}=require('./policy');
initializeApp();const db=getFirestore();
const APP_URL='https://wesleyneey.github.io/mundo-encantado-kids/assistente-lume/';
const hash=s=>createHash('sha256').update(s).digest('hex');
exports.lumeApi=onRequest({region:'southamerica-east1',maxInstances:2,timeoutSeconds:30,memory:'256MiB',cors:['https://wesleyneey.github.io']},async(req,res)=>{
  if(req.method!=='POST'){res.status(405).json({error:'Use POST'});return;}
  let uid;
  try{const match=(req.headers.authorization||'').match(/^Bearer (.+)$/);if(!match)throw Error();uid=(await getAuth().verifyIdToken(match[1])).uid;}catch{res.status(401).json({error:'Identificação do aparelho necessária'});return;}
  if(Buffer.byteLength(JSON.stringify(req.body||{}))>12000){res.status(413).json({error:'Pedido grande demais'});return;}
  const device=db.doc(`devices/${uid}`),body=req.body||{},now=Date.now();
  try{
    // Limite de gravações por aparelho; ID vem exclusivamente do token verificado.
    await db.runTransaction(async tx=>{const snap=await tx.get(device),d=snap.data()||{},minute=Math.floor(now/60000);const count=d.minute===minute?(d.count||0)+1:1;if(count>30)throw Error('Aguarde um minuto');tx.set(device,{minute,count,updatedAt:now},{merge:true});});
    if(body.action==='register'){
      if(typeof body.token!=='string'||body.token.length<30||body.token.length>4096)throw Error('Token de notificação inválido');
      await device.set({token:body.token,enabled:true,updatedAt:now},{merge:true});res.json({registered:true});return;
    }
    const deviceData=(await device.get()).data();
    if(!deviceData?.enabled||!deviceData.token)throw Error('Ative as notificações neste aparelho');
    if(body.action==='disable'){await device.set({enabled:false,token:FieldValue.delete()},{merge:true});res.json({disabled:true});return;}
    if(body.action==='test'){
      const id=hash(uid+':test:'+Math.floor(now/60000));await db.doc(`alarms/${id}`).set({uid,eventId:'test',title:'Teste do Lume',eventAt:now+60000,dueAt:now+60000,label:'teste',state:'pending',attempts:0});res.json({queued:true,scheduledAt:now+60000});return;
    }
    if(body.action==='cancel'){
      if(typeof body.id!=='string'||body.id.length>200)throw Error('Identificador inválido');
      const batch=db.batch();for(const offset of [86400000,7200000])batch.delete(db.doc(`alarms/${alarmId(uid,body.id,offset)}`));batch.delete(db.doc(`devices/${uid}/events/${hash(body.id)}`));await batch.commit();res.json({cancelled:true});return;
    }
    if(body.action!=='schedule')throw Error('Ação inválida');
    const event=validateEvent(body.event,now),alarms=planAlarms(uid,event,now);if(!alarms.length)throw Error('Os horários dos avisos já passaram. Escolha um compromisso mais adiante.');
    const eventRef=db.doc(`devices/${uid}/events/${hash(event.id)}`),version=randomUUID();
    await db.runTransaction(async tx=>{
      const [old,collection]=await Promise.all([tx.get(eventRef),tx.get(db.collection(`devices/${uid}/events`).limit(51))]);if(!old.exists&&collection.size>=50)throw Error('Limite de 50 compromissos por aparelho');
      tx.set(eventRef,{...event,version,updatedAt:now});for(const offset of [86400000,7200000])tx.delete(db.doc(`alarms/${alarmId(uid,event.id,offset)}`));for(const alarm of alarms)tx.set(db.doc(`alarms/${alarm.id}`),{...alarm,version,state:'pending',attempts:0,updatedAt:now});
    });
    res.json({scheduled:true,alarms:alarms.map(a=>({at:a.dueAt,label:a.label})),version});
  }catch(error){res.status(400).json({error:error.message||'Não foi possível salvar o aviso'});}
});
exports.lumeDispatch=onSchedule({schedule:'every 1 minutes',timeZone:'America/Sao_Paulo',region:'southamerica-east1',maxInstances:1,timeoutSeconds:120,memory:'256MiB',retryCount:1},async()=>{
  const now=Date.now();const due=await db.collection('alarms').where('dueAt','<=',now).limit(100).get();
  for(const snap of due.docs){
    const lease=randomUUID();
    const alarm=await db.runTransaction(async tx=>{const current=await tx.get(snap.ref);const data=current.data();if(!data||!data.dueAt||data.dueAt>now||data.leaseUntil>now)return null;tx.update(snap.ref,{lease,leaseUntil:now+180000,state:'sending'});return data;});
    if(!alarm)continue;
    let failure=null;
    try{
      const device=(await db.doc(`devices/${alarm.uid}`).get()).data();
      const event=alarm.eventId==='test'?null:(await db.doc(`devices/${alarm.uid}/events/${hash(alarm.eventId)}`).get()).data();
      if(!device?.enabled||!device.token||(alarm.eventId!=='test'&&(!event||event.version!==alarm.version)))throw Object.assign(Error('Cancelado'),{permanent:true});
      if(alarm.eventAt+3600000<now)throw Object.assign(Error('Expirado'),{permanent:true});
      const body=alarm.eventId==='test'?'As notificações do Lume estão funcionando.':'Você tem um compromisso em '+alarm.label+'. Abra o Lume para conferir.';
      await getMessaging().send({token:device.token,notification:{title:'Assistente Lume',body},webpush:{headers:{TTL:'3600'},notification:{tag:snap.id,icon:APP_URL+'icon-192.png'},fcmOptions:{link:APP_URL+'#agenda-page'}}});
    }catch(error){failure=error;}
    // A edição/exclusão concorrente do compromisso não pode recriar o aviso antigo.
    await db.runTransaction(async tx=>{const current=await tx.get(snap.ref);const data=current.data();if(!data||data.lease!==lease)return;
      const attempts=(data.attempts||0)+1,permanent=failure&&(failure.permanent||['messaging/registration-token-not-registered','messaging/invalid-registration-token'].includes(failure.code));
      if(failure&&!permanent&&attempts<5)tx.update(snap.ref,{state:'pending',attempts,dueAt:Date.now()+60000*Math.pow(2,attempts),leaseUntil:0});else tx.update(snap.ref,{state:failure?'failed':'sent',attempts,dueAt:FieldValue.delete(),leaseUntil:0,finishedAt:Date.now()});
    });
  }
});
