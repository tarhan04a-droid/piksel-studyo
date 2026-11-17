import {useEffect,useState} from 'react';
import {t,useLanguage} from './i18n';
import {deviceNotice,deviceSupported,enableDevice,listenNotices,preference,setPreference,siteNotice,type Notice} from './notifications';
export default function Notifications(){
 useLanguage();const[site,setSite]=useState(()=>preference('site')),[device,setDevice]=useState(()=>preference('device')&&deviceSupported()&&Notification.permission==='granted'),[reminder,setReminder]=useState(()=>preference('reminder')),[busy,setBusy]=useState(false),[notices,setNotices]=useState<Notice[]>([]),[status,setStatus]=useState('');
 useEffect(()=>{const timers=new Set<ReturnType<typeof setTimeout>>();const remove=listenNotices(notice=>{setNotices(old=>[...old.slice(-2),notice]);const timer=setTimeout(()=>{setNotices(old=>old.filter(item=>item.id!==notice.id));timers.delete(timer)},8000);timers.add(timer)});return()=>{remove();for(const timer of timers)clearTimeout(timer)}},[]);
 useEffect(()=>{function sync(){setDevice(preference('device')&&deviceSupported()&&Notification.permission==='granted')}window.addEventListener('focus',sync);return()=>window.removeEventListener('focus',sync)},[]);
 useEffect(()=>{
  if(!reminder)return;
  const interval=4*60*60*1000,key='pollmek-reminder-last';let last=Date.now(),index=0;
  try{const saved=Number(localStorage.getItem(key));if(Number.isFinite(saved)&&saved>0&&saved<=last)last=saved;else localStorage.setItem(key,String(last))}catch{}
  let sending=false;
  async function check(){
   if(document.visibilityState!=='visible'||Date.now()-last<interval||sending)return;
   sending=true;last=Date.now();try{localStorage.setItem(key,String(last))}catch{}
   const messages=['Dört saattir tek piksel işlemedik… beni unuttun mu?','Fotoğrafların seni soruyor. Ben ne diyeyim şimdi?','Bir fotoğraf düzenlesek mi? Pikseller burada yolunu gözlüyor.'];
   const text=t(messages[index++%messages.length]);siteNotice(text,true);
   if(preference('device')&&deviceSupported()&&Notification.permission==='granted')try{await deviceNotice(text)}catch{setStatus('Cihaz bildirimi gösterilemedi. Bildirim ayarlarından tekrar açabilirsin.')}
   sending=false;
  }
  const timer=setInterval(()=>void check(),30000);const visible=()=>void check();document.addEventListener('visibilitychange',visible);void check();
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visible)};
 },[reminder]);
 async function toggleDevice(){if(device){setPreference('device',false);setDevice(false);setStatus('Cihaz bildirimleri kapalı.');return}setBusy(true);try{const enabled=await enableDevice();setDevice(enabled);setStatus(enabled?'Cihaz bildirimleri açık.':"Bildirim izni verilmedi. İzni tarayıcı veya cihaz ayarlarından değiştirebilirsin.")}catch{setStatus('Cihaz bildirimi açılamadı. Tekrar deneyebilirsin.')}finally{setBusy(false)}}
 async function example(){siteNotice(t('Deneme bildirimi: her şey hazır.'),true);if(device){setBusy(true);try{await deviceNotice(t('Deneme bildirimi: her şey hazır.'));setStatus('Deneme bildirimi cihaza gönderildi.')}catch{setStatus('Cihaz bildirimi gösterilemedi. Bildirim ayarlarından tekrar açabilirsin.')}finally{setBusy(false)}}}
 return <><details className="notification-settings"><summary>{t('Bildirimler')}</summary><p>{t('İşlem sonuçlarını site içinde göster. Site arka plandayken cihaz bildirimi de alabilirsin.')}</p><div><button aria-pressed={site} onClick={()=>{setPreference('site',!site);setSite(!site)}}>{t(site?'Site içi bildirimler: açık':'Site içi bildirimler: kapalı')}</button><button disabled={busy||!deviceSupported()} aria-pressed={device} onClick={()=>void toggleDevice()}>{t(device?'Cihaz bildirimlerini kapat':'Cihaz bildirimlerini aç')}</button><button aria-pressed={reminder} onClick={()=>{const enabled=!reminder;setPreference('reminder',enabled);if(enabled)try{localStorage.setItem('pollmek-reminder-last',String(Date.now()))}catch{}setReminder(enabled)}}>{t(reminder?'4 saatlik hatırlatma: açık':'4 saatlik hatırlatma: kapalı')}</button><button disabled={busy} onClick={()=>void example()}>{t('Deneme bildirimi göster')}</button></div>{!deviceSupported()&&<p>{t('iPhone’da ana ekrana eklediğin uygulamadan aç. Diğer cihazlarda bildirim destekleyen bir tarayıcı ve HTTPS gerekir.')}</p>}<p>{t('Hatırlatma açıkken dört saatte bir esprili mesaj gösterilir. Uygulama kapalıysa geri açtığında gösterilir; biriken mesajlar peş peşe gelmez.')}</p><p>{t('Site tamamen kapalıyken duyuru gönderilmez. Telefonda uygulama arka planda duraklatılırsa işlem bildirimi geri dönünce gelebilir.')}</p><p role="status">{t(status)}</p></details><div className="notification-stack" role="status" aria-live="polite" aria-atomic="false">{notices.map(notice=><div className="site-notification" key={notice.id}><span>{notice.text}</span><button aria-label={t('Bildirimi kapat')} onClick={()=>setNotices(old=>old.filter(item=>item.id!==notice.id))}>×</button></div>)}</div></>;
}
