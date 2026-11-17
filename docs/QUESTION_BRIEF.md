# Ders notlarından soru hazırlama isteği

Aşağıdaki isteği ders notlarınla birlikte soru hazırlayacak yapay zekâya verebilirsin:

> Yalnız paylaştığım ders notlarına dayanarak Pollmek Vision Sandbox için Türkçe çoktan seçmeli sorular hazırla. İlk set, kolaydan zora 10 matematik sorusu olsun: piksel değerleri, normalizasyon, eşikleme, gama, logaritma ve histogram/kontrastın matematiği. Notlarda bulunmayan konuyu ekleme. İkinci set görüntü işleme, CNN, convolution/ReLU, pooling, kernel, stride, padding ve operasyonel yapay zekâ konularında derin analiz soruları olsun; kapsamı notlarıma göre seç. Her soruda tek ve tartışmasız doğru cevap, dört seçenek, doğru cevabın kısa adım adım açıklaması ve nottaki kaynak sayfa/bölümünü ver. Notların eksik veya çelişkili olduğu yerde bunu açıkça belirt; cevap uydurma. İlk sette zorluk kolaydan zora artsın. Soruları bağımsız olarak kontrol et; yanlış seçenekler makul olsun. Çıktı aşağıdaki JSON yapısında olsun. correctIndex sıfırdan başlar: 0=A, 1=B, 2=C, 3=D.

```json
{
  "math": [
    {
      "id": "math-01",
      "prompt": "Sorunun metni",
      "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"],
      "correctIndex": 0,
      "explanation": "Doğru cevabın kısa çözümü",
      "topic": "Konu",
      "difficulty": 1,
      "sourceNote": "Ders notu adı, sayfa veya bölüm"
    }
  ],
  "analysis": []
}
```

Bu örnek yalnız biçimdir; gerçek soru değildir. Matematik setinde toplam 10 gerçek soru bulunmalı. Derin analiz seti aynı soru biçimini kullanmalı. Çıktıyı metin olarak paylaşman yeterli; uygulamada kullanıcıya kod veya JSON göstermek gerekmeyecek.
