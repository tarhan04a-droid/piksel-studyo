/** The fixed 1024² SAM encoder can kill a mobile browser tab before JS can catch an error. */
export function isMobileCutoutDevice(){
 return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(navigator.userAgent));
}
export const mobileModelNotice='Mobil tarayıcıda bellek nedeniyle sayfanın kapanmasını önlemek için nesne modeli yüklenmiyor. Renk tabanlı seçimle arka planı kaldırabilir veya nesne modelini bilgisayarda kullanabilirsin.';
