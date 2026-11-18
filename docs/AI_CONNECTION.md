# Pollmek uzak MCP bağdaştırıcısı

Claude → Ayarlar → Bağdaştırıcılar → Özel bağdaştırıcı ekle ekranına HTTPS URL ile eklenir. Sitede Ayarlar → AI bağlantısı → Stüdyo bağlantısını aç → Bağlantıyı kopyala. URL `/api/mcp?session=…` biçimindedir; oturum sırrını içerir ve şifre gibi korunmalıdır. Ortak kataloğa listelenmek ayrıca sağlayıcı onayı gerektirir; bu uygulama özel bağdaştırıcı oluşturur.

## Yayın için gereken yapılandırma

Vercel projesine Redis/Upstash bağlanmalıdır. Kullanıcının paylaştığı Vercel ekranında Free planın piksel-studyo projesine bağlı olduğu görülmüştür; sunucu ortam değişkenleri aşağıdaki isimlerle yeni yayına aktarılmalıdır. Eksik yapılandırmada arayüz açıkça “Sunucuda bağlantı deposu henüz kurulmadı” gösterir. MCP initialize ve tools/list depoya ihtiyaç duymaz; gerçek araç çağrıları ihtiyaç duyar.

Vercel sunucu ortam değişkenleri:

- `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN`, **veya**
- `KV_REST_API_URL` ve `KV_REST_API_TOKEN`.

Bunları `VITE_` önekiyle eklemeyin, kaynak koda veya Git’e koymayın. Yetkiler geçici session/task/result anahtarlarında okuma, yazma, silme ve EVAL gerektirir. Mevcut Vercel fonksiyonları standart Node yerleşik modüllerini kullanır; yeni npm paketi yoktur. Ücretsiz kota veya ücret koşulları sağlayıcının güncel planına bağlıdır; bu değişiklikte ücretli servis açılmadı. `vercel.json` API fonksiyonlarının şema dosyasını içermesini ve 30 saniyelik üst süreyi ayarlar.

## Kullanım

1. Yayınlanmış sitede fotoğrafı aç, Ayarlar → AI bağlantısı üzerinden stüdyo bağlantısını aç.
2. Üretilen özel URL’yi Claude’un özel bağdaştırıcısına ekle; araçları sohbet için etkinleştir. Ayrı bir AI API anahtarı istenmez, AI hesabının normal kullanım sınırları geçerlidir.
3. “Pollmek fotoğrafının renklerini ters çevir” gibi bir istek ver. `pollmek_apply` girdisi örneğin `{"settings":{"negative":true}}` olur. Yanıt işlemin kuyruğa alındığını belirtir; AI `pollmek_status` ile `processing:false`, `error:null` ve `appliedSettings` sonucunu kontrol etmelidir.
4. Sekme açık kalmalıdır; sunucu fotoğrafı işlemez. Bağlantıyı kesmek yeni komutları durdurur, uygulanmış ayarları geri almaz. Bağlantıyı yenilemek eski sekme bağlantısını siler; yeni bir rastgele sır üretilir. Sayfa yenilemek sırrı unutturur; yeniden bağdaştırıcı URL’si eklenmesi gerekir.

Araçlar: `pollmek_connection`, `pollmek_status`, `pollmek_apply`, `pollmek_auto`, `pollmek_reset`, `pollmek_histogram`. Düzenleme mevcut stüdyo worker hattını kullanır. Fotoğraf baytları, dosya adı veya disk yolu paylaşılmaz; model doğrudan görseli görmez. Yalnız ayar ve sayısal ölçümler Redis üzerinden geçici olarak iletilir. Video, toplu dışa aktarım, SAM noktaları, oyun/test kilitleri veya keyfi kod çalıştırma yetkisi yoktur. Orijinal dosya korunur.

## Mimari ve sınırlar

