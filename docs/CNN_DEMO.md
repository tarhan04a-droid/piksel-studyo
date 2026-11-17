# CNN gösterimi

Mevcut piksel taramasının ardından eklenen, kullanıcı başlatmalı eğitim animasyonu. Üretilmiş zebra fotoğrafı 32 × 32 gri seviye matrise örneklenir. Üç sabit 3 × 3 filtre (dikey/yatay kenar ve Laplasyen), stride 1 ve padding 0 kullanılır. Eğitimde yaygın convolution adıyla kullanılan çapraz korelasyon hesaplanır; filtre katsayıları gösterilen tam sayıların 1/4 ölçeğindedir. ReLU sonrasında 2 × 2 max pooling, stride 2 uygulanır. İkinci ve üçüncü bloklar her kanalı kendi filtresiyle bağımsız işler; bu, genel bir öğrenilmiş çok kanallı CNN değil, sadeleştirilmiş depthwise gösterimidir.

Boyutlar: 32 → 30 → 15 → 13 → 6 → 4 → 2. Son 3 × 2 × 2 harita 12 elemanlık vektör olur. Sinüs tabanlı sabit örnek ağırlıklarla 6 nöron, ardından kosinüs tabanlı 3 çıkış ve kararlı Softmax hesaplanır. A/B/C çıkışlarının hayvan sınıflandırma anlamı yoktur; ağ eğitilmemiştir. Harita gösteriminde her haritanın kendi maksimumuna göre yalnız görsel normalizasyon yapılır; hesaplama değerleri değiştirilmez.

Animasyon yaklaşık 32 saniyedir; başlat/duraklat/başa dön/sonraki aşama ve aşama seçimi vardır. Ekran dışında ve belge gizliyken zaman ilerlemez. Mobilde kartlar iki sütuna yerleşir. MP4/GIF dışa aktarma ve test kilitleri bu ilk sürümde yoktur. Uygulama açılarak denenmedi; derleme/tip kontrolü çalıştırıldı.

Teknik kaynak: https://docs.pytorch.org/tutorials/recipes/recipes/defining_a_neural_network

## Görsel

Dosya: `public/images/cnn/zebra.webp`. Yerleşik image_gen aracıyla üretildi; 640 × 640 WebP web türevi kullanılır. Kullanıcının paylaştığı diyagramın fotoğrafı kopyalanmadı.

Üretim istemi:
> Generate a single photorealistic square wildlife photograph for an educational convolutional neural network animation input. One zebra in full side profile facing right, centered with its complete body, ears, hooves and tail inside frame. Crisp clearly defined black and white stripes, natural anatomy. Softly blurred simple pale olive savannah and short dry grass background, soft daylight, strong readable subject silhouette, no other animals. Natural wildlife photography, no text, no watermark, no diagrams, no borders. Square composition.
