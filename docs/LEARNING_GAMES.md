# Oyun merkezi: alan kapatma çekirdeği

Mini oyunlar düğmesi Ayarlar gibi native dialog açar. Oyun penceresi tam ekran, ana sayfadan ayrı bir modal yüzeydir. Kapat düğmesi/Escape ile kapanır. Ana sayfada oyun kartları veya oyun ekranı bulunmaz; dialog kapanınca oyun unmount olur ve interval temizlenir. Kullanıcının son yönlendirmesi Paper.io benzeri alan kapatma, pooling bağlantısını sonraya bırakma yönündedir. Önceki sayı/matris cevaplama prototipi kaldırıldı.

## Oynanış

32 × 24 karo alanı, ortada 5 × 5 başlangıç alanı vardır. Oyuncu 110 ms adımlarla hareket eder; kendi alanı dışında açık iz bırakır. Kendi alanına dönünce iz alan olur. Kalan sahipsiz bağlı bileşenler hesaplanır; sınıra bağlı en büyük bileşen dış bölge kabul edilir, diğerleri kazanılır. Sınıra bağlı sahipsiz bileşen yoksa tüm kapalı bölge kazanılır. İzine çarparsan yalnız açık izin kaybolur, kazanılmış alan korunur ve merkezde duraklatılır. Kenara ulaşınca duraklatılır; yön seçerek devam edilebilir. İlk sürümde rakip veya bot yoktur.

Oklar/WASD, Space duraklatma, telefonda kaydırma ve yön düğmeleri vardır. Gizli sekmede oyun duraklar. Canvas yalnız oyun adımlarında yeniden çizilir; sürekli dekor animasyonu veya ses yoktur. Renk ve oyun değeri, başlangıç alanı dışında kazanılan oranı 0–255'e dönüştürür. 255 ancak bütün alan kazanılınca olur. Değer >128 iken HUD metni koyudur. Mevcut alan localStorage `pollmek-territory-game-v1` altında saklanır; açık iz saklanmaz. Yeni yolculuk bu alan kaydını sıfırlar. Kayıt hatası kullanıcıya gösterilir.

## Kilitler ve sorular

Matematik ve derin analiz kartları ders notlarından gelecek soruları bekler. Başarı/test sonucu uydurulmaz. Temel CNN/kod/matris görünümü açık kalır. Alan oyunu henüz pooling veya matematik başarısı sayılmaz; kullanıcıyla pooling bağlantısı netleştirildikten sonra kilitlere bağlanacaktır. Modern tema bu aşamada yoktur.

Derleme/TypeScript kontrolü geçti. Açık test izni bulunmadığından oynanış, mobil ve alan doldurma davranışı uygulamada test edilmedi. Ana JavaScript paketi için 500 kB boyut uyarısı sürer; eşik değiştirilmedi.

## Güncel bölüm sistemi

Önceki tek 32×24 harita ve yüzde→0–255 renk dönüşümü kaldırıldı. Yeni kayıt anahtarı `pollmek-territory-levels-v2`; eski harita kaydı yeni düzene taşınmaz. İlk hedef 7×7, merkezdeki başlangıç alanı 3×3 ve başlangıç renk değeri 3'tür. Tam dolunca renk 7 olur, oyun duraklar ve sonraki bölüm düğmesi açılır. 9×9 hedefin başlangıç alanı 7×7'dir. Zincir 7, 9, 11, …, 255 şeklinde ilerler. Bölüm içinde renk değişmez; yüzde yalnız o bölümün doluluğunu gösterir. 255×255 tamamlanınca yolculuk biter. Başlangıç alanı büyür; hareket eden imleç tek hücre kalır.

Alan doldurma ve iz kuralları korunur. Canvas kare ve sabit 640×640 fiziksel boyuttadır; her bölüm kareli matris olarak ölçeklenir. Büyük haritalarda arka plan/alan katmanı yalnız alan kazanılınca veya bölüm değişince yeniden çizilir; her hareket adımında on binlerce hücre tekrar boyanmaz. Yeni kayıtta boyut, hücre değerleri ve başlangıç karesinin korunması doğrulanır. Renk ve tamamlanma durumu kaydedilmiş alanlardan yeniden türetilir. Oynanış testi yapılmadı; derleme/tip kontrolü geçti.