- `/api/mcp`: Streamable HTTP JSON yanıtları; initialize, ping, tools/list, tools/call. Protokol müzakeresi 2025-03-26 / 2025-06-18 / 2025-11-25. GET/SSE akışı sunulmaz (405); oturum taşıması isteklerdeki özel URL ile sağlanır, MCP transport session zorunlu tutulmaz. 2026 stateless sürümü uygulanmamıştır.
- `/api/bridge`: açık tarayıcının kimlik doğrulamalı komut polling’i ve sonuç gönderimi. Bu uç MCP değil, özel tarayıcı iletişimidir. Token URL dışında Bearer başlığıyla iletilir. Tam Origin kontrolü yapılır; localhost geliştirme sayfası yayın API’sini kullanabilir. Gelen Origin yoksa tarayıcı köprüsü reddeder.
- Ortak depo zorunludur: Vercel fonksiyon belleği/sunucu içi Map ortak ve kalıcıymış gibi kullanılmaz. Sırrın SHA-256 özeti anahtar adıdır; sır açık metin olarak Redis’e yazılmaz. Session TTL 180 saniye, komut TTL 25 saniye, sonuç TTL 45 saniyedir.
- Sekme sahipliği/canlılık 45 saniyelik pencereyle kontrol edilir. Aynı sekme için heartbeat en sık 30 saniyede bir yenilenir; her yoklamada HSET/EXPIRE yapılmaz.
- Tek sekme sahipliği, canlılık kontrolü, komut kuyruğunda tek işlem ve atomik Lua işlemleri vardır. Araç çağrısı yaklaşık 20 saniye tarayıcı yanıtını bekler. Askıya alınmış/kapalı sekme yanıt vermeyebilir. Zaman aşımında teslim edilmiş düzenlemenin uygulanıp uygulanmadığı belirsizdir; tekrar etmeden status okunmalıdır. HTTP iptali önceden uygulanmış ayarı geri almaz.
- Bearer URL, OAuth hesabı değildir. Kontrol yalnız URL’nin 256 bitlik sırrını bilen kişiye açıktır; bu sırrı sohbet dışındaki kişilerle veya herkese açık ekran görüntüleriyle paylaşmayın. Kimlik doğrulamasız katalog kaydı/kurumsal OAuth akışı sunulmaz. Claude bağlantıyı kendi sunucularından kurduğundan yayın adresi internete açık HTTPS olmalıdır.
- Son AI komutundan itibaren ilk 30 saniye kontroller 2,5 saniye, ardından 2 dakikaya kadar 5 saniye, daha uzun boşlukta 8 saniye aralığındadır (ağ süresi ayrıca eklenir). Gerçek bir tarayıcı komutu hızlı aralığı yeniden başlatır; heartbeat AI etkinliği sayılmaz. 10 dakika AI komutu gelmezse bağlantı kesilir; aynı URL ile yeniden açılabilir. Üç ardışık bağlantı hatasında da durur; ilk iki hatada 5/10 saniye geri çekilir. Sonuç bekleyen MCP fonksiyonu Redis’i 1,5 saniyede bir kontrol eder. Bu değerler ölçülmüş kota garantisi değildir.
- Bağlantı kapalıyken polling yoktur. AI paneli yalnız ayarlardaki bölümü açınca yüklenir. Model/AI API çağrısı veya API anahtarı eklenmez.

Kaynaklar: [Claude özel bağdaştırıcılar](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp), [MCP taşıması](https://modelcontextprotocol.io/specification/2025-11-25/basic/transports), [MCP araçları](https://modelcontextprotocol.io/specification/2025-11-25/server/tools), [Vercel Node fonksiyonları](https://vercel.com/docs/functions/runtimes/node-js).

Derleme, Node sözdizimi ve diff denetimleri yapılır. Kullanıcı açık test izni vermediğinden bağlantı/Redis/Claude uçtan uca denenmez; Yayın isteği üzerine derleme sonrasında GitHub/Vercel güncellenir; dağıtım durumu kontrolü işlevsel bağlantı testi yerine geçmez.
