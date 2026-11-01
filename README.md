# Pollmek Vision Sandbox

Görüntü işlemeyi formüller yerine görsel deneylerle anlatan, öğrenciler ve merak eden herkes için hazırlanmış Türkçe web uygulaması.

## Çalıştırma

```bash
npm install
npm run dev
```

Production çıktısı: `npm run build` → `dist/`. Önizleme: `npm run preview`.

## İçerik

- Disk seçildiğinde kutu kapağı açılır, CD tepsiden çıkar, yan döner ve TV yuvasına girer; işlem disk yerleşince oynatılır. TV anten, koyu kontrol paneli, metal çerçeve ve CRT cam yansımasıyla çizilir.
- Retro CRT televizyon ve 18 açıklamalı işlem diski: referans, gama, aydınlatma, kontrast, negatif, gri seviye, siyah beyaz, RGB, HSV, ışık bandı, arındırıcı, ortalama, Gauss, kalınlaştırma, inceltme, bölütleme, otomatik iyileştirme ve histogram eşitleme. CH+/CH− ile işlemin örneklerini karşılaştırın.
- Başlangıç için tek tıklık işlem düğmeleri; açılır ince ayar panelleri ve ayrı, görünür bölütleme aracı. Koleksiyondan seçilen işlem oyun alanında da denenebilir.
- Görsel yükleme ve sürükle bırak, öncesi/sonrası perdesi, PNG/JPEG indirme, oranı koruyan %10–400 boyutlandırma ve sıfırlama.
- RGB kanal çarpanları ve solo; HSV ton, doygunluk ve parlaklık.
- Gri seviye, ikili eşikleme, negatif, gama, logaritma, kontrast germe, yoğunluk dilimleme.
- Sınırları kontrol edilen 3×3 medyan, ortalama, Gauss, gri seviye genişletme ve aşındırma.
- HSV renk tonu ile nesne maskesi ve histogram istatistikleriyle otomatik iyileştirme.
- TV üzerindeki **yuvarlak düğmeye tek tıklayarak** histogram panelini açıp kapatabilirsiniz. Canlı histogram ve kontrast kırılma noktaları yalnızca bu modda görünür. Genel parlaklık veya Kırmızı / Yeşil / Mavi kanalını seçerek orijinal ve işlenmiş görselin dağılımlarını aynı ölçekte karşılaştırabilirsiniz; her kanalın ortalaması ve min–maks aralığı ayrıca gösterilir. Histogram eşitleme ayrı işlem düğmesi ve disk olarak sunulur. Klavye kısayolu yoktur.

Tüm görsel işlemleri cihazda HTML5 Canvas üzerinde gerçekleşir; dosyalar sunucuya gönderilmez. Performans için yüklenen görsellerin uzun kenarı en fazla 1400 piksele ölçeklenir; PNG bu çalışma çözünürlüğünden üretilir. JPEG, mevcut oturumda yüklenen orijinal dosyayı tam piksel boyutunda yeniden işler. Boyutlandırma indirme sırasında uygulanır; en uzun kenar 8192 ve toplam 24 milyon piksel sınırı vardır. Kaydedilmiş çalışmalar orijinal büyük dosyayı saklamaz. Vitrinde her işlem için örnek görseller bulunur; bazı sonuç kanalları sağlanan hazır karşılaştırma görsellerini, diğerleri Canvas üzerinde hesaplanan sonuçları gösterir. Oyun alanında işlemler her zaman orijinal görselden hesaplanır. Arayüz fontları Google Fonts üzerinden yüklenir; çevrimdışı durumda sistem fontları kullanılır.

## Teknolojiler

Vite, React, TypeScript, HTML5 Canvas, CSS. AI coding agent: OpenAI Codex.

## GitHub ve Vercel

Canlı URL: https://piksel-studyo.vercel.app/

İlk production yayını: 1 Kasım 2026.

Depo: https://github.com/tarhan04a-droid/piksel-studyo. Vercel projesi GitHub deposuna bağlıdır; Framework Preset: **Vite**, Build Command: **npm run build**, Output Directory: **dist**. Ortam değişkeni veya veritabanı gerekmez. Depoya yapılan yeni push'lar Vercel tarafından yeniden derlenir.

