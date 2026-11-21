import {t} from './i18n';
import './learningMath.css';
export type MathLesson={formula:string;example:string;meaning:string};
export function LearningMath({formula,example,meaning}:MathLesson){return <section className="learning-math" aria-label={t('Matematik')}><h3>{t('Matematik')}</h3><div className="math-formula" dir="ltr">{t(formula)}</div><h4>{t('Sayısal örnek')}</h4><div className="math-example" dir="ltr">{t(example)}</div><p>{t(meaning)}</p></section>}
export function architectureMath(name:string,branch:string):MathLesson{
 if(name.includes('Softmax'))return {formula:'pᵢ = exp(sᵢ − max(s)) / Σⱼ exp(sⱼ − max(s))\nΣᵢ pᵢ = 1',example:'s = [1, 2] → p ≈ [0.269, 0.731]',meaning:'Softmax skorları toplamı 1 olan ağırlıklara çevirir.'};
 if(name.includes('maskele'))return {formula:'S = QKᵀ / √dₖ\nSᵢⱼ = −∞  (j > i)\nA = softmax(S)',example:'[1, −∞, −∞] → [1, 0, 0]',meaning:'Gelecek tokenların ağırlığı sıfır olur; model yalnız mevcut ve önceki konumları kullanır.'};
 if(name.includes('AdaLN'))return {formula:'u = (x − μ) / √(σ² + ε)\nu′ = (1 + γ(c)) ⊙ u + β(c)',example:'u = [−1, 1], γ = [1, 1], β = [0.5, 0.5]\nu′ = [−1.5, 2.5]',meaning:'Koşul, normalize özelliklerin ölçeğini ve kaymasını belirler.'};
 if(branch==='norm')return {formula:'μ = (Σᵢ xᵢ) / D\nσ² = Σᵢ(xᵢ − μ)² / D\nyᵢ = γᵢ (xᵢ − μ) / √(σ² + ε) + βᵢ',example:'x = [2, 4], μ = 3, σ² = 1\nγ = 1, β = 0, ε ≈ 0 → y ≈ [−1, 1]',meaning:'Her tokenın özellikleri normalize edilir.'};
 if(branch==='attention')return {formula:'Q = XWq, K = XWk, V = XWv\nA = softmax(QKᵀ / √dₖ)\nY = AV',example:'A₁ = [0.25, 0.75], V = [2, 6]\nY₁ = 0.25 × 2 + 0.75 × 6 = 5',meaning:'Dikkat, değer vektörlerini benzerliğe göre ağırlıklı toplar.'};
 if(branch==='residual')return {formula:name.includes('Kapılı')?'y = x + α ⊙ F(x)':'y = x + F(x)',example:'x = [2, 3], F(x) = [0.5, −1]\nα = 1 → y = [2.5, 2]',meaning:'Artık bağlantı girdiyi korur ve yeni hesaplanan özellikleri ekler.'};
 if(branch==='projection')return {formula:'N = HW / P²\neᵢ = vec(patchᵢ)W + b',example:'H = W = 32, P = 8 → N = 16\n[1, 2] · [0.5, −0.25] + 0.1 = 0.1',meaning:'Yama düzleştirilir; doğrusal dönüşüm onu özellik vektörüne taşır.'};
 if(branch==='position')return {formula:'X = [xCLS; e₁; …; eN] + Epos',example:'e = [1, 2], Epos = [0.1, −0.2]\nx = [1.1, 1.8]',meaning:'Konum vektörü, aynı içeriğin farklı yerlerde ayırt edilmesini sağlar.'};
 if(branch==='network')return {formula:'F(x) = W₂ GELU(W₁x + b₁) + b₂\nGELU(z) = z Φ(z)',example:'z = 1 → Φ(1) ≈ 0.8413\nGELU(1) ≈ 0.8413',meaning:'Doğrusal katmanlar özellikleri karıştırır; GELU doğrusal olmayan bir dönüşüm ekler.'};
 if(branch==='scores')return {formula:'z = Wh + b\np = softmax(z)',example:'z = [0, 0, 0] → p = [1/3, 1/3, 1/3]',meaning:'Sabit örnek ağırlıkların skorları gerçek sınıf tahmini değildir.'};
 if(branch==='noise')return {formula:'zₜ = √ᾱₜ z₀ + √(1 − ᾱₜ) ε\nẑ₀ = (zₜ − √(1 − ᾱₜ) ε̂θ) / √ᾱₜ',example:'ᾱₜ = 0.64, z₀ = 1, ε = 0.5\nzₜ = 0.8 × 1 + 0.6 × 0.5 = 1.1',meaning:'Gürültü ekleme ve temiz latent tahmini gösterilir. Örnekleyici adımı ayrıca modele ve yönteme bağlıdır.'};
 if(branch==='codebook')return {formula:'zᵢ = E[kᵢ], E ∈ ℝ^(K×D)',example:'E[2] = [0.4, −0.2]\nkᵢ = 2 → zᵢ = [0.4, −0.2]',meaning:'Token kimliği, kod kitabındaki bir vektörü seçer.'};
 if(branch==='tokens')return {formula:'p(k₁, …, kN | c) = ∏ᵢ p(kᵢ | k₁, …, kᵢ₋₁, c)',example:'p(k₁ | c) = 0.5, p(k₂ | k₁,c) = 0.2\np(k₁,k₂ | c) = 0.1',meaning:'Her tokenın olasılığı, koşula ve önceki tokenlara bağlıdır.'};
 if(branch==='decode')return {formula:'H × W × C → 2H × 2W × C′\ny(i,j,o) = bₒ + Σᵤᵥ꜀ K(u,v,c,o) x(i+u,j+v,c)',example:'4 × 4 × C → 8 × 8 × C′\nΣ [1, 2, 3] ⊙ [0.2, 0.3, 0.5] = 2.3',meaning:'Çözünürlük artırılır; evrişim komşu özelliklerden yeni değerler hesaplar.'};
 if(branch==='patch')return {formula:'N = (H/P) × (W/P)\nH × W × C ↔ N × (P²C)',example:'32 × 32 × 3, P = 8\nN = 16, P²C = 192',meaning:'Yamalama ve yeniden şekillendirme, elemanların uzamsal sırasını korur.'};
 if(name==='Metin tokenları')return {formula:'c = [k₁, …, kM], eᵢ = Etext[kᵢ]',example:'k = [2, 5] → [Etext[2], Etext[5]]',meaning:'Tokenizer metni kimliklere ayırır; gömme tablosu her kimliği vektöre eşler.'};
 return {formula:'z = Encoder(x)\nx̂ = Decoder(z)',example:'x ∈ ℝ^(H×W×3) → z ∈ ℝ^(h×w×C)',meaning:'Sıkıştırma ve çözme, kullanılan encoder ve decoder mimarisine bağlıdır.'};
}
