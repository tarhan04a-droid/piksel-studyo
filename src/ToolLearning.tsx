import CropLearning from './CropLearning';
import CutoutLearning from './CutoutLearning';
import ToolAnimation from './ToolAnimation';
import {useState} from 'react';
import {t,useLanguage} from './i18n';
import {LearningMath} from './LearningMath';
const lessons={
 cutout:{title:'Nesne ayırma ve arka plan kaldırma',steps:[['Renk tabanlı seçim','Dokunulan pikselden başlayarak benzer renkli bağlı komşular seçilir. Tolerans büyüdükçe daha farklı renkler de bölgeye katılır.'],['Nesne modeli','Kutuyla veya serbest sınırla seçtiğin alan eksiksiz korunur. Noktayla nesne seçimi ayrı olarak modeli kullanır.'],['Şeffaf sonuç','Maske seçili piksellerin alfa kanalını korur, diğerlerini sıfırlar. Seçimi ters çevirmek tutulan ve silinen alanları değiştirir. Küçük kapalı delikler isteğe bağlı doldurulur.']],formula:'α′ = α × M\nM ∈ {0, 1}\nM_inverse = 1 − M',example:'M = 1, α = 255 → α′ = 255\nM = 0, α = 255 → α′ = 0',meaning:'Şeffaflık arka planın arkasındaki görüntüyü üretmez. İnce dallar, saçlar ve benzer renkli bölgeler elle düzeltme gerektirebilir.'},
 files:{title:'Dosya araçları',steps:[['Kırpma ve boyut','Kırpma seçili dikdörtgeni tutar. Yeniden boyutlandırma piksel sayısını değiştirir; büyütmek yeni ayrıntı üretmez.'],['PNG sıkıştırma','Kayıpsız sıkıştırma aynı çözülmüş pikselleri daha verimli kodlar. Dosya her zaman küçülmez; JPEG yeniden kodlama ise kayıplı olabilir.'],['Dosya kilidi','Pollmek kilidi dosya başlığını tersine çevrilebilir biçimde değiştirir ve işaret ekler. Parolalı şifreleme değildir; gizlilik koruması olarak kullanılmamalıdır.']],formula:'W′ = round(W × s)\nH′ = round(H × s)\nR = 100 × (1 − B_after / B_before)',example:'W = 960, H = 640, s = 0.5\nW′ = 480, H′ = 320\nB_before = 1000, B_after = 750 → R = 25%',meaning:'Boyut, kalite ve dosya büyüklüğü farklı ölçülerdir. Kayıpsızlık dosya baytlarının aynı olması değil, çözülen piksellerin aynı kalmasıdır.'},
 video:{title:'Video araçları',steps:[['Hız ve ses','Hız katsayısı karelerin zaman damgalarını değiştirir. Ses temposu aynı katsayıyla ayarlanır; yeni süre eski sürenin katsayıya bölümüdür.'],['Çözünürlük ve sıkıştırma','720p ve 1080p seçenekleri görüntüyü sınırlar, en-boy oranını korur. Daha yüksek sıkıştırma daha az veriyle birlikte ayrıntı kaybı getirebilir.'],['MP4 çıktısı','Video tarayıcıda FFmpeg ile H.264 ve AAC kullanılarak MP4 biçiminde yeniden kodlanır. İlk kullanımda motor indirilir; büyük dosyalar zaman ve bellek ister.']],formula:'T′ = T / r\nPTS′ = (PTS − PTS_start) / r\nB ≈ (b_video + b_audio) × T′ / 8',example:'T = 60 s, r = 2 → T′ = 30 s\nb_total = 2,000,000 bit/s\nB ≈ 7,500,000 byte',meaning:'Dosya boyutu örneği yaklaşık bir hesaplamadır. Gerçek bit hızı içeriğe ve kalite ayarına göre değişir; daha küçük çıktı garanti edilmez.'}
};
const shortDescriptions={
 cutout:['Benzer renkli bağlı pikselleri seçer. Tolerans, seçimin ne kadar genişleyeceğini belirler.','Kutuyla veya serbest sınırla seçtiğin alan eksiksiz korunur. Noktayla nesne seçimi ayrı olarak modeli kullanır.','Seçilen nesne kalır, arka plan şeffaf olur. Seçimi ters çevirebilirsin.'],
 files:['Seçili alanı tutar veya görüntünün piksel boyutunu değiştirir.','Pikselleri değiştirmeden PNG dosyasını sıkıştırır; dosya her zaman küçülmez.','Dosya başlığını geri alınabilir biçimde değiştirir. Parolalı şifreleme değildir.'],
 video:['Görüntü ve sesi aynı katsayıyla hızlandırır veya yavaşlatır.','En-boy oranını koruyarak çözünürlüğü ve veri miktarını azaltır.','Görüntü ve sesi H.264/AAC ile bir MP4 dosyasında birleştirir.']
};
export default function ToolLearning({kind,showMath,step}:{kind:keyof typeof lessons;showMath:boolean;step?:number}){
 useLanguage();const lesson=lessons[kind],[rate,setRate]=useState(kind==='video'?2:1),[stage,setStage]=useState(0),selected=step??stage;
 const fileMath=[
 {formula:'W′ = x₂ − x₁\nH′ = y₂ − y₁',example:'455 − 135 = 320\n375 − 55 = 320\n320 × 320'},
 {formula:'R = 100 × (1 − B_after / B_before)',example:'1000 byte → 750 byte: R = 25%'},
 {formula:'h′ = h XOR 0xA5\nh = h′ XOR 0xA5',example:'0x89 XOR 0xA5 = 0x2C\n0x2C XOR 0xA5 = 0x89'}
 ];
 const videoMath=[{formula:'T′ = T / r',example:`6 s / ${rate} = ${(6/rate).toFixed(2)} s`},{formula:'W′ / H′ = W / H',example:'640 × 640 → 320 × 320'}, {formula:'MP4 = ftyp + moov + mdat',example:'H.264 + AAC → MP4\n144 frames / 24 fps = 6 s'}];
 const math=kind==='files'?fileMath[selected]:kind==='video'?videoMath[selected]:lesson;
 return <section className="architecture-demo tool-learning"><h2>{t(lesson.steps[selected][0])}</h2><p>{t(shortDescriptions[kind][selected])}</p>{kind==='cutout'?<CutoutLearning method={selected===0?'color':'model'}/>:kind==='files'&&selected===0?<><ToolAnimation kind={kind} labels={lesson.steps.map(([title])=>title)} rate={rate} selectedStage={step} onStageChange={setStage}/><CropLearning/></>:<ToolAnimation kind={kind} labels={lesson.steps.map(([title])=>title)} rate={rate} selectedStage={step} onStageChange={setStage}/>}{kind==='video'&&selected===0&&<div className="filter-settings"><label>{t('Hız')} · {rate}×<input type="range" min="0.5" max="10" step="0.25" value={rate} onChange={e=>setRate(+e.target.value)}/></label><output>{t('Süre')} · 6 s → {(6/rate).toFixed(2)} s</output></div>}{showMath&&<LearningMath formula={math.formula} example={math.example} meaning=""/>}</section>;
}
