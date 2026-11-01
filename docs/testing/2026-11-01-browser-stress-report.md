# Tarayıcı dayanıklılık testi raporu

- Tarih: 1 Kasım 2026 (kullanıcı tarafından iletilme tarihi).
- Hedef: https://piksel-studyo.vercel.app/
- Kaynak: Kullanıcının ilettiği harici test oturumu çıktısı; aşağıda aynen korunmuştur.
- Bu kayıt, bağımsız olarak yeniden çalıştırılmış veya doğrulanmış bir test sonucu değildir.
- Kapsam: Tarayıcı arayüzü, ardışık işlemler, IndexedDB kayıtları, kayıt sırasında yenileme, iki sekme ve geçersiz dosyalar. Sunucu yük testi veya gerçek telefon testi değildir.
- Kullanıcı kararı: Rapordaki öneriler uygulanmayacak; bu commit yalnızca raporu belgeler.

## Okuma notları

Testçi donma veya veri bozulması gözlemlemediğini bildiriyor. Kaydetme ve yenileme deneyleri başarılı raporlanmış. İki sekmede listenin anlık güncellenmemesi, hata mesajının ekranın aşağısında kalması ve simüle edilmiş uzun dosya adında yatay taşma bildirilmiş; bunlar uygulanan düzeltmeler değildir. Kırmızı bilgilendirme kutusu hakkındaki yorum bir kullanılabilirlik görüşüdür.

Mobil kontrol 390 piksel iframe ile sınırlı; gerçek dokunmatik cihaz ve oyun alanının tüm mobil kontrolleri doğrulanmamış. İlk sayfa açılışının konsolu izlenmemiş. Kendiliğinden açıldığı bildirilen pencere tekrarlanamadığı için doğrulanmamış gözlemdir. Rapor girişindeki sonuç sayımı ile tablonun etiketleri birebir örtüşmüyor; ayrıntılar için tablo esas alınmalıdır.

Testçinin tarayıcısında 33 örnek kayıt bıraktığı belirtiliyor. Bunlar bu depoya veya bir sunucuya aktarılmamıştır.

## İletilen özgün rapor

The URL placeholder wasn't filled in, so I'll use the site open in your current tab (piksel-studyo.vercel.app). I'm starting with its structure.Now I'll click "Kendi fotoğrafımla dene" (CTA) and see whether it creates an image file input.The page now has an `image/*` file input. I'll upload the test image.The upload worked. Next I'll apply filters 25 times in a row and watch errors and timing.The preview didn't visibly change, and the red banner is still there. I'll try a real mouse click to see whether that differs from the scripted clicks.A real click works, and the right half of the preview turned grayscale. Now I'll do 24 real clicks in a row.The filter step passed, with no errors and 65 MB heap. Next is saving. I'll click "Çalışmalarıma kaydet" to see the flow.I'll save 32 times through the real form, with a name and a click each time, and time every save.All 32 records saved and the thumbnails render. A few saves took 1–2 s. Next I'll time reopening the list, then reload mid-save.Reloading 15 ms into a save left no half-saved record (32 intact, 0 incomplete). I'll try other delays and check whether the page still lets me save after reload.Both reloads left nothing half-written, and records persisted (33 after the second reload). Next is the two-tab test. I'm opening a second tab for it and will close it afterwards.Tab B now shows 34 records. I'll check whether tab A updated without a reload, then delete a record in tab B and check again.Tab A is stale: it still shows 33 and lacks TAB-B, so there's no cross-tab sync. I'll confirm the delete in tab B.Tab A is stale. It still lists the deleted "Stres 1" and lacks "TAB-B". Next I'll try deleting the already-deleted record from tab A.The stale delete caused no corruption and no error, and tab A re-synced afterwards. I'm closing the second tab and moving on to invalid input in tab A.The error text exists, but it's rendered at y≈1533 px, well below the fold (viewport height is 928 px), so a user could easily miss it. Next I'll try the .txt file and the 250-character filename.The long filename causes horizontal page overflow. Now I'll read the console and then try the mobile viewport.Mobile check done. I'm restoring the tab and window to how they were.The site held up well: 5 steps passed, 3 passed with caveats, and nothing froze or corrupted data. You gave the URL as an unfilled placeholder, so I tested the site open in your tab (piksel-studyo.vercel.app). I changed no code.

Test data is still in your browser: 33 records in "Çalışmalarım" ("Stres 1" to "Stres 32" minus the deleted "Stres 1", plus "RELOAD-B" and "TAB-B"). Delete them if you don't want them.

| # | What I did | What happened | Result |
|---|---|---|---|
| 1 | Clicked the Diskler, Oyun alanı and Çalışmalarım nav items, the logo, the "Kendi fotoğrafımla dene" CTA, the "Oyun alanında dene" button and the theme toggle. | All worked. Çalışmalarım opens a modal and the CTA reveals the image input. The only `<a>` is the logo, which links to `#`. The header shows a green note, "Sakın tema değiştirmeye bırakacak kere basmayın", and a pink "Düzenleme cihazında" label. No broken links. | **Pass** |
| 2 | Uploaded a 1200×800 PNG and applied filters 27 times with scripted clicks, then 24 more with real mouse clicks. | No freezing, no errors, heap about 65 MB. Each filter took about 350–590 ms to render, which is fine. Real clicks changed the preview correctly. The persistent red banner "İşlemleri birlikte uygulamak için…" looks like an error and may confuse users. | **Pass**, with a UX note |
| 3 | Saved 32 times through the real form. | All 32 records are in IndexedDB, none incomplete. Most saves took about 150 ms, but four took 1.0–2.0 s. The list opens with thumbnails rendering. | **Pass** |
| 4 | Reloaded 15 ms and 90 ms into a save, then again after saving. | The 15 ms reload cancelled the save cleanly, with no partial record. The 90 ms reload saved a complete record. Records survived every reload, and all 33 are complete. | **Pass** |
| 5 | Saved and deleted in a second tab, then checked the first. | No corruption. The first tab did not update until I acted in it. It kept showing the deleted "Stres 1" and missed "TAB-B". Deleting the stale record caused no error and refreshed the list. | **Partial**: data is safe but the display goes stale |
| 6 | Tried a text file, a 0-byte PNG and a text file renamed to .png. | The text file gave "Lütfen bir görsel dosyası seç." and both fake or empty PNGs gave "Görsel açılamadı. JPG, PNG veya WebP dene.", with no crash. That message sits about 1,530 px down the page, below the first screen. The upload tool refused my 254-character filename, so I simulated one inside the page. The page accepted it and showed the full name, but it caused horizontal overflow. | **Partial** |
| 7 | Read the console and network. | The tracker only started recording after I first called it, so it can't speak for page load. After later reloads it showed no console messages. My own error listeners caught no errors or rejections. | **Pass**, but not fully verified |
| 8 | Resized to 390×844 px. | The browser window resize had no effect on the viewport (it stayed 1533 px). I used a 390 px iframe of the site instead, which is a simulation, not a real phone. The layout stacked properly with no horizontal overflow, and header buttons were at least 44 px tall. The modal fits, and a dropdown for disc selection appeared. The disc spines are narrow (29×143 px). I did not test the playground controls at that width. | **Pass** (simulated) |

**Could not do:**
- Real touch or device-emulation testing.
- A true 250-character filename upload through the file picker.
- Checking console output during first page load.
- Visually confirming each of the 20+ filter results. I confirmed the render via screenshots on some, not all.

The Çalışmalarım modal also appeared open once, after the invalid-file uploads, without me clicking it. I couldn't reproduce or explain it, so treat it as unconfirmed.
