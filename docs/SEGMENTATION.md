# Dokunarak alan seçme ve şeffaf PNG

Stüdyo ayarlarında “Nesne ayır / arka planı kaldır” bölümü açıldığında çalışır. Stüdyonun kaynak görselini çalışma çözünürlüğünde (en uzun kenar 1400) kullanır. İndirme orijinal tam boyutlu dosyaya uygulanmaz; mevcut JPEG/PNG indirme ve HSV renk maskesi ayrı kalır.

Bu ilk sürüm semantik/AI nesne bölütlemesi değildir: dört komşulu bağlı bölge büyütme kullanır. Her seçim noktasının RGB rengine olan karesel uzaklık `3 × tolerans²` eşiğiyle karşılaştırılır. Şeffaf kaynak pikselleri seçilmez. Seçime ekle/çıkar noktaları sırayla uygulanır; eşik değişince tüm noktalar aynı yeni eşikle yeniden değerlendirilir. Önceki seçimlerin sırası önemlidir. En fazla 32 nokta, 2 milyon piksel sınırı vardır. Dar tolerans nesnenin yalnız aynı renkli parçasını seçebilir; birbirine benzeyen arka plan ve nesneler birleşebilir. Manuel düzeltme gerekir.

Seçileni sil varsayılandır; arka plana dokunarak arka plan kaldırılır. Seçileni tut, maskeyi tersine çevirerek nesnenin işaretlenen bölgelerini tutar. Seçilmeyen/silinen alanların yalnız alpha değeri sıfırlanır; geri kalan RGB/alpha değerleri korunur. Görünmeyen arka plan yeniden üretilmez. Orijinal dosya üzerine yazılmaz.

Hesaplama ayrı worker'dadır, tolerans değişimi 100 ms birleştirilir. Yeni seçimde eski worker sonlandırılır; güncelliğini kaybetmiş sonuç ve PNG callback'leri gösterilmez. Bölüm kapanınca worker/URL temizlenir. Fotoğraf değiştiğinde seçim sıfırlanır. Önizleme canvas'ı ok tuşlarıyla piksel koordinatı ve Enter/Space ile seçim destekler; koordinatlar görünür. Beş dilde metinler eklenmiştir.

Derleme ve TypeScript kontrolü geçti. Açık test izni bulunmadığından işlev/görsel/telefon testi çalıştırılmadı. Bu, yol haritasındaki gerçek cisim bölütleme için başlangıç aracıdır; öğrenilmiş nesne ayrımı tamamlandı olarak sayılmaz.
