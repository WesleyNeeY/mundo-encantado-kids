'use strict';
// Envia os avisos do Lume que já estão na hora. Roda numa tarefa agendada do GitHub
// (gratuita), usando a credencial de serviço guardada no segredo FIREBASE_SERVICE_ACCOUNT.
const {initializeApp,cert}=require('firebase-admin/app');
const {getFirestore}=require('firebase-admin/firestore');
const {getMessaging}=require('firebase-admin/messaging');

const APP_URL='https://wesleyneey.github.io/mundo-encantado-kids/assistente-lume/';
const raw=process.env.FIREBASE_SERVICE_ACCOUNT;
if(!raw){console.error('Segredo FIREBASE_SERVICE_ACCOUNT não configurado.');process.exit(1);}
initializeApp({credential:cert(JSON.parse(raw))});
const db=getFirestore(),messaging=getMessaging();
const LATE_LIMIT=60*60*1000; // aviso atrasado mais de 1h depois do compromisso é descartado
const DEAD_TOKEN=['messaging/registration-token-not-registered','messaging/invalid-registration-token','messaging/invalid-argument'];

function message(alarm){
  if(alarm.eventId==='test')return {title:'Assistente Lume',body:'As notificações do Lume estão funcionando.'};
  const when=new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(alarm.eventAt));
  const title=String(alarm.title||'Compromisso').slice(0,80)+(alarm.label==='1 dia'?' — amanhã':' — daqui a 2 horas');
  return {title,body:'Lembrete do Lume: '+when+'.'};
}

(async()=>{
  const now=Date.now();
  const due=await db.collection('alarms').where('dueAt','<=',now).orderBy('dueAt').limit(300).get();
  let sent=0,dropped=0,failed=0;
  const devices=new Map();
  for(const snap of due.docs){
    const alarm=snap.data();
    try{
      if(alarm.eventAt+LATE_LIMIT<now){await snap.ref.delete();dropped++;continue;}
      if(!devices.has(alarm.uid))devices.set(alarm.uid,(await db.doc('devices/'+alarm.uid).get()).data()||null);
      const device=devices.get(alarm.uid);
      if(!device||!device.enabled||!device.token){await snap.ref.delete();dropped++;continue;}
      const {title,body}=message(alarm);
      await messaging.send({token:device.token,notification:{title,body},webpush:{headers:{TTL:'3600',Urgency:'high'},notification:{tag:snap.id,icon:APP_URL+'icon-192.png'},fcmOptions:{link:APP_URL+'#agenda-page'}}});
      await snap.ref.delete();sent++;
    }catch(error){
      failed++;console.error('Falha no aviso',snap.id.slice(0,12)+'…',error.code||'',error.message);
      if(DEAD_TOKEN.includes(error.code)){
        await snap.ref.delete().catch(()=>{});
        await db.doc('devices/'+alarm.uid).set({enabled:false,updatedAt:Date.now()}).catch(()=>{});
        devices.set(alarm.uid,null);
      }
    }
  }
  console.log(`Avisos na hora: ${due.size} · enviados: ${sent} · descartados: ${dropped} · falhas: ${failed}`);
  if(failed&&!sent)process.exitCode=1;
})().catch(error=>{console.error(error);process.exit(1);});
