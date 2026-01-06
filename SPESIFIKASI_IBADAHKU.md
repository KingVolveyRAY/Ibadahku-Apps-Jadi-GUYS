# 📱 IbadahKu - Spesifikasi Aplikasi

## 🌟 Deskripsi
**IbadahKu** adalah aplikasi web Islami untuk membantu Muslim dalam menjalankan ibadah harian. Aplikasi ini menyediakan fitur jadwal shalat, tracker amal, tasbih digital, dan kalender Hijriah.

---

## 🛠️ Tech Stack

### Frontend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| React | 18.x | UI Framework |
| React Router | 6.x | Routing/Navigation |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP Client |
| Context API | - | State Management |

### Backend
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| FastAPI | 0.115.x | API Framework |
| Python | 3.11 | Runtime |
| Motor | 3.x | Async MongoDB Driver |
| Pydantic | 2.x | Data Validation |
| JWT (python-jose) | 3.x | Authentication |
| Bcrypt (passlib) | 4.x | Password Hashing |

### Database
| Teknologi | Fungsi |
|-----------|--------|
| MongoDB | NoSQL Database |

### Third-Party Services
| Service | Fungsi |
|---------|--------|
| Aladhan API | Jadwal Shalat & Kalender Hijriah |
| Brevo (Sendinblue) | Email Transaksional |
| OpenStreetMap Nominatim | Reverse Geocoding |

---

## 📂 Struktur Project

```
/app
├── backend/
│   ├── server.py          # Main API server (all endpoints)
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
│
└── frontend/
    ├── public/
    │   ├── index.html     # HTML template
    │   └── favicon.png    # App icon (IbadahKu logo)
    │
    └── src/
        ├── App.js         # Main app with routing
        ├── App.css        # Global styles
        │
        ├── context/       # React Context Providers
        │   ├── AuthContext.js      # Authentication state
        │   ├── ThemeContext.js     # Dark mode state
        │   ├── LocationContext.js  # Geolocation state
        │   └── index.js
        │
        ├── components/common/  # Reusable components
        │   ├── Header.js              # Navigation header
        │   ├── DarkModeToggle.js      # Dark mode button
        │   ├── PasswordInput.js       # Password field with toggle
        │   ├── ProtectedRoute.js      # Auth guard
        │   ├── LocationBanner.js      # Location status
        │   ├── LocationPermissionModal.js  # Location permission popup
        │   └── index.js
        │
        └── pages/         # Page components
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── ForgotPasswordPage.js
            ├── HomePage.js
            ├── PrayerPage.js
            ├── CalendarPage.js
            ├── TrackerPage.js
            ├── AddAmalPage.js
            ├── TasbihPage.js
            ├── ProfilePage.js
            └── index.js
```

---

## 🔐 Autentikasi

| Metode | Deskripsi |
|--------|-----------|
| JWT Token | Token berlaku 7 hari |
| Bcrypt | Password hashing |
| HTTPBearer | Token di header Authorization |

### Alur Autentikasi:
1. **Register** → User daftar dengan email, password, nama
2. **Login** → User login, dapat JWT token
3. **Protected Routes** → Token dikirim di header setiap request
4. **Forgot Password** → Kode 6 digit dikirim ke email via Brevo

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request reset password |
| POST | `/api/auth/reset-password` | Reset password dengan kode |

### User
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/user/me` | Get current user profile |
| PUT | `/api/user/me` | Update user profile |

### Prayer Times
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/prayer-times` | Get jadwal shalat hari ini |
| GET | `/api/prayer-times/monthly` | Get jadwal shalat bulanan |

**Query Parameters:**
- `latitude` (float) - Koordinat latitude
- `longitude` (float) - Koordinat longitude
- `method` (int) - Metode perhitungan (default: 20 = Kemenag RI)

### Prayer Tracking
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/prayer-track/{date}` | Get tracking shalat per tanggal |
| POST | `/api/prayer-track` | Update tracking shalat |
| GET | `/api/prayer-track/stats/weekly` | Statistik shalat mingguan |

### Amal (Good Deeds)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/amal` | Get semua amal (filter by date) |
| POST | `/api/amal` | Tambah amal baru |
| PUT | `/api/amal/{amal_id}` | Update amal |
| DELETE | `/api/amal/{amal_id}` | Hapus amal |

### Hijri Calendar
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/hijri/today` | Tanggal Hijriah hari ini |
| GET | `/api/hijri/convert` | Konversi Masehi ke Hijriah |
| GET | `/api/hijri/calendar` | Kalender Hijriah bulanan |

### Daily Notes
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/daily-notes/{date}` | Get catatan harian |
| POST | `/api/daily-notes` | Simpan catatan harian |

