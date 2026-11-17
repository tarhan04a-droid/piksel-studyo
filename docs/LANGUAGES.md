# Dil desteği

Türkçe kaynak metinler `src/content.ts` ve ilgili bileşenlerde tutulur. İngilizce, İspanyolca, Brezilya Portekizcesi ve Modern Standart Arapça karşılıklar `src/locales/en.json`, `es.json`, `pt.json`, `ar.json` dosyalarındadır. JSON anahtarları Türkçe kaynak metinlerdir.

Dil menüsü seçimi `pollmek-language` yerel depolama anahtarında hatırlanır. Sayfa `lang`/`dir`, başlık, açıklama ve sayı/tarih biçimleri seçime göre güncellenir. Dil değiştirmek fotoğrafları, ayarları ve kayıtları sıfırlamaz.

Çeviri yalnızca görüntülenen metinlere uygulanır. Dosya yolları, filtre kimlikleri, ayarlar, kullanıcı tarafından girilen çalışma başlıkları ve dosya adları çevrilmez. RGB/HSV/PNG/JPEG ve marka adları korunur. Bildirimlerin değişken kısımları (dosya adları, ölçüler) `src/i18n.ts` içinde eşleştirilir.

## Arapça düzen

Sayfa ve metinler RTL'dir. Fiziksel raf/TV, mikser, piksel taraması ve karşılaştırma perdesi LTR koordinatlarını korur. Sayılar Latin rakamlarıyla gösterilir; sayı girişleri Arap ve Fars rakamlarını da kabul eder. Arapça metinler için Noto Sans Arabic kullanılır; teknik göstergeler JetBrains Mono ile birlikte uygun yedek yazı tipini kullanır.

## Bağımsız dil incelemesi

Başka bir dil modeli veya anadili konuşan kişi, dört JSON dosyasını Türkçe anahtarlarla karşılaştırabilir. Özellikle teknik terimleri, emir kipini, kısa düğme metinlerini ve Arapça cümle akışını gözden geçirmelidir. Müşteri yorumlarının çevirileri yeni kullanıcı yorumları değildir; aynı beş değerlendirmenin çevirileridir.

Derleme/tip kontrolü: `npm run build`. Arayüz ve anadil doğrulaması ayrıca yapılmalıdır. Çalışan uygulamada test yapılmadan yalnız derleme başarısına dayanarak tüm dillerin doğrulandığı söylenmemelidir.
