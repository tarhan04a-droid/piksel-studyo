# Sabit `.pollmek` işaretiyle dosya kilidi

Bu özellik kullanıcının istediği sabit metinle geri alınabilir başlık bozma yöntemidir. Parola, altı harfli anahtar, ayrı `.pollmek` uzantısı, AES veya piksel karıştırma yoktur. Güvenli şifreleme olarak sunulmaz.

## Kilitleme

- İlk 16 bayt sabit `0xA5` ile XOR'lanır. Böylece dosya imzası bozulur; işaretin tesadüfen görüntüleyicinin yok saydığı bir alana yerleşmesine güvenilmez.
- ASCII `.pollmek` metni ilk 16–256 bayt içinde rastgele bir konuma eklenir. Rastgele konum `crypto.getRandomValues` ile seçilir. Dosya daha kısaysa üst sınır boyutuna indirilir.
- Diğer baytlar yeniden kodlanmadan `Blob.slice` ile korunur. Yeni dosya aynı ad ve uzantıyla indirilir; mevcut kaynak dosya değiştirilmez.
- Başlık bölgesinde doğal olarak aynı işaret varsa işlem reddedilir; belirsiz geri açma dosyası üretilmez.

## Geri açma

- Yalnız ilk bölüm ham veri olarak okunur; tüm dosyada metin araması yapılmaz.
- Geçerli bir normal görsel başlığı varsa dosyaya dokunulmaz.
- Tek bir `.pollmek` işareti bulunursa o konumdaki sekiz bayt kaldırılır ve ilk 16 bayta tekrar aynı XOR uygulanır.
- Geri gelen görsel imzası kontrol edilir. Birden fazla işaret veya tanınmayan başlık varsa yanlış veri silmek yerine hata bildirilir.
- Normal görsel yükleme ve sürükleyip bırakma da bu algılamayı kullanır. Kilitli dosyanın bir görüntüleyici tarafından açılabilmesi ön koşul değildir.

PNG, JPEG, GIF, WebP, BMP, TIFF ve AVIF/HEIC dosya başlıkları tanınır; basit SVG başlıkları da desteklenir. Tarayıcının görüntüyü düzenlemek için ilgili biçimi ayrıca desteklemesi gerekir. Boyut ve piksel verisi yeniden örneklenmez; büyük dosyalar için tüm görüntü belleğe açılmaz. Bu yöntemde içerik özeti yoktur; sonradan değiştirilmiş piksel verisinin onarılacağı iddia edilmez.

## Kontrol

TypeScript/Vite derlemesi ve `git diff --check` çalıştırılır. Kullanıcının açık izni olmadan test/uygulama çalıştırması yapılmaz.
