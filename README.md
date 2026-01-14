# ecocampus-fullstack
YMH3007 Final Projesi - EcoCampus Sürdürülebilir Kampüs Pazaryeri
# 🌿 EcoCampus - Sürdürülebilir Kampüs Pazaryeri

**YMH3007 Fullstack Web ve Mobil Uygulama Geliştirme - Final Projesi**

Öğrenci: Onur Çapan  
Öğrenci No: 232010080014  
Ders Hocası: Dr. Öğr. Üyesi Muhammed Ali KOŞAN

---

## 📋 Proje Hakkında

EcoCampus, üniversite öğrencilerinin kullanmadıkları ders materyallerini, kitaplarını veya eşyalarını satabilecekleri ya da ihtiyaç sahiplerine ücretsiz bağışlayabilecekleri bir platformdur.

### 🎯 Kullanılan Teknolojiler

**Backend:**
- Node.js & Express.js
- PostgreSQL (Veritabanı)
- JWT (Kimlik Doğrulama)
- Bcrypt (Şifre Hashleme)

**Web (React):**
- React (Vite)
- React Router
- Axios
- React Toastify

**Mobile (React Native):**
- React Native
- Expo
- React Navigation
- AsyncStorage

---

## 📁 Proje Yapısı

```
ecocampus-fullstack/
├── backend/          # Node.js API Sunucusu
├── web/              # React Web Dashboard
├── mobile/           # React Native Mobil Uygulama
└── README.md         # Bu dosya
```

---

## 🚀 Kurulum ve Çalıştırma

### 1️⃣ Gereksinimler

Sisteminizde şunların yüklü olması gerekir:
- Node.js (v18 veya üzeri)
- PostgreSQL (v14 veya üzeri)
- npm veya yarn
- Expo CLI (Mobil için)

### 2️⃣ Veritabanı Kurulumu

```sql
-- PostgreSQL'de yeni bir veritabanı oluşturun:
CREATE DATABASE ecocampus;

```

### 3️⃣ Backend Kurulumu

```bash
cd backend
npm install

# .env dosyasını oluşturun ve düzenleyin:
cp .env.example .env

# Sunucuyu başlatın:
npm start
```

**Backend .env örneği:**
```env
PORT=3333
DB_USER=postgres
DB_PASSWORD=1686
DB_HOST=localhost
DB_NAME=ecocampus_db
DB_PORT=5432
JWT_SECRET=ecocampus_secret
```

### 4️⃣ Web Dashboard Kurulumu

```bash
cd web
npm install

# config.js dosyasında API URL'ini kontrol edin
# Geliştirme sunucusunu başlatın:
npm run dev
```

### 5️⃣ Mobil Uygulama Kurulumu

```bash
cd mobile
npm install

# config.js dosyasında API URL'ini kendi IP adresinizle güncelleyin
# Expo sunucusunu başlatın:
npx expo start
```

**Mobil için önemli not:** `mobile/config.js` dosyasında API_URL'i kendi bilgisayarınızın IP adresiyle değiştirin:
```javascript
const API_URL = "http://192.168.1.XXX:3333/api";
```

---

## 🔐 API Endpoints

### Kimlik Doğrulama
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi (Token döner)

### Ürünler (Products)
- `GET /api/products` - Tüm ürünleri listele (Açık)
- `GET /api/products/:id` - Ürün detayı (Açık)
- `POST /api/products` - Yeni ürün ekle (🔒 Token gerekli)
- `PUT /api/products/:id` - Ürün güncelle (🔒 Token + Sahiplik gerekli)
- `DELETE /api/products/:id` - Ürün sil (🔒 Token + Sahiplik gerekli)

### Kategoriler
- `GET /api/categories` - Tüm kategorileri listele

---

## 📱 Özellikler

✅ Kullanıcı kayıt ve giriş sistemi  
✅ JWT tabanlı kimlik doğrulama  
✅ Ürün ekleme, düzenleme ve silme  
✅ Kategorilere göre ürün filtreleme  
✅ Bağış sistemi (Fiyat 0 TL ise "BAĞIŞ" etiketi)  
✅ Yetkilendirme (Sadece kendi ilanını düzenleyebilme)  
✅ Web ve Mobil senkronizasyonu (Aynı veritabanı)  
✅ Misafir modu (Giriş yapmadan ürünleri görüntüleme)

---

## 🎨 Ekran Görüntüleri

*(![Uploading Ekran Resmi 2026-01-14 22.12.26.png…]()
)*

---

## 🔒 Güvenlik

- Şifreler Bcrypt ile hashlenmiş olarak saklanır
- JWT ile korumalı rotalar (Token olmadan işlem yapılamaz)
- Sadece ilan sahibi kendi ilanını düzenleyebilir/silebilir
- SQL Injection koruması (Parameterized queries)
- Environment variables (.env) ile hassas bilgilerin korunması

---

## 📝 Veritabanı Şeması

### Users (Kullanıcılar)
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| username | VARCHAR(50) | Kullanıcı adı (Unique) |
| email | VARCHAR(100) | Email (Unique) |
| password | VARCHAR(255) | Hashlenmiş şifre |
| created_at | TIMESTAMP | Kayıt tarihi |

### Categories (Kategoriler)
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(50) | Kategori adı |
| icon | VARCHAR(10) | Emoji ikonu |

### Products (Ürünler)
| Alan | Tip | Açıklama |
|------|-----|----------|
| id | SERIAL | Primary Key |
| title | VARCHAR(100) | Ürün başlığı |
| price | DECIMAL(10,2) | Fiyat (0 = Bağış) |
| description | TEXT | Açıklama |
| image_url | TEXT | Resim URL'i |
| user_id | INTEGER | Foreign Key → Users |
| category_id | INTEGER | Foreign Key → Categories |
| created_at | TIMESTAMP | Oluşturulma tarihi |

---

## 🐛 Bilinen Sorunlar ve Çözümler

**Sorun:** Mobil uygulamada "Network request failed" hatası  
**Çözüm:** `mobile/config.js` dosyasında API_URL'i bilgisayarınızın IP adresiyle güncelleyin

**Sorun:** Backend başlamıyor  
**Çözüm:** PostgreSQL servisinin çalıştığından ve .env dosyasındaki bilgilerin doğru olduğundan emin olun

---

## 👨‍💻 Geliştirici Notları

Bu proje YMH3007 Fullstack Web ve Mobil Uygulama Geliştirme dersi kapsamında Final projesi olarak geliştirilmiştir.

**Geliştirme Süreci:**
- Backend API MVC mimarisine uygun olarak geliştirildi
- Web ve Mobil arayüzler aynı backend'i kullanarak senkronize çalışıyor
- Kullanıcı deneyimi odaklı tasarım yapıldı
- Güvenlik en önemli öncelik olarak ele alındı

---

## 📧 İletişim

Sorularınız için: onurcapn10@gmail.com

---

## 📄 Lisans

Bu proje eğitim amaçlı geliştirilmiştir.
