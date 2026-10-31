'use strict';
// No fetch cache: app updates must not be hidden by a stale service worker.
self.addEventListener('install',event=>event.waitUntil(self.skipWaiting()));
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick',event=>{
 event.notification.close();
 const target=new URL('./#agenda-page',self.registration.scope).href;
 event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async list=>{
  const existing=list.find(client=>client.url.startsWith(self.registration.scope));
  if(existing){await existing.navigate(target);return existing.focus();}return self.clients.openWindow(target);
 }));
});
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/13.1.0/firebase-messaging-compat.js');
firebase.initializeApp({apiKey:'AIzaSyBfYZPue4fwTrboGsFfonFHPGv2OVNIyL4',authDomain:'assistente-lume.firebaseapp.com',projectId:'assistente-lume',messagingSenderId:'936961378063',appId:'1:936961378063:web:0ac7196951487c4962e07a'});
firebase.messaging();
