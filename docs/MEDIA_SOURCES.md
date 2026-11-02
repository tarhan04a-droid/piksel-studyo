# Medya kaynakları ve izin durumu

Bu belge bir lisans onayı değildir. Kullanıcının sağladığı dosyalara erişim, yayımlama izninin kanıtı sayılmaz. Kaynak URL ve lisans bilgisi verilmediğinde izin durumu **doğrulanmadı** olarak tutulur. Hiçbir medya bu inceleme kapsamında kaldırılmadı veya değiştirilmedi.

| İçerik | Bilinen kaynak | Durum |
|---|---|---|
| Marka ve disk kapağı tasarımları | Kullanıcının sağladığı Gemini çıktıları; temaya uyarlanan SVG marka kodu | Orijinal üretim ve kullanım koşulları kullanıcı tarafından teyit edilmeli |
| 18 örnek fotoğraf (`public/images/demos/personal`) | Kullanıcının kendi fotoğrafları olarak sağladığı 2 Kasım 2026 tarihli 10 + 8 dosya | Kullanıcının kendi çekimi beyanıyla kullanılıyor; eski örnek fotoğraflar kaldırıldı |
| Dolunay / hilal / kara delik (`public/images/themes`) | Kullanıcının sağladığı görseller; hilal SVG olarak yeniden çizildi | Harici görsellerin izinleri doğrulanmadı |
| Konata dans GIF’i | Kullanıcının sağladığı `konata-bailando.gif` | Kaynak ve yeniden yayımlama izni doğrulanmadı |
| Paradisio — Bailando | Kullanıcının sağladığı MP3 | Müzik/kayıt hakları için yayımlama izni doğrulanmadı |
| CD kutusu ve sürücü efektleri | `scripts/generate_mechanical_sounds.py` ile sıfırdan üretilen klik, gürültü ve motor dalgaları | Harici kayıt örneklenmedi; eski MP3 kopyaları kaldırıldı |
| TV cızırtısı | Tarayıcıda rastgele örneklerden üretilen Web Audio sesi | Harici ses kaydı kullanılmıyor |

## Teyit için gerekenler

Harici içerikler için kaynak bağlantısı ve uygun lisans/izin belgesi sağlanmalı. Özellikle stok görseller ve ticari müzik için yalnız dosyayı indirmiş olmak yeterli değildir. İzin bulunmuyorsa kullanıcı kararıyla izinli alternatif kullanılabilir; otomatik değişiklik yapılmamıştır.

Arındırıcı örneğinin gürültüsü kodla eklenir. Önce/sonra sonuçları uygulama motoruyla hesaplanır; ayrı stok sonuç görseli kullanılmaz.

2 Kasım 2026 güncellemesi: Kaos modu, Bailando, dans GIF’i, kara delik görseli ve kutu/sürücü efektleri güncel kaynaklardan kaldırıldı. Yukarıdaki bu içeriklere ilişkin satırlar geçmiş durum kaydıdır; eski commitlerdeki dosyalar geçmişten silinmedi.
