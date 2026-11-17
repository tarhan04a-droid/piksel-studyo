import {t} from './i18n';
const eventName='pollmek-notice';
export type Notice={id:number;text:string};
let sequence=0,registration:Promise<ServiceWorkerRegistration>|undefined;
export function preference(key:'site'|'device'|'reminder'){try{return localStorage.getItem('pollmek-notify-'+key)===(key==='site'?'off':'on')?key!=='site':key==='site'}catch{return key==='site'}}
export function setPreference(key:'site'|'device'|'reminder',enabled:boolean){try{localStorage.setItem('pollmek-notify-'+key,enabled?'on':'off')}catch{}}
export function deviceSupported(){return window.isSecureContext&&'Notification' in window&&'serviceWorker' in navigator&&'showNotification' in ServiceWorkerRegistration.prototype}
function readyWorker(){
 if(!registration)registration=(async()=>{
  const reg=await navigator.serviceWorker.register('/notifications-sw.js',{scope:'/'});
  if(reg.active)return reg;
  await new Promise<void>((resolve,reject)=>{const worker=reg.installing||reg.waiting;if(!worker){reject(new Error('worker'));return}const timer=setTimeout(()=>{worker.removeEventListener('statechange',changed);reject(new Error('timeout'))},12000);function changed(){if(worker!.state==='activated'){clearTimeout(timer);worker!.removeEventListener('statechange',changed);resolve()}else if(worker!.state==='redundant'){clearTimeout(timer);worker!.removeEventListener('statechange',changed);reject(new Error('worker'))}}worker.addEventListener('statechange',changed);changed()});return reg;
 })().catch(error=>{registration=undefined;throw error});
 return registration;
}
export function siteNotice(text:string,force=false){if(force||preference('site'))window.dispatchEvent(new CustomEvent<Notice>(eventName,{detail:{id:++sequence,text}}))}
export function listenNotices(listener:(notice:Notice)=>void){const handler=(event:Event)=>listener((event as CustomEvent<Notice>).detail);window.addEventListener(eventName,handler);return()=>window.removeEventListener(eventName,handler)}
export async function deviceNotice(text:string){const reg=await readyWorker();await reg.showNotification('Pollmek Vision Sandbox',{body:text,icon:'/icons/icon-192.png',badge:'/icons/icon-192.png',tag:'pollmek-operation',data:{url:'/'}})}
export async function enableDevice(){if(!deviceSupported())return false;const permission=await Notification.requestPermission();if(permission!=='granted')return false;await readyWorker();setPreference('device',true);return true}
export function notifyOperation(text:string){const translated=t(text);siteNotice(translated);if(preference('device')&&deviceSupported()&&Notification.permission==='granted'&&document.visibilityState==='hidden')void deviceNotice(translated).catch(()=>{setPreference('device',false);siteNotice(t('Cihaz bildirimi gösterilemedi. Bildirim ayarlarından tekrar açabilirsin.'),true)})}