Arayüz metinleri ve disk açıklamaları `src/content.ts` dosyasından düzenlenir. Fontlar: Space Grotesk, Inter, JetBrains Mono ve yalnız cihaz göstergelerinde Doto. Sayılar Türkçe yerel biçimde gösterilir. Production yayını Vercel üzerinden erişilebilir.

## İlk yayın sonrası mobil iyileştirme

320 ve 390 piksel ekranlarda yatay taşma kontrol edildi. Mobil menü iki satıra ayrıldı; fotoğraf ayar panelinden önce gösterilir. TV tuşları, işlem düğmeleri ve mikser kontrollerinin dokunma hedefleri büyütüldü. Yerel fotoğraf seçimi otomasyon testi, Chrome eklentisinin dosya erişim izni nedeniyle tamamlanamadı; gerçek telefonda elle doğrulanmalıdır.

Deployment notu: Vercel’in GitHub hesabını eşleştirebilmesi için commit kimliği, proje özelinde GitHub hesabının gizlilik korumalı `noreply` adresini kullanır. Global Git ayarları değiştirilmez.

## Yerel Çalışmalarım: mimari gerekçe

Hesap veya backend gerektirmeyen bir görüntü işleme sitesi için kayıtlar IndexedDB kullanılarak tamamen tarayıcıda tutulur. Google girişi, Firebase SDK, bulut veritabanı ve Vercel ortam değişkenleri kullanılmaz. Fotoğrafın çalışma çözünürlüğündeki orijinali, PNG sonucu, küçük önizlemesi ve ayarlar aynı IndexedDB transaction’ında saklanır; yeniden açılabilir ve tek tek silinebilir.

Kayıtlar yalnız aynı cihaz, tarayıcı ve site adresinde görünür; localhost ile production ayrı depolardır. Tarayıcı verilerinin silinmesi, gizli mod, kota sınırları ve Safari dahil tarayıcıların depolama temizliği kayıtları etkileyebilir. Bu nedenle her kayıt **Fotoğrafı indir** (PNG sonuç) ve **Yedekleme → Yedek indir** (çalışma çözünürlüğündeki fotoğraf + ayarlar) seçenekleri sunar. **Yedekleme → Yedekten aç** ile yedek başka tarayıcıya taşınır; 24 MB dosya sınırı, PNG veri kontrolü, en fazla 1400 × 1400 boyut ve ayar aralıklarının doğrulanması uygulanır. Bulut kopyası yoktur.

Firebase denemesi yalnız çalışma ağacında kalmıştı: Git geçmişi `git log -p --all` ile tarandı; Firebase config, API anahtarı, servis hesabı veya private key commit’lenmedi. Firebase’in dış konsolda oluşturulan projesi kaynak koddan bağımsızdır; bu site artık o projeye bağlanmaz.

## Temalar ve ses

Koyu, turkuaz açık ve beşinci tema düğmesi basışında onay isteyen kaos modu bulunur. Kaos uyarısı kabul edilmeden renk animasyonu ve müzik başlamaz. Hareket azaltma tercihi animasyonlarda dikkate alınır. TV kadranı cızırtı, kutu/CD sesleri ve Bailando için ortak ses düzeyini ayarlar; sıfırda ses kapanır. Kaosta mekanik sesler ve cızırtı kapatılır. Tarayıcı ses için kullanıcı etkileşimi isteyebilir.

## Test ve teslim

Harici tarayıcı dayanıklılık raporu: [1 Kasım 2026 raporu](docs/testing/2026-11-01-browser-stress-report.md). Rapor bağımsız yeniden doğrulama değildir; gerçek telefon testi ile iframe simülasyonu ayrıştırılmıştır. Kullanıcı ayrıca 4K dosya yüklemeyi ve tam boyut JPEG çıktısını elle denemiştir.

Teslim bağlantıları ve açıklama: [Teslim notu](docs/SUBMISSION.md).
Görsel/ses kaynaklarının izin durumu: [Medya kaynakları](docs/MEDIA_SOURCES.md).
