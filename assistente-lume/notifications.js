(function(){
'use strict';
var base=new URL('./',document.currentScript.src),config=null,user=null,messaging=null,registration=null,authMod=null,messagingMod=null,boot=null;
var status=document.getElementById('push-status');
function show(text){status.textContent=text;}
function standalone(){return window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;}
function isiOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);}
function setupReady(){return !!(config&&config.enabled&&config.apiUrl&&config.vapidKey);}
async function initialize(){
 if(boot)return boot;
 boot=(async function(){
  if(!setupReady())throw Error('O serviço de avisos ainda está em configuração. Nenhum aviso foi ativado.');
  const modules=await Promise.all([import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging.js')]);
  authMod=modules[1];messagingMod=modules[2];if(!await messagingMod.isSupported())throw Error('Este navegador não oferece notificações compatíveis.');
  var app=modules[0].initializeApp(config.firebase,'lume-notifications');var auth=authMod.getAuth(app);await authMod.setPersistence(auth,authMod.browserLocalPersistence);user=(await authMod.signInAnonymously(auth)).user;
  registration=await navigator.serviceWorker.register(new URL('firebase-messaging-sw.js',base).href,{scope:base.pathname});await navigator.serviceWorker.ready;messaging=messagingMod.getMessaging(app);
  messagingMod.onMessage(messaging,function(payload){show(payload.notification&&payload.notification.body||'Você recebeu um aviso do Lume.');});
 })().catch(function(error){boot=null;throw error;});return boot;
}
async function api(body){await initialize();var token=await user.getIdToken();var response=await fetch(config.apiUrl,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});var data=await response.json();if(!response.ok)throw Error(data.error||'Não foi possível conectar ao envio dos avisos.');return data;}
async function enable(){
 if(isiOS()&&!standalone())throw Error('No Safari: Compartilhar → Adicionar à Tela de Início. Abra o Lume pelo ícone e volte aqui para permitir os avisos.');
 if(!setupReady())throw Error('O serviço de avisos ainda está em configuração. Nenhum aviso foi ativado.');
 if(!('Notification'in window)||!('serviceWorker'in navigator))throw Error('Use um navegador com suporte a notificações.');
 // This permission request stays directly in the user click handler.
 var permission=await Notification.requestPermission();if(permission!=='granted')throw Error('A permissão não foi concedida. Ajuste as notificações do Lume no aparelho.');
 await initialize();var token=await messagingMod.getToken(messaging,{vapidKey:config.vapidKey,serviceWorkerRegistration:registration});if(!token)throw Error('Não foi possível registrar este aparelho.');await api({action:'register',token:token});localStorage.setItem('lume-push-enabled','1');show('Aparelho cadastrado. Faça o teste com o Lume fechado antes de confiar nos avisos.');document.getElementById('push-test').disabled=false;document.getElementById('push-disable').disabled=false;
}
window.LumeNotifications={
 ready:function(){return setupReady()&&localStorage.getItem('lume-push-enabled')==='1';},
 sync:async function(event){if(!this.ready())return {scheduled:false};var date=new Date(event.date+'T'+event.time+':00');return api({action:'schedule',event:{id:event.uid,title:event.title,at:date.getTime(),day:!!event.day,two:!!event.two}});},
 cancel:async function(event){if(!this.ready())return;return api({action:'cancel',id:event.uid});}
};
document.getElementById('push-enable').onclick=function(){enable().catch(function(error){show(error.message);});};
document.getElementById('push-test').onclick=async function(){try{var result=await api({action:'test'});show('Teste agendado no servidor. Feche o Lume e aguarde cerca de 1 a 2 minutos. Só considere validado quando receber a notificação.');}catch(error){show(error.message);}};
document.getElementById('push-disable').onclick=async function(){try{await api({action:'disable'});if(messaging)await messagingMod.deleteToken(messaging);localStorage.removeItem('lume-push-enabled');show('Avisos desativados neste aparelho.');document.getElementById('push-test').disabled=true;}catch(error){show(error.message);}};
fetch(new URL('notification-config.json',base),{cache:'no-store'}).then(function(r){if(!r.ok)throw Error();return r.json();}).then(function(data){config=data;if(!setupReady()){show('Envio de notificações ainda não ativado. A preparação do servidor está pendente.');return;}if(localStorage.getItem('lume-push-enabled')==='1')show('Cadastro salvo neste aparelho. Use Enviar teste para conferir a entrega.');else show('Adicione à tela inicial e toque em Permitir avisos.');document.getElementById('push-enable').disabled=false;document.getElementById('push-test').disabled=localStorage.getItem('lume-push-enabled')!=='1';document.getElementById('push-disable').disabled=localStorage.getItem('lume-push-enabled')!=='1';}).catch(function(){show('Não foi possível consultar o serviço de avisos. Tente novamente mais tarde.');});
})();
