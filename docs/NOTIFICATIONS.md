# Bildirimler

Sayfanın altındaki Bildirimler bölümünde site içi mesajlar açılıp kapatılır. Cihaz bildirimleri ayrıca ve yalnız kullanıcının düğmeye basıp tarayıcı iznini vermesiyle açılır. Tercihler cihazda tutulur; izin reddedilmişse tarayıcı/cihaz ayarlarına yönlendirilir. Deneme düğmesi, cihaz bildirimleri açıksa her iki kanalı da gösterir.

Çoklu fotoğraf işlemi, kayıpsız PNG işlemi ve işaretli dosya kilidi tamamlanınca mesaj üretilir. Site görünürken site içi mesaj; belge gizliyken ayrıca izinli cihaz bildirimi kullanılır. İşlem başarısızsa hazır diye bildirilmez; toplu işlemde kısmi başarısızlık ayrıca belirtilir. Mesajlara dosya adı veya görsel eklenmez.

`public/notifications-sw.js` yalnız bildirim tıklamasında mevcut pencereyi öne getirir veya siteyi açar. Fetch handler, dosya/varlık önbelleği, push aboneliği, backend veya harici bildirim sağlayıcısı yoktur. Site tamamen kapalıyken uzaktan duyuru göndermez. Mobil işletim sistemi arka plan sayfasını duraklatabilir; bu durumda işlem ve bildirimi uygulamaya dönünce devam edebilir.

HTTPS ve Service Worker bildirim desteği gerekir. iPhone/iPad için iOS/iPadOS 16.4+ ve ana ekrana eklenmiş web uygulaması gerekir. Cihaz bildirimi gerçek telefonda/masaüstünde henüz doğrulanmadı; bu değişiklik için test veya uygulamayı açma izni verilmedi. Derleme ve TypeScript kontrolü çalıştırıldı.

Referanslar: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/ ve https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification

## Dört saatlik esprili hatırlatma

Ayrı bir tercih düğmesiyle açılır; başlangıçta kapalıdır. Açıldığı andan itibaren dört saatlik aralık sayılır ve son zaman cihazda saklanır. Uygulama görünürken en fazla 30 saniyelik gecikmeyle site içi mesaj, cihaz izni ayrıca verilmişse cihaz bildirimi gösterilir. Arka planda veya kapalıyken zamanlayıcıya güvenilmez; geri dönüldüğünde süre dolmuşsa yalnız tek mesaj gösterilir. Uygulamayı ana ekrana eklemek tek başına kapalıyken düzenli bildirim çalıştırmaz. Kilit ekranına uzaktan zamanlanmış push gönderimi bu kapsamda değildir.
