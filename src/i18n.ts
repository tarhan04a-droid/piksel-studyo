import {useSyncExternalStore,type ReactNode} from 'react';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
export const languages=[{code:'tr',name:'Türkçe'},{code:'en',name:'English'},{code:'es',name:'Español'},{code:'pt',name:'Português'},{code:'ar',name:'العربية'}] as const;
export type Language=typeof languages[number]['code'];
const dictionaries:Record<Exclude<Language,'tr'>,Record<string,string>>={en,es,pt,ar};
const valid=(value:string|null):value is Language=>languages.some(language=>language.code===value);
let language:Language='tr';try{const stored=localStorage.getItem('pollmek-language');if(valid(stored))language=stored}catch{}
const listeners=new Set<()=>void>();
export function parseLocalizedNumber(value:string){return Number(value.trim().replace(/[٠-٩]/g,digit=>String(digit.charCodeAt(0)-1632)).replace(/[۰-۹]/g,digit=>String(digit.charCodeAt(0)-1776)).replace(/٬/g,'').replace(/[٫,]/g,'.'))}
export const getLocale=()=>({tr:'tr-TR',en:'en-US',es:'es-ES',pt:'pt-BR',ar:'ar-u-nu-latn'}[language]);
function updateDocument(){document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';document.title='Pollmek Vision Sandbox — '+t('GÖRÜNTÜ İŞLEME OYUN ALANI');const description=document.querySelector('meta[name="description"]');description?.setAttribute('content',t('Bir fotoğraf seç, bir disk tak, farkı kaydırarak gör.'));document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);document.querySelector('meta[property="og:description"]')?.setAttribute('content',t('Bir fotoğraf seç, bir disk tak, farkı kaydırarak gör.'))}
export function setLanguage(value:string){if(!valid(value))return;language=value;cache.clear();try{localStorage.setItem('pollmek-language',value)}catch{}updateDocument();listeners.forEach(listener=>listener())}
export function useLanguage(){return useSyncExternalStore(listener=>{listeners.add(listener);return()=>listeners.delete(listener)},()=>language,()=> 'tr' as Language)}
const folded=Object.fromEntries(Object.keys(en).map(key=>[key.toLocaleLowerCase('tr-TR'),key]));
const cache=new Map<string,string>();
export function t(text:string):string;
export function t(text:undefined):undefined;
export function t(text:string|undefined):string|undefined;
export function t(text:string|undefined):string|undefined{
 if(text===undefined||language==='tr'||!text.trim())return text;
 const cached=cache.get(text);if(cached!==undefined)return cached;
 const key=text.trim().replace(/\s+/g,' '),dictionary=dictionaries[language];let result=dictionary[text.trim()]??dictionary[key];
 if(result===undefined){const original=folded[key.toLocaleLowerCase('tr-TR')];if(original){result=dictionary[original];if(key===key.toLocaleLowerCase('tr-TR'))result=result.toLocaleLowerCase(getLocale());else if(original===original.toLocaleUpperCase('tr-TR')&&key!==original)result=result.charAt(0)+result.slice(1).toLocaleLowerCase(getLocale())}}
 if(result===undefined){
  const upload=key.match(/^(.*) yüklendi · (.*)$/),download=key.match(/^(.*) indirildi · (.*)$/),crop=key.match(/^Fotoğraf kırpıldı · (.*) piksel$/),limited=key.match(/^En fazla 5 fotoğraf eklenebilir\. İlk (.*) fotoğraf eklendi\.$/),choose=key.match(/^(.*) fotoğrafını seç$/),remove=key.match(/^(.*) fotoğrafını sıradan çıkar$/),stars=key.match(/^(.*) \/ 5 yıldız$/),channel=key.match(/^Kanal (\d+)$/);
  if(upload)result=({en:`${upload[1]} loaded · ${upload[2]}`,es:`${upload[1]} cargada · ${upload[2]}`,pt:`${upload[1]} carregada · ${upload[2]}`,ar:`تم تحميل ${upload[1]} · ${upload[2]}`})[language];
  else if(download)result=({en:`${download[1]} downloaded · ${download[2]}`,es:`${download[1]} descargado · ${download[2]}`,pt:`${download[1]} baixado · ${download[2]}`,ar:`تم تنزيل ${download[1]} · ${download[2]}`})[language];
  else if(crop)result=({en:`Photo cropped · ${crop[1]} pixels`,es:`Foto recortada · ${crop[1]} píxeles`,pt:`Foto recortada · ${crop[1]} pixels`,ar:`تم اقتصاص الصورة · ${crop[1]} بكسل`})[language];
  else if(limited)result=`${t('En fazla 5 fotoğraf eklenebilir. İlk')} ${limited[1]} ${t('fotoğraf eklendi.')}`;
  else if(choose)result=`${choose[1]} · ${t('fotoğrafını seç')}`;
  else if(remove)result=`${remove[1]} · ${t('fotoğrafını sıradan çıkar')}`;
  else if(stars)result=`${stars[1]} / 5 ${t('yıldız')}`;
  else if(channel)result=({en:'Channel',es:'Canal',pt:'Canal',ar:'القناة'})[language]+' '+channel[1];
  else if(key.includes(' · '))result=key.split(' · ').map(piece=>t(piece)).join(' · ');
  else if(key.includes(': '))result=key.split(': ').map(piece=>t(piece)).join(': ');
  else if(key.match(/^Gama [\d,.]+$/))result=t('Gama')+' '+Number(key.slice(5).replace(',','.')).toLocaleString(getLocale());
 }
 result=result??text.trim();const spaced=text.slice(0,text.length-text.trimStart().length)+result+text.slice(text.trimEnd().length);
 if(cache.size>1500)cache.clear();cache.set(text,spaced);return spaced;
}
// Localize only rendered strings, keeping files, settings, paths and filter IDs intact.
export function trNode(value:ReactNode):ReactNode{if(language==='tr')return value;if(typeof value==='string')return t(value);if(Array.isArray(value))return value.map(trNode);return value}
updateDocument();