## Son oynanış düzeltmesi

Kullanıcının “kare biz olalım, Paper.io'yu kopyalama” isteğiyle açık iz, alanı çevreleme ve kendi izine çarpma kaldırıldı. Oyuncu ilk bölümde gerçekten 3×3 hücrelik kare; sonraki bölümde önceki tamamlanan kare boyutundadır. Geçtiği hücreleri doğrudan doldurur. Sınıra gelince oyun durmaz; kare karşı kenardan devam eder (toroidal sarma). İlk değer 3 için kare tam beyaz; sonraki kare tonu 255−değer olarak koyulaşır. Renk değeri ile RGB parlaklığı ayrı kavramlardır. HUD'un mevcut bölüm/renk değerleri korunur. Kare çizimi büyük bölümlerde hücre hücre değil, kenarlara sarılan en fazla dokuz dikdörtgenle yapılır. Önceki açıklamalardaki tek hücreli imleç ve iz kuralları artık geçerli değildir.

## Güncel başlangıç ve duvar kuralı

Son kullanıcı düzeltmesi: başlangıç 1×1 beyaz kare; ilk hedef 3×3, ardından 5×5, 7×7, …, 255×255. Tamamlanınca oyuncu karesi hedef boyutuna büyür ve boyuta bağlı yeni renge geçer. Beyaz başlangıç dışında renk hue=(değer×37)%360, saturation=%58, lightness düşük değerlerde %75/yüksek değerlerde %38 olarak seçilir; mantıksal 0–255 değeri RGB gri parlaklığı değildir. Kenardan karşıya sarma kaldırıldı. Merkez konumu karenin yarı boyutu kadar içeride sınırlandırılır, dolayısıyla karenin tamamı içeride kalır. Duvara gelince oyun pause olmaz; kullanıcı yön değiştirene kadar o konumda kalır. Kayıt anahtarı yeni kurallar için `pollmek-territory-levels-v3`; önceki başlangıç düzeni taşınmaz. Derleme/tip kontrolü geçti; oynanış testi yapılmadı.

## Güncel kontrol ve renk kuralı

WASD/oklar, oyun bileşeni açıkken window keydown üzerinden dinlenir; canvas odağı gerekmez. Metin/form alanları ve Ctrl/Alt/Meta kombinasyonları yakalanmaz. Yön vermek oyunu başlatır; Space duraklatır/devam eder. Telefonda yön kaydırması da başlatır. Başlat, yön düğmeleri ve sonraki bölüm düğmesi kaldırıldı; yalnız yeni yolculuk/sıfırlama düğmesi kaldı. Bölüm dolunca sonraki bölüme aynı yönde otomatik geçilir; 255 bitişi durur. Eski kayıtta tamamlanmış ara bölüm varsa açılışta sonraki bölüme hazırlanır.

Son renk isteği önceki beyaz/palet tercihini değiştirir: kare doğrudan rgb(değer,değer,değer) kullanır, değerler 1,3,5,7,… şeklinde artar. RGB(1,1,1) siyaha yakındır; 255 beyazdır. İlk karenin beyaz olduğu önceki açıklamalar artık geçerli değildir. Renkli HSL paleti kaldırıldı. Derleme ve tip kontrolü geçti; gerçek klavye/oynanış testi henüz yapılmadı.

## RGB ve serbest mod

Son renk isteğiyle eşit kanallı gri kaldırıldı. RGB kanalları boyuta bağlı ayrı modüler dizilerden hesaplanır: (47v+40)%256, (79v+110)%256, (113v+180)%256. Kare ve HUD gerçek renkli RGB kullanır; yazı kontrastı hesaplanan parlaklığa göre belirlenir.

Serbest modda hedef N×N (1–255) ve oyuncu kenarı (1–N) kullanıcı seçer. Çift boyutlar da desteklenir. Bu mod tek alan olarak tamamlanır; normal bölüm zincirine veya kilitlere katılmaz, normal yolculuk kaydının üstüne yazmaz. Normal yolculuğa geçiş sıfırdan başlatır. Özel alan ve yarım bölüm saklanmaz.

