# Video hız dönüştürme

Stüdyoda açılır “Video araçları” bölümü vardır. Bileşen dinamik yüklenir; FFmpeg yalnız MP4 oluştur düğmesiyle yüklenir. `@ffmpeg/ffmpeg` 0.12.15 worker'ı Vite tarafından aynı origin üzerinde paketlenir. Tek iş parçacıklı `@ffmpeg/core` 0.12.10 ESM JavaScript/WASM dosyaları jsDelivr üzerinden indirilir (yaklaşık 31 MB). SharedArrayBuffer / COOP-COEP gerektiren çok iş parçacıklı motor kullanılmaz. Kullanıcı videosu gönderilmez; indirmeler motor dosyaları içindir.

Desteklenen hızlar: 0.5× ve 2×. Önizlemede HTMLVideoElement.playbackRate kullanılır. Dışa aktarmada FFmpeg `setpts=(PTS-STARTPTS)/rate`, `atempo=rate`, libx264 CRF18 ultrafast, yuv420p ve AAC192k kullanır. Tek boyutlar sağ/alt padding ile çift boyuta tamamlanır. Ses izi opsiyoneldir; ilk görüntü ve varsa ilk ses izi alınır. Çıktı MP4 faststart'tır. Yeniden kodlama kayıpsız değildir; daha küçük dosya garantisi yoktur. Video dosyası yeniden encode edilmeden hız meta verisi değiştirilmez.

İlk sürüm: giriş 100 MB, en fazla 120 saniye, en fazla 3840 × 2160 piksel alanı. Tarayıcının önizleyebildiği dosyalar işleme açılır; codec desteği cihaza bağlıdır. Çalıştırma için 10 dakika FFmpeg timeout vardır. Progress çıktısı tahminidir; %100 yalnız başarılı çıktı okunduktan sonra gösterilir. İptal ve bölüm kapatma worker'ı sonlandırır, fetch'i iptal eder; geç gelen callback'ler generation ile engellenir. Blob URL'leri temizlenir. Uzun/4K video telefonda yine yüksek bellek ve zaman gerektirebilir.

Derleme/TypeScript kontrolü yapıldı. Kullanıcının açık test izni olmadığı için gerçek video dönüştürme, sessiz/sesli video ve telefon testi yapılmadı. Bu sınırlama ürün desteğinin tüm cihazlarda doğrulandığı anlamına gelmez.

Kaynak: https://ffmpegwasm.netlify.app/docs/getting-started/usage/

## Bağımlılık kontrolü

Yeni bağımlılıklar yüklenirken Transformers.js 4.3.2 seçildi, fflate uyumlu 0.8.3 yamasına geldi ve Vite mevcut yamalı 6.4.5 sürümünde sabitlendi. `npm audit` sonunda dört high kaydı (picomatch → fdir/tinyglobby → Vite zinciri) kaldı. Kaynak uyarı picomatch ≤4.0.7 için ReDoS'tur; kullanılan npm kayıt deposunda en yeni sürüm 4.0.7, 4.0.8 isteği 404 döndü. Audit'in önerdiği Vite 6.2.7'ye geri dönüş yapılmadı: o sürüm ek geliştirme sunucusu açıkları gösterdiği için mevcut 6.4.5 korundu. Bu zincir statik production JavaScript'inde değil, geliştirme/derleme aracındadır; audit temiz diye raporlanmamalıdır. Zorla major yükseltme veya kontrol bastırma yapılmadı.

## Boyut küçültme seçenekleri

Varsayılan hız 1×, sıkıştırma dengelidir. 0.5×/2× ile de birleştirilebilir. Dengeli: libx264 CRF23, veryfast, AAC128k; daha küçük: CRF28, veryfast, AAC96k. Yüksek kalite seçimi önceki CRF18/ultrafast/AAC192k davranışını korur. Sıkıştırma kayıplıdır; kalite veya kesin dosya boyutu garantisi yoktur.

Çözünürlük mevcut, 1920×1080 sınırı veya 1280×720 sınırı olarak seçilir. Scale force_original_aspect_ratio=decrease ve force_divisible_by=2 kullanır; küçük dosya büyütülmez, en-boy oranı korunur (codec için gerekebilen bir piksellik çift-boyut padding dışında). Portre videoları da seçilen kutuya sığdırılır. Önce/sonra boyutları ve kazanç gösterilir.

Yalnız 1× hız + mevcut boyut + küçültme modunda çıktı orijinalden küçük değilse, yeniden kodlanmış büyük dosya yerine orijinal dosya kendi adıyla sunulur. Hız/çözünürlük değişikliği varsa büyük çıksa bile o istenen sonuç korunur ve durum yazılır. Ayar değişince eski çıktı temizlenir. Gerçek video/codec kalite testi henüz yapılmadı; derleme ve tür kontrolü geçti.

Dil ve tema kontrolleri başlıktaki Ayarlar düğmesiyle açılan native dialog'a taşındı. Escape, kapat düğmesi ve dış alana tıklama ile kapanır; tarayıcının modal odak yönetimi kullanılır. Tercihler mevcut localStorage mekanizmasını sürdürür.
