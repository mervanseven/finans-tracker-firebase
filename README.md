#  Kişisel Finans Yönetim Platformu

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-blue?logo=react" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/Tailwind-CSS%203.x-38B2AC?logo=tailwind-css" />
</p>

---

## 📌 Proje Vizyonu
Karmaşık finansal verileri sade, anlaşılır ve görsel olarak tatmin edici bir deneyime dönüştürmek amacıyla geliştirilmiştir. Kullanıcının harcama alışkanlıklarını fark etmesini sağlayarak finansal özgürlüğüne giden yolda bir rehber olmayı hedefler. Modern "Dark Mode" estetiği ve yüksek kontrastlı Turkuaz teması ile profesyonel bir finans terminali hissi sunar.

---

## 🚀 Temel Özellikler

### 🔐 Gelişmiş Kimlik Doğrulama
* **Güvenli Kayıt/Giriş:** Firebase Auth altyapısı ile şifrelenmiş kullanıcı oturumları.
* **Profil Özelleştirme:** Kullanıcı adıyla kişiselleştirilmiş karşılama ve yönetim paneli.
* **Oturum Yönetimi:** Tarayıcı bazlı güvenli oturum takibi.

### 📊 Dinamik Dashboard (Yönetim Paneli)
* **Gerçek Zamanlı Özet:** Toplam gelir, toplam gider ve o anki net bakiyenin (Bakiye) anlık hesaplanması.
* **Akıllı Form Yapısı:** * Gelir veya Gider türüne göre dinamik olarak değişen kategori listesi.
    * Hızlı tarih seçimi ve not ekleme alanı.
* **Aylık Odaklanma:** Takvim entegrasyonu ile sadece ilgili aya ait verilerin otomatik süzülmesi.

### 📈 Veri Görselleştirme & Analiz
* **Trend Çizelgesi:** `Recharts` kütüphanesi kullanılarak hazırlanan, aylık nakit akışını (gelir vs gider) gösteren interaktif LineChart.
* **Dağılım Grafikleri:** * Giderlerin kategorik ağırlığını gösteren Donut PieChart.
    * Gelir kaynaklarının yüzdesel dağılımı.
* **Görsel Geri Bildirim:** Bakiye durumuna göre (artı/eksi) dinamik renk değişimleri.

### 📑 İşlem Yönetimi & Arşiv
* **Gelişmiş Tablo:** Tüm geçmiş işlemlerin kronolojik sıralaması.
* **Canlı Filtreleme:** Kayıtlar arasında kategoriye veya özel notlara göre anlık arama.
* **Veri Silme:** Hatalı girilen kayıtların tek tuşla Firestore üzerinden kalıcı olarak kaldırılması.

---

## 🛠️ Teknik Mimari

### Frontend
- **Framework:** React.js (Hooks, Functional Components)
- **Styling:** Tailwind CSS (Custom Dark Theme, Glassmorphism UI)
- **Charts:** Recharts (SVG tabanlı duyarlı grafikler)
- **Icons:** HeroIcons / Lucide React

### Backend & Altyapı
- **Database:** Google Firebase Firestore (Real-time NoSQL)
- **Authentication:** Firebase Auth
- **Hosting:** Firebase Hosting / Vercel (Önerilen)
- **State Management:** React Context / useState & useMemo optimization

---

## 🎨 Tasarım Standartları
Proje, kullanıcıyı yormayan ve veriye odaklanmayı sağlayan belirli tasarım prensipleri üzerine inşa edilmiştir:
* **Arka Plan:** `#0f172a` (Deep Slate) – Modern ve derinlik hissi veren ana zemin.
* **Vurgu Rengi:** `Cyan-400` – Dinamizmi ve finansal berraklığı temsil eden turkuaz tonları.
* **Kontrast:** Saf beyaz (`#ffffff`) form elemanları ile karanlık modda maksimum okunabilirlik.
* **Köşeler:** `rounded-[2rem]` – Yumuşak ve modern bir "SaaS" uygulama görünümü.

---

## 📦 Kurulum ve Yapılandırma

### 1. Gereksinimler
- Node.js (v16 veya üzeri)
- NPM veya Yarn
- Firebase Hesabı

### 2. Adımlar
```bash
# Projeyi klonlayın

git clone

=======
git clone 

# Klasöre girin
cd finance-tracker

# Bağımlılıkları yükleyin
npm install

# Uygulamayı başlatın
npm start
