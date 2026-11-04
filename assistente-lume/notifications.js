(function(){
'use strict';
// Avisos do Lume sem servidor pago: o aparelho grava seus avisos no Firestore
// (plano gratuito) e uma tarefa agendada no GitHub envia as notificações.
var SDK='https://www.gstatic.com/firebasejs/13.1.0/';
var DAY=86400000,TWO_HOURS=7200000,OFFSETS=[[DAY,'1 dia'],[TWO_HOURS,'2 horas']];
var base=new URL('./',document.currentScript.src),config=null,user=null,messaging=null,registration=null,fs=null,db=null,messagingMod=null,boot=null;
var status=document.getElementById('push-status');
function show(text){status.textContent=text;}
function standalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function isiOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function setupReady(){return !!(config&&config.enabled&&config.vapidKey);}
async function initialize(){
 if(boot)return boot;
 boot=(async function(){
  if(!setupReady())throw Error('O serviço de avisos ainda está em configuração. Nenhum aviso foi ativado.');
  var modules=await Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-auth.js'),import(SDK+'firebase-messaging.js'),import(SDK+'firebase-firestore.js')]);
  var authMod=modules[1];messagingMod=modules[2];fs=modules[3];
  if(!await messagingMod.isSupported())throw Error('Este navegador não oferece notificações compatíveis.');
  var app=modules[0].initializeApp(config.firebase,'lume-notifications');var auth=authMod.getAuth(app);
  await authMod.setPersistence(auth,authMod.browserLocalPersistence);
  user=auth.currentUser||(await authMod.signInAnonymously(auth)).user;
  db=fs.getFirestore(app);
  registration=await navigator.serviceWorker.register(new URL('firebase-messaging-sw.js',base).href,{scope:base.pathname});await navigator.serviceWorker.ready;messaging=messagingMod.getMessaging(app);
  messagingMod.onMessage(messaging,function(payload){var n=payload.notification||{};show((n.title?n.title+' — ':'')+(n.body||'Você recebeu um aviso do Lume.'));});
 })().catch(function(error){boot=null;throw error;});return boot;
}
function alarmRef(eventId,offset){return fs.doc(db,'alarms',user.uid+'_'+String(eventId).replace(/\//g,'-')+'_'+offset);}
function friendly(error){var m=String(error&&error.message||error||'');if(/permission|insufficient/i.test(m))return 'O serviço de avisos recusou o pedido. Tente desativar e ativar os avisos de novo.';if(/offline|network|unavailable|failed to fetch/i.test(m))return 'Sem conexão. Confira a internet e tente novamente.';return m||'Não foi possível falar com o serviço de avisos.';}
async function enable(){
 if(isiOS()&&!standalone())throw Error('No Safari: Compartilhar → Adicionar à Tela de Início. Abra o Lume pelo ícone e volte aqui para permitir os avisos.');
 if(!setupReady())throw Error('O serviço de avisos ainda está em configuração. Nenhum aviso foi ativado.');
 if(!('Notification'in window)||!('serviceWorker'in navigator))throw Error('Use um navegador com suporte a notificações.');
 // O pedido de permissão fica direto no toque do usuário (exigência do iPhone).
 var permission=await Notification.requestPermission();if(permission!=='granted')throw Error('A permissão não foi concedida. Ajuste as notificações do Lume no aparelho.');
 await initialize();var token=await messagingMod.getToken(messaging,{vapidKey:config.vapidKey,serviceWorkerRegistration:registration});if(!token)throw Error('Não foi possível registrar este aparelho.');
 await fs.setDoc(fs.doc(db,'devices',user.uid),{token:token,enabled:true,updatedAt:Date.now()});
 localStorage.setItem('lume-push-enabled','1');show('Aparelho cadastrado. Faça o teste com o Lume fechado antes de confiar nos avisos.');window.dispatchEvent(new Event('lume-push-enabled'));var dot=document.getElementById('push-dot');if(dot)dot.hidden=true;document.getElementById('push-test').disabled=false;document.getElementById('push-disable').disabled=false;
}
window.LumeNotifications={
 ready:function(){return setupReady()&&localStorage.getItem('lume-push-enabled')==='1';},
 sync:async function(event){
  if(!this.ready())return {scheduled:false};
  try{
   await initialize();
   var at=new Date(event.date+'T'+event.time+':00').getTime(),now=Date.now(),alarms=[];
   if(!isFinite(at)||at<=now)throw Error('Escolha uma data e um horário no futuro.');
   if(at>now+366*DAY)throw Error('Os avisos podem ser programados para até um ano.');
   var title=String(event.title||'Compromisso').trim().slice(0,200)||'Compromisso',wanted={};wanted[DAY]=!!event.day;wanted[TWO_HOURS]=!!event.two;
   for(var i=0;i<OFFSETS.length;i++){
    var offset=OFFSETS[i][0],due=at-offset,ref=alarmRef(event.uid,offset);
    if(wanted[offset]&&due>now){await fs.setDoc(ref,{uid:user.uid,eventId:String(event.uid),title:title,eventAt:at,dueAt:due,label:OFFSETS[i][1]});alarms.push({at:due,label:OFFSETS[i][1]});}
    else await fs.deleteDoc(ref);
   }
   if(!alarms.length)throw Error('Os horários dos avisos já passaram. Escolha um compromisso mais adiante.');
   return {scheduled:true,alarms:alarms};
  }catch(error){throw Error(friendly(error));}
 },
 cancel:async function(event){
  if(!this.ready())return;
  try{await initialize();for(var i=0;i<OFFSETS.length;i++)await fs.deleteDoc(alarmRef(event.uid,OFFSETS[i][0]));}catch(error){throw Error(friendly(error));}
 }
};
document.getElementById('push-enable').onclick=function(){enable().catch(function(error){show(friendly(error));});};
document.getElementById('push-test').onclick=async function(){try{await initialize();var now=Date.now();await fs.setDoc(alarmRef('teste',Math.floor(now/60000)),{uid:user.uid,eventId:'test',title:'Teste do Lume',eventAt:now+60000,dueAt:now+60000,label:'teste'});show('Teste programado. Feche o Lume e aguarde: o aviso chega em até uns 15 minutos. Só considere validado quando receber a notificação.');}catch(error){show(friendly(error));}};
document.getElementById('push-disable').onclick=async function(){try{await initialize();await fs.setDoc(fs.doc(db,'devices',user.uid),{enabled:false,updatedAt:Date.now()});if(messaging)await messagingMod.deleteToken(messaging);localStorage.removeItem('lume-push-enabled');show('Avisos desativados neste aparelho.');document.getElementById('push-test').disabled=true;}catch(error){show(friendly(error));}};
fetch(new URL('notification-config.json',base),{cache:'no-store'}).then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(data){config=data;if(!setupReady()){show('Envio de notificações ainda não ativado. A preparação do serviço está pendente.');return;}var dot=document.getElementById('push-dot');if(dot)dot.hidden=localStorage.getItem('lume-push-enabled')==='1';if(localStorage.getItem('lume-push-enabled')==='1')show('Avisos ativos neste aparelho. Use Enviar teste para conferir a entrega.');else show('Adicione à tela inicial e toque em Permitir avisos.');document.getElementById('push-enable').disabled=false;document.getElementById('push-test').disabled=localStorage.getItem('lume-push-enabled')!=='1';document.getElementById('push-disable').disabled=localStorage.getItem('lume-push-enabled')!=='1';}).catch(function(){show('Não foi possível consultar o serviço de avisos. Tente novamente mais tarde.');});
})();