Serbest modun pooling deneyinde Max/Average, kernel 2/3/5, stride 1/2/3, izin verilen padding 0..floor(kernel/2) seçilir. Dolu hücre 1/boş 0 maskesi üzerinden gerçek sonuç hesaplanır; alan boyama hareketini değiştirmez. Max padding −∞, average padding 0'dır ve average hesabına padding dahildir. Geçersiz/boş çıktı boyutunda hesap düğmesi kapalıdır. Sonuç canvas'ta gösterilir ve alan/ayar değişince temizlenir. Sayısal sonuçlar matrisi küçültmenin etkisini gösterir, model tahmini değildir. Derleme/tip kontrolü geçti; oynanış veya pooling işlev testi yapılmadı.

Son renk düzeltmesi: modüler RGB paleti kaldırıldı. R=G=B=boyut; üç kanal 1,3,5,7,… şeklinde birlikte artar. Bu eşit kanallar gri tonları üretir. Serbest mod özellikleri korunur.

## Stride/padding artık oyun zorluğu

Kullanıcının düzeltmesi: Serbest moddaki stride, hareket mesafesi (1–8 hücre); padding, hedef N×N alanın kenarlarında kırmızı tehlikeli duvar kalınlığıdır. Önceki bağımsız pooling önizlemesi oyun arayüzünden kaldırıldı. Oyuncu karesi sadece indiği yeri boyar; atlanan hücreler boyanmaz. Padding >0 iken bir hareketin kare ayak izi duvar bölgesine girerse oyun durur ve “Yandın!” görünür; duvarın ötesine atlamak da çarpışmadır. Duvar hücreleri hedef doluluk sayısına katılmaz: oynanabilir alan (N−2p)². Kare bu alanın içine sığmalıdır. Padding=0 davranışında dış sınırda kalma korunur.

Yeniden başlatma, serbest modun aynı boyut/stride/padding kurallarını korur. Yolculuk düğmesi normal 1×1 başlangıca döner. Stride kareden büyük ve padding duvarı varsa erişilemeyen hücreler oluşabileceği ayar panelinde belirtilir; bu durumda kare büyütmek veya stride azaltmak gerekir. Renk davranışı değiştirilmedi. Derleme/tip kontrolü geçti; oynanış testi yapılmadı.

## Görünür sıçrama ve boyama boşluğu

Kullanıcının boşluk isteği için stride >1 mesafesi oyuncu karesi genişliği × stride olarak yorumlandı. Örnek: 3×3 oyuncu + stride2 = 6 hücrelik sıçrama, sadece varıştaki 3×3 boyanır. Stride1 normal tek hücrelik hareketi korur. Interval 110×stride ms olarak ölçeklenir; yalnız hız artışı görüntüsü verilmez. Ara konumlar ne çizilir ne boyanır. Padding duvarı kontrolü sıçramanın gideceği konum ve dış sınır üzerinden korunur. Bu bir görüntü işleme katmanındaki hücre bazlı stride tanımı değil, oyuna özgü kare-adım mesafesidir.

## Sağlanan 10 soru ve İnce İşlemler

Kullanıcının paylaştığı S1–S10 soru/cevap grupları, her gruptan bir çoktan seçmeli soru olacak şekilde uyarlanarak `mathQuestions.ts` içine eklendi. Açıklamalar kaynak gruplardaki ek kavram ve hesapları korur. Tek yanıtta dört seçenek vardır; yanlış cevap açıklanır ve tekrar deneme verilir. Bütün on soru doğru tamamlanınca aynı oyun ekranında etkileşimli gama/logaritma eğrileri açılır. İlerleme soru kimlikleriyle `pollmek-math-quiz-v1` altında tutulur. Bu yerel eğitim kilididir, güvenli yetkilendirme değildir. Yeni soru sürümünde kayıt anahtarı/soru kimlikleri güncellenmelidir. Yalnız soru seti Türkçe; dil diğerinde seçilse de sorular lang=tr/dir=ltr ile korunur ve durum kullanıcıya belirtilir. Arayüz beş dilde çevrilidir.

