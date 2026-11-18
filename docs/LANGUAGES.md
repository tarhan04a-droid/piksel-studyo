# Dil desteği

Türkçe kaynak metinler `src/content.ts` ve ilgili bileşenlerde tutulur. İngilizce, İspanyolca, Brezilya Portekizcesi ve Modern Standart Arapça karşılıklar `src/locales/en.json`, `es.json`, `pt.json`, `ar.json` dosyalarındadır. JSON anahtarları Türkçe kaynak metinlerdir.

Dil menüsü seçimi `pollmek-language` yerel depolama anahtarında hatırlanır. Sayfa `lang`/`dir`, başlık, açıklama ve sayı/tarih biçimleri seçime göre güncellenir. Dil değiştirmek fotoğrafları, ayarları ve kayıtları sıfırlamaz.

Çeviri yalnızca görüntülenen metinlere uygulanır. Dosya yolları, filtre kimlikleri, ayarlar, kullanıcı tarafından girilen çalışma başlıkları ve dosya adları çevrilmez. RGB/HSV/PNG/JPEG ve marka adları korunur. Bildirimlerin değişken kısımları (dosya adları, ölçüler) `src/i18n.ts` içinde eşleştirilir.

## Arapça düzen

Sayfa ve metinler RTL'dir. Fiziksel raf/TV, mikser, piksel taraması ve karşılaştırma perdesi LTR koordinatlarını korur. Sayılar Latin rakamlarıyla gösterilir; sayı girişleri Arap ve Fars rakamlarını da kabul eder. Arapça metinler için Noto Sans Arabic kullanılır; teknik göstergeler JetBrains Mono ile birlikte uygun yedek yazı tipini kullanır.

## Bağımsız dil incelemesi

Başka bir dil modeli veya anadili konuşan kişi, dört JSON dosyasını Türkçe anahtarlarla karşılaştırabilir. Özellikle teknik terimleri, emir kipini, kısa düğme metinlerini ve Arapça cümle akışını gözden geçirmelidir. Müşteri yorumlarının çevirileri yeni kullanıcı yorumları değildir; aynı beş değerlendirmenin çevirileridir.

Derleme/tip kontrolü: `npm run build`. Arayüz ve anadil doğrulaması ayrıca yapılmalıdır. Çalışan uygulamada test yapılmadan yalnız derleme başarısına dayanarak tüm dillerin doğrulandığı söylenmemelidir.


## Testler ve matematik açıklamaları

Matematik ve derin analiz testlerinin 20 sorusu, seçenekleri, konu başlıkları ve açıklamaları beş dilde sunulur. Türkçe kaynaklar `mathQuestions.ts` / `analysisQuestions.ts`; dört çeviri bankası `src/locales/questions/` altındadır. Her bankanın 20 soru kimliği ve dörder seçeneği TypeScript tipiyle zorunludur. Doğru cevaplar yalnız Türkçe kaynak bankalarından alınır; çeviri dosyalarında ayrı cevap anahtarı yoktur. Soru kimlikleri, seçenek sırası, kayıt anahtarları ve iki ayrı kilit korunur. Çeviri bankası yalnız test ekranı açılınca seçili dil için dinamik yüklenir. Yükleme başarısızsa Türkçe içerikle sessizce devam etmek yerine yeniden deneme gösterilir.

İnce İşlemler’in 18 matematik açıklaması sözlüklere bağlıdır. Formüller, matrisler ve gerçek motor kodu teknik gösterimler olarak korunur. Arapça açıklama ve sorular RTL iken içlerindeki formüller/koordinatlar `ScientificText` ile LTR izole edilir. Sayısal etiketler Latin rakamlarıyla tutarlıdır. Sürgülerin sayı giriş etiketlerinde işlem adı önce çevrilir, ardından çevrilmiş “Sayı gir” eklenir. Çok satırlı formüllerin açıklama çevirileri tam anahtarla eşleşir.

Arapça üstbilgi için alanları belirli bir grid ve paragrafla örtüşmeyen normal akışta not kullanılır. İsimler `bdi dir=ltr`, puanlar tek `role=img` / `aria-label` ve görünür yıldız çocukları `aria-hidden` ile zaten korunuyordu; bunlar değiştirilmedi. Anlamlı TV ve önce/sonra fotoğraflarında mevcut alt metinler korunur; süs görsellerine gereksiz etiket eklenmez.

Ana adres için canonical ve temel Open Graph başlık/açıklama/marka görseli eklidir. Tarayıcıda başlık ve açıklama dille değişir; JavaScript çalıştırmayan paylaşım tarayıcıları başlangıç Türkçe metnini görebilir. Ayrı URL veya sunucuda üretilmiş dil sayfaları yoktur; aynı URL’ye sahte hreflang eklenmemiştir. Bu, beş dil için ayrı SEO sayfası desteği iddiası değildir.

Bu güncellemede yalnız derleme/tip ve diff biçim kontrolü yapılır. Test ilerlemesi değiştirilmez; kilit açılarak veya tarayıcı/mobil açılarak işlev ve RTL görsel denemesi yapılmaz. Anadili konuşan birinin çeviri incelemesi ayrıca değerlidir.
