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
- Retro CRT televizyon ve 17 açıklamalı işlem diski: referans, gama, aydınlatma, kontrast, negatif, gri seviye, siyah beyaz, RGB, HSV, ışık bandı, arındırıcı, ortalama, Gauss, kalınlaştırma, inceltme, bölütleme, otomatik iyileştirme. CH+/CH− ile işlemin örneklerini karşılaştırın.
- Başlangıç için tek tıklık işlem düğmeleri; açılır ince ayar panelleri ve ayrı, görünür bölütleme aracı. Koleksiyondan seçilen işlem oyun alanında da denenebilir.
- Görsel yükleme ve sürükle bırak, öncesi/sonrası perdesi, PNG indirme ve sıfırlama.
- RGB kanal çarpanları ve solo; HSV ton, doygunluk ve parlaklık.
- Gri seviye, ikili eşikleme, negatif, gama, logaritma, kontrast germe, yoğunluk dilimleme.
- Sınırları kontrol edilen 3×3 medyan, ortalama, Gauss, gri seviye genişletme ve aşındırma.
- HSV renk tonu ile nesne maskesi ve histogram istatistikleriyle otomatik iyileştirme.
- TV üzerindeki **yuvarlak düğmeye tek tıklayarak** histogram panelini açıp kapatabilirsiniz. Canlı histogram ve kontrast kırılma noktaları yalnızca bu modda görünür. Genel parlaklık veya Kırmızı / Yeşil / Mavi kanalını seçerek orijinal ve işlenmiş görselin dağılımlarını aynı ölçekte karşılaştırabilirsiniz; her kanalın ortalaması ve min–maks aralığı ayrıca gösterilir. Klavye kısayolu yoktur.

Tüm görsel işlemleri cihazda HTML5 Canvas üzerinde gerçekleşir; dosyalar sunucuya gönderilmez. Performans için yüklenen görsellerin uzun kenarı en fazla 1400 piksele ölçeklenir; indirilen PNG de bu çözünürlüktedir. Vitrinde her işlem için örnek görseller bulunur; bazı sonuç kanalları sağlanan hazır karşılaştırma görsellerini, diğerleri Canvas üzerinde hesaplanan sonuçları gösterir. Oyun alanında işlemler her zaman orijinal görselden hesaplanır. Arayüz fontları Google Fonts üzerinden yüklenir; çevrimdışı durumda sistem fontları kullanılır.

## Teknolojiler

Vite, React, TypeScript, HTML5 Canvas, CSS. AI coding agent: OpenAI Codex.

## GitHub ve Vercel

Canlı URL: Henüz yayınlanmadı.

Depo: https://github.com/tarhan04a-droid/piksel-studyo. Vercel'de depoyu içe aktarın; Framework Preset: **Vite**, Build Command: **npm run build**, Output Directory: **dist**. Ortam değişkeni veya veritabanı gerekmez. Depoya yapılan yeni push'lar Vercel tarafından yeniden derlenir.

Arayüz metinleri ve disk açıklamaları `src/content.ts` dosyasından düzenlenir. Fontlar: Space Grotesk, Inter, JetBrains Mono ve yalnız cihaz göstergelerinde Doto. Sayılar Türkçe yerel biçimde gösterilir. Vercel yayını henüz yapılmadı.