Düzeltmeler: S3(c)'deki çelişkili “500·0,1 değil” sözü kaldırıldı; sonuç 50. S9'da OpenCV tileGridSize, karo piksel boyutu değil satır/sütundaki karo sayısı olarak düzeltildi. S2 saklama hesabı paketli 12-bit, başlıksız veri varsayımıyla açıklandı; 16-bit kapta saklamanın farklı olduğu yazıldı. S6 NumPy ifadesi iki uint8 dizi aritmetiği olarak netleştirildi; Python/NumPy skaler dönüştürme farklılıklarıyla karıştırılmadı. Gürültü ortalamasına bağımsız/sıfır ortalamalı varsayımı eklendi. Orijinal slaytlar bu oturumda verilmedi; açıklamalar kullanıcı metnine dayanır, kaynak ders notlarının tamamı okundu iddiası yoktur.

Gama/log dersinde normalize dönüşümler hesaplanır ve 8-bit sonuç ayrıca yuvarlanır. Gama 0.2–3, log a 0–255; a=0 için özdeşlik özel durumu vardır. Bu bir açıklama laboratuvarıdır, stüdyodaki fotoğraf ayarlarını kendiliğinden değiştirmez. Derin analiz kartı ayrı soruları beklemeyi sürdürür, modern tema eklenmedi. Uygulama testi yapılmadı; derleme/tip kontrolü geçti.

Teknik kontrol kaynakları: https://docs.opencv.org/5.0/javadoc/org/opencv/imgproc/CLAHE.html ve https://docs.opencv.org/4.12.0/d0/d86/tutorial_py_image_arithmetics.html

## Matematik soru seti güncellendi

Kullanıcının son verdiği saf matematik seti S1–S10, matematik testinin yerini aldı. Türev, logaritma, tek/çift toplam, belirli integral ve dört işlem içerir; görüntü işleme önbilgisi gerektirmez. 2473×3470 son soruda korunur; sonuç 8.581.310. Her soru grubu tek çoktan seçmeli maddeye uyarlanır ve alt hesaplar açıklamada korunur. Yeni soru kimlikleri pure-math-01…10 ve kayıt anahtarı pollmek-math-quiz-pure-v2; eski görüntü işleme testi başarıları yeni matematik testine aktarılmaz. Önceki soru bankası analysisQuestions.ts içinde ayrı saklanır; derin analiz testi henüz bu bankayla etkinleştirilmedi. On doğru cevapla açılan İnce İşlemler davranışı aynıdır. Derleme/tip kontrolü geçti; test çalıştırılmadı.

## İki bağımsız test / iki bağımsız ödül

Saf matematik bankası yalnız İnce İşlemler (gama/log laboratuvarı) açar: pollmek-math-quiz-pure-v2. Önceki görüntü işleme/CNN bankası artık ayrı Derin analiz testidir ve yalnız İleri CNN analizi açar: pollmek-analysis-quiz-v1. Birbirinin soru kimlikleri ve başarıları kabul edilmez. Her iki sette de tüm 10 doğru soru kimliği gerekir. Eski karışık matematik testi anahtarı hiçbir kilitte okunmaz.

CNN modülünün temel animasyon/kod/matris seçenekleri açık kalır. Derin analiz tamamlanınca ek panelde seçili katmanın gerçek sayısal çarpımları/toplamı/ReLU, pooling pencere maksimumu, flatten indeksleme ve örnek dense/softmax ağırlık hesapları incelenebilir. Panel yalnız analysis tamamlanmasıyla görünür; math başarısı bu paneli açmaz. Saf matematik ve teknik soru setleri ayrı açılır, aynı anda yalnız bir oyun/test görünür. İlerleme kaydedildiğinde sayfa içi olay ile CNN kilidi yenilenir. Yerel eğitim kilididir, güvenlik sınırı değildir. Derleme/tip kontrolü geçti; işlev testi yapılmadı.

## İnce İşlemler stüdyoya taşındı

Son kullanıcı düzeltmesi: İnce İşlemler quiz altında açılan içerik değildir. Ana stüdyoda ayrı kilitli bölüm; test tamamlanmadan hover/focus/tap ile 10 soruluk matematik testi gereksinimi gösterilir. Saf matematik başarısı bu bölümü açar. Quiz sonunda yalnız stüdyoda açıldığını bildiren metin görünür. Derin analiz başarısı hâlâ yalnız ileri CNN panelini açar.

