# Video hız dönüştürme

Stüdyoda açılır “Video araçları” bölümü vardır. Bileşen dinamik yüklenir; FFmpeg yalnız MP4 oluştur düğmesiyle yüklenir. `@ffmpeg/ffmpeg` 0.12.15 worker'ı Vite tarafından aynı origin üzerinde paketlenir. Tek iş parçacıklı `@ffmpeg/core` 0.12.10 ESM JavaScript/WASM dosyaları jsDelivr üzerinden indirilir (yaklaşık 31 MB). SharedArrayBuffer / COOP-COEP gerektiren çok iş parçacıklı motor kullanılmaz. Kullanıcı videosu gönderilmez; indirmeler motor dosyaları içindir.

Desteklenen hızlar: 0.5× ve 2×. Önizlemede HTMLVideoElement.playbackRate kullanılır. Dışa aktarmada FFmpeg `setpts=(PTS-STARTPTS)/rate`, `atempo=rate`, libx264 CRF18 ultrafast, yuv420p ve AAC192k kullanır. Tek boyutlar sağ/alt padding ile çift boyuta tamamlanır. Ses izi opsiyoneldir; ilk görüntü ve varsa ilk ses izi alınır. Çıktı MP4 faststart'tır. Yeniden kodlama kayıpsız değildir; daha küçük dosya garantisi yoktur. Video dosyası yeniden encode edilmeden hız meta verisi değiştirilmez.

İlk sürüm: giriş 100 MB, en fazla 120 saniye, en fazla 3840 × 2160 piksel alanı. Tarayıcının önizleyebildiği dosyalar işleme açılır; codec desteği cihaza bağlıdır. Çalıştırma için 10 dakika FFmpeg timeout vardır. Progress çıktısı tahminidir; %100 yalnız başarılı çıktı okunduktan sonra gösterilir. İptal ve bölüm kapatma worker'ı sonlandırır, fetch'i iptal eder; geç gelen callback'ler generation ile engellenir. Blob URL'leri temizlenir. Uzun/4K video telefonda yine yüksek bellek ve zaman gerektirebilir.

Derleme/TypeScript kontrolü yapıldı. Kullanıcının açık test izni olmadığı için gerçek video dönüştürme, sessiz/sesli video ve telefon testi yapılmadı. Bu sınırlama ürün desteğinin tüm cihazlarda doğrulandığı anlamına gelmez.

Kaynak: https://ffmpegwasm.netlify.app/docs/getting-started/usage/

## Bağımlılık kontrolü

Yeni bağımlılıklar yüklenirken Transformers.js 4.3.2 seçildi, fflate uyumlu 0.8.3 yamasına geldi ve Vite mevcut yamalı 6.4.5 sürümünde sabitlendi. `npm audit` sonunda dört high kaydı (picomatch → fdir/tinyglobby → Vite zinciri) kaldı. Kaynak uyarı picomatch ≤4.0.7 için ReDoS'tur; kullanılan npm kayıt deposunda en yeni sürüm 4.0.7, 4.0.8 isteği 404 döndü. Audit'in önerdiği Vite 6.2.7'ye geri dönüş yapılmadı: o sürüm ek geliştirme sunucusu açıkları gösterdiği için mevcut 6.4.5 korundu. Bu zincir statik production JavaScript'inde değil, geliştirme/derleme aracındadır; audit temiz diye raporlanmamalıdır. Zorla major yükseltme veya kontrol bastırma yapılmadı.