---

## 🗄️ Database Schema

### Collection: `users`
```javascript
{
  "id": "uuid",
  "email": "string (unique)",
  "hashed_password": "string",
  "full_name": "string",
  "phone": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "country": "string (default: Indonesia)",
  "created_at": "datetime"
}
```

### Collection: `prayer_tracks`
```javascript
{
  "id": "uuid",
  "user_id": "string",
  "date": "string (YYYY-MM-DD)",
  "subuh": "boolean",
  "dzuhur": "boolean",
  "ashar": "boolean",
  "maghrib": "boolean",
  "isya": "boolean"
}
```

### Collection: `amals`
```javascript
{
  "id": "uuid",
  "user_id": "string",
  "name": "string",
  "notes": "string (optional)",
  "scheduled_date": "string (YYYY-MM-DD)",
  "scheduled_time": "string (HH:MM, optional)",
  "repeat_daily": "boolean",
  "completed": "boolean",
  "created_at": "datetime"
}
```

### Collection: `daily_notes`
```javascript
{
  "id": "uuid",
  "user_id": "string",
  "date": "string (YYYY-MM-DD)",
  "notes": "string",
  "reflections": "string"
}
```

### Collection: `password_resets`
```javascript
{
  "email": "string",
  "code": "string (6 chars)",
  "created_at": "datetime",
  "expires_at": "datetime"
}
```

---

## ✨ Fitur Aplikasi

### 1. 🏠 Home Page
- Greeting dengan nama user
- Tanggal Hijriah & Masehi
- Waktu shalat sekarang
- Quick stats (shalat & amal)
- Daily reminders/amal

### 2. 🕌 Prayer Page (Jadwal Shalat)
- 5 waktu shalat (Subuh, Dzuhur, Ashar, Maghrib, Isya)
- **Geolocation** - waktu sesuai lokasi user
- Checkbox tracking (disabled jika belum waktunya)
- Waktu Terbit matahari

### 3. 📿 Tasbih Page
- Digital counter
- 6 pilihan dzikir:
  - Subhanallah (33x)
  - Alhamdulillah (33x)
  - Allahu Akbar (34x)
  - La ilaha illallah (100x)
  - Astaghfirullah (100x)
  - La hawla wa la quwwata illa billah (33x)
- Progress bar
- Reset & vibrate toggle
- Statistik harian

### 4. ✨ Tracker Page
- Prayer summary (5 shalat)
- Amal hari ini (add, check, delete)
- Catatan pribadi
- Weekly completion stats
- Refleksi/kata penyejuk (auto-generated quotes)

### 5. 📅 Calendar Page
- Kalender Masehi interaktif
- Konversi tanggal Hijriah
- Marker untuk hari dengan amal
- Detail amal per tanggal

### 6. 👤 Profile Page
- Info akun (nama, email, phone, address)
- Edit profile
- Logout

### 7. 🔐 Authentication
- Login
- Register
- Forgot Password (email verification via Brevo)
- Reset Password

### 8. 🌙 Dark Mode
- Toggle di header
- Persist ke localStorage

### 9. 📍 Geolocation
- Permission modal saat pertama kali
- Auto-detect lokasi untuk waktu shalat
- Fallback ke Jakarta jika ditolak
- Location indicator di header

---

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
CORS_ORIGINS=*
BREVO_API_KEY=xkeysib-xxx
BREVO_SENDER_EMAIL=noreply@ibadahku.site
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://ibadahku.site
```

---

## 🌐 URLs

| Environment | URL |
|-------------|-----|
| Production | https://ibadahku.site |
| Preview | (Emergent preview URL) |

---

## 📧 Email Configuration

| Setting | Value |
|---------|-------|
| Provider | Brevo (Sendinblue) |
| Sender | noreply@ibadahku.site |
| Quota | 300 emails/day (free) |

---

## 🎨 Design

- **Primary Color:** Green (#22c55e)
- **Font:** Inter (system fonts fallback)
- **Style:** Modern, clean, Islamic-themed
- **Responsive:** Mobile-first design
- **Dark Mode:** Full support

---

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Android Chrome)

---

## 🔒 Security Features

- Password hashing (bcrypt)
- JWT authentication
- HTTP-only considerations
- Input validation (Pydantic)
- CORS configuration
- Rate limiting (via infrastructure)

---

*Dokumentasi ini dibuat pada: 25 Desember 2025*
*Versi: 1.0.0*