Matematik kapsamı log/gama ile sınırlı değildir. 18 araç için referans, gama, log, kontrast, negatif, gri seviye, ikili eşikleme, RGB, HSV, ışık bandı, medyan, ortalama, Gauss, genişletme/aşındırma, bölütleme, otomatik karar kuralları ve histogram eşitleme formül/açıklamaları eklendi. Etkileşimli eğri laboratuvarı şu an gama/log içindir; diğerlerinin formül anlatımı vardır. Formül açıklamaları Türkçedir; arayüz metinleri beş dildedir. Bu açıklama bölümü stüdyo fotoğrafını kendiliğinden değiştirmez. Derleme/tip kontrolü geçti; hover/focus/oynanış testi yapılmadı.

## Ana fotoğrafa bağlı matematik ve grafik

Bağımsız gama/log laboratuvarı kaldırıldı. İnce İşlemler artık `processedSource`, `output`, `appliedSettings` alır; yani son tamamlanmış aynı worker işinin giriş/çıkış/ayar eşleşmesini kullanır. İşlem sürerken son tamamlanmış sonuç olduğu belirtilir. Ayrı demo fotoğrafı veya bağımsız gama/log sürgüsü yoktur.

Gerçek önce/sonra canvas'ında piksel seçilir; gerçek giriş/çıkış RGBA gösterilir. Kanal Y/R/G/B seçimine göre en fazla 4096 görünür pikselden giriş→çıkış nokta dağılımı ve örneklenmiş önce/sonra histogramı hesaplanır. Bu tüm stüdyo zincirinin etkisini gösterir; yalnız log/gama eğrisi değildir. Medyan/morfoloji gibi komşuluk işlemlerinde aynı giriş için farklı çıktı mümkün olduğundan sahte tek transfer eğrisi çizilmez. Grafik örneklemelidir, tam çözünürlük histogramı olduğu söylenmez.

Yalnız uygulanmış işlemlerin formülleri, gerçek ayar nesnesiyle `process(source, settings)` çağrısı ve seçili piksel başlangıç/sonuç değerleri gösterilir. Kaynak 3×3 komşuluk da incelenebilir; bunun filtreye girmeden önceki dönüşümlerden geçmiş ara komşuluk olduğu iddia edilmez. Formül açıklamaları Türkçedir, arayüz beş dildedir. Bağımsız nesne ayırma/video çıktıları ana stüdyo worker çıktısına uygulanmadığı için bu panelde onların sonucu varmış gibi gösterilmez. Derleme/tip kontrolü geçti; görsel/işlev testi yapılmadı.

## Derin analiz stüdyo girişi

Ana stüdyoda ayrı Derin analiz bölümü eklendi; yalnız analysis testiyle açılır. Kilitliyken hover/focus/tap gereksinimi gösterir. Açılınca son tamamlanmış gerçek stüdyo giriş/çıkış görüntülerinin seçili koordinattaki 3×3 R/G/B/Y komşulukları ve uygulanan ayarlarla işlem kodu gösterilir. Matematik kilidi bu bölümü açmaz; matematik bölümüne kod geri eklenmedi. CNN gösterimindeki ileri panel de korunur. Derleme/tip kontrolü geçti; görsel/işlev testi yapılmadı.

## İşlem bazında kod açıklamaları

Derin Analiz'e mevcut ayarlarla aktif işlem parçaları eklendi. Negatif açıkken R/G/B için 255−kanal örneği açık gösterilir; alpha korunur. Kod parçaları açıkça okunabilir anlatım olarak etiketlenir, tek başlarına bütün işlem hattı olduğu iddia edilmez. Ayrıca engine.ts gerçek kaynak metni Vite ?raw ile doğrudan gösterilir; kaynakla ayrı bir kopya tutulmaz. Bu içerik yalnız kilit açılıp panel açıldığında dinamik yüklenir. Matematik bölümüne kod eklenmedi. Derleme/tip kontrolü geçti; işlev testi yapılmadı.
