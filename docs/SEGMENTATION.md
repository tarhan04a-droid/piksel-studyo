# Dokunarak alan seçme ve şeffaf PNG

Stüdyo ayarlarında “Nesne ayır / arka planı kaldır” bölümü açıldığında çalışır. Stüdyonun kaynak görselini çalışma çözünürlüğünde (en uzun kenar 1400) kullanır. İndirme orijinal tam boyutlu dosyaya uygulanmaz; mevcut JPEG/PNG indirme ve HSV renk maskesi ayrı kalır.

Bu ilk sürüm semantik/AI nesne bölütlemesi değildir: dört komşulu bağlı bölge büyütme kullanır. Her seçim noktasının RGB rengine olan karesel uzaklık `3 × tolerans²` eşiğiyle karşılaştırılır. Şeffaf kaynak pikselleri seçilmez. Seçime ekle/çıkar noktaları sırayla uygulanır; eşik değişince tüm noktalar aynı yeni eşikle yeniden değerlendirilir. Önceki seçimlerin sırası önemlidir. En fazla 32 nokta, 2 milyon piksel sınırı vardır. Dar tolerans nesnenin yalnız aynı renkli parçasını seçebilir; birbirine benzeyen arka plan ve nesneler birleşebilir. Manuel düzeltme gerekir.

Seçileni sil varsayılandır; arka plana dokunarak arka plan kaldırılır. Seçileni tut, maskeyi tersine çevirerek nesnenin işaretlenen bölgelerini tutar. Seçilmeyen/silinen alanların yalnız alpha değeri sıfırlanır; geri kalan RGB/alpha değerleri korunur. Görünmeyen arka plan yeniden üretilmez. Orijinal dosya üzerine yazılmaz.

Hesaplama ayrı worker'dadır, tolerans değişimi 100 ms birleştirilir. Yeni seçimde eski worker sonlandırılır; güncelliğini kaybetmiş sonuç ve PNG callback'leri gösterilmez. Bölüm kapanınca worker/URL temizlenir. Fotoğraf değiştiğinde seçim sıfırlanır. Önizleme canvas'ı ok tuşlarıyla piksel koordinatı ve Enter/Space ile seçim destekler; koordinatlar görünür. Beş dilde metinler eklenmiştir.

Derleme ve TypeScript kontrolü geçti. Açık test izni bulunmadığından işlev/görsel/telefon testi çalıştırılmadı. Bu, yol haritasındaki gerçek cisim bölütleme için başlangıç aracıdır; öğrenilmiş nesne ayrımı tamamlandı olarak sayılmaz.

## Öğrenilmiş nesne seçimi

“Nesne modeli” seçeneğiyle SlimSAM (`Xenova/slimsam-77-uniform`, Apache-2.0), Transformers.js 4.3.2 WASM/q8 olarak ayrı worker'da çalıştırılır. Model, yalnız “Nesne modelini yükle” düğmesine basılınca Hugging Face'ten indirilir; ONNX runtime dosyaları jsDelivr'dan alınabilir. Görsel cihazdan gönderilmez. Worker bir görselin embedding'lerini bir kez hesaplar ve sonraki noktalarda tekrar kullanır. Olumlu/olumsuz noktalar birlikte prompt oluşturur; modelin tahmin ettiği IoU skoru en yüksek olan maske seçilir. Skor kullanıcıya doğruluk yüzdesi olarak sunulmaz. Model hata yapabilir; semantik sınıf ismi de üretmez.

En fazla 32 nokta, geri alma/temizleme, maske ters çevirme ve şeffaf PNG vardır. Model ve renk yöntemi birbirinden ayrıdır; model çalışmazsa renk yöntemi korunur. Nokta çıkarma model prompt'unu değiştirir; salt piksel silgi değildir. Bölüm/yöntem kapanınca veya fotoğraf değişince worker sonlandırılır. İşlem sırasında yeni nokta engellenir. Klavye ok/Enter/Space seçimi de desteklenir. Çıktı stüdyonun kaynak çalışma çözünürlüğündedir; tam orijinal çözünürlükte çıkarım yapılmaz. Model/runtimelar ilk kullanımda büyük indirme ve bellek gerektirir; cihaz desteği henüz gerçek cihazda doğrulanmadı.

Model kaynağı ve API örneği: https://huggingface.co/Xenova/slimsam-77-uniform

Model sürümü `5850ab45f587c112167512ffef949107115e26a0` olarak sabittir. Model deposu metadata'sında `vision_encoder_quantized.onnx` ve `prompt_encoder_mask_decoder_quantized.onnx` dosyalarının varlığı doğrulandı; model indirilip çalıştırılmadı.

## Bölütleme diskinin fotoğraflı gösterimi

Kullanıcının mevcut `public/images/demos/personal/16.jpg` gün batımı fotoğrafı korunur. Kanallar: orijinal, önceki mor renk maskesi, dağ ön planı seçimi (yeşil vurgu), gökyüzü şeffaflaştırılmış ön plan. Ek fotoğraf veya zebra kullanılmaz. Bu sabit fotoğraf için örnek maske, alt kenara bağlı ve parlaklığı 58'i aşmayan alanların dört komşulu büyütülmesiyle hesaplanır; bir SAM model tahmini olarak sunulmaz. Fotoğrafın RGB pikselleri korunur, son kanalda arka plan alpha'sı sıfırlanır. Dama deseni TV'nin arka zeminidir, PNG piksellerine basılmaz. Kontrol araçlarındaki öğrenilmiş nesne seçimi ve renk tabanlı seçim ayrı çalışmayı sürdürür.
