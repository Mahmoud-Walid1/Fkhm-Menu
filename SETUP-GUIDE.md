# 🚀 دليل التشغيل الكامل - موقع فخم البن

## المتطلبات الأساسية

قبل ما نبدأ، تأكد إنك عندك:
- ✅ حساب [Firebase](https://firebase.google.com) (مجاني)
- ✅ حساب [GitHub](https://github.com) (مجاني)
- ✅ Node.js مثبت على جهازك

---

## القسم الأول: إعداد Firebase

### الخطوة 1: إنشاء مشروع Firebase

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اضغط **Create a project**
3. اسم المشروع: `fakhr-alban`
4. **لا تفعّل** Google Analytics
5. **Create project**

### الخطوة 2: تفعيل Firestore Database

1. **Build** → **Firestore Database** → **Create database**
2. **Start in test mode**
3. Location: اختار الأقرب ليك
4. **Enable**

### الخطوة 3: تفعيل Authentication

1. **Build** → **Authentication** → **Get started**
2. **Email/Password** → فعّلها
3. **Save**

### الخطوة 4: نسخ بيانات Firebase

1. الترس ⚙️ → **Project settings**
2. **Your apps** → اضغط **Web** `</>`
3. App nickname: `Fakhr Alban`
4. **Register app**
5. **انسخ** `firebaseConfig`

---

## القسم الثاني: إعداد GitHub للصور

### الخطوة 1: إنشاء Repository

1. [GitHub](https://github.com) → **New repository**
2. Name: `fakhr-alban-images`
3. **Public** ✅
4. **Add README** ✅
5. **Create**

### الخطوة 2: إنشاء Personal Access Token

1. صورتك الشخصية → **Settings**
2. **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. **Generate new token (classic)**
4. Note: `Fakhr Alban Images`
5. Expiration: **No expiration**
6. ✅ فعّل: **repo** (كل الصلاحيات تحته)
7. **Generate token**
8. **انسخ الـ Token فوراً!** (مش هيظهر تاني)

---

## القسم الثالث: إعداد المشروع

### الخطوة 1: ملف البيئة

في مجلد المشروع، **أنشئ ملف** `.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fakhr-alban.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fakhr-alban
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=fakhr-alban.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123...
NEXT_PUBLIC_FIREBASE_APP_ID=1:123...

# GitHub (للصور)
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxx...
NEXT_PUBLIC_GITHUB_OWNER=username
NEXT_PUBLIC_GITHUB_REPO=fakhr-alban-images
NEXT_PUBLIC_GITHUB_BRANCH=main
```

**استبدل:**
- قيم Firebase من الخطوة 4 (القسم الأول)
- `ghp_xxx` بالـ Token من GitHub
- `username` باسمك على GitHub

### الخطوة 2: تشغيل المشروع

```bash
npm run dev
```

انتظر حتى ترى:
```
✓ Ready in 2.6s
Local: http://localhost:3000
```

---

## القسم الرابع: إنشاء أول Admin

### في Firebase Console:

#### أ) إضافة مستخدم

1. **Authentication** → **Add user**
2. Email: `admin@fakhralban.sa`
3. Password: (اختار كلمة سر قوية)
4. **Add user**
5. **انسخ الـ UID** (العمود الأول)

#### ب) إضافة صلاحيات

1. **Firestore Database** → **Start collection**
2. Collection ID: `admins`
3. **Next**
4. Document ID: **الصق الـ UID**
5. أضف الحقول:

```
email: admin@fakhralban.sa
displayName: المدير الأول
role: super_admin
isActive: true
createdAt: (اضغط timestamp - now)
createdBy: system
```

6. **Save**

---

## القسم الخامس: رفع Security Rules

### Firestore Rules

1. **Firestore** → **Rules**
2. امسح الكود القديم والصق:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isActive == true;
    }
    
    match /{collection}/{document} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

3. **Publish**

---

## القسم السادس: إضافة بيانات تجريبية

### إضافة قسم

**Firestore** → Collection `categories` → **Add document**:

```
Document ID: drinks
---
nameAr: المشروبات
icon: ☕
order: 1
isActive: true
theme: {
  primaryColor: #7E60A8,
  secondaryColor: #9B7EBD,
  backgroundColor: #FAF6F1,
  patternStyle: default
}
isSeasonal: false
createdAt: (timestamp)
updatedAt: (timestamp)
```

### إضافة منتج

Collection `products` → **Add document**:

```
Document ID: cappuccino
---
nameAr: كابتشينو
descriptionAr: قهوة إيطالية كلاسيكية
categoryId: drinks
image: (اتركه فاضي - هنضيف الصورة من الأدمن)
order: 1
isActive: true
options: {
  sizes: [
    {name: صغير, price: 15, isAvailable: true},
    {name: وسط, price: 18, isAvailable: true},
    {name: كبير, price: 21, isAvailable: true}
  ],
  temperature: {
    hot: {available: true},
    cold: {available: true}
  }
}
createdAt: (timestamp)
updatedAt: (timestamp)
```

---

## القسم السابع: تجربة الموقع

### 1. الصفحة الرئيسية

افتح: `http://localhost:3000`

يجب أن ترى:
- ✅ قسم "المشروبات" يظهر
- ✅ تصميم بنفسجي فخم
- ✅ لما تضغط على القسم، تظهر المنتجات

### 2. صفحة الأدمن

افتح: `http://localhost:3000/admin/login`

سجل دخول بـ:
- Email: `admin@fakhralban.sa`
- Password: (اللي اخترته)

يجب أن ترى:
- ✅ Dashboard مع إحصائيات
- ✅ Sidebar مع كل الأقسام

### 3. رفع صورة (اختبار)

في لوحة التحكم (قريباً هنضيف واجهة كاملة):
- الصور هترفع على GitHub
- هتحصل على رابط مباشر
- هتظهر في الموقع فوراً

---

## القسم الثامن: النشر على الإنترنت

### طريقة 1: Vercel (الأسهل)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel
```

أو من [vercel.com](https://vercel.com):
1. **New Project**
2. Import المجلد
3. **Environment Variables**: انسخ من `.env.local`
4. **Deploy**

### طريقة 2: Netlify

1. [netlify.com](https://netlify.com)
2. Drag & Drop المجلد
3. أضف Environment Variables
4. Deploy

---

## ✅ تم! الموقع شغال

الآن عندك:
- 🎨 موقع فخم بتصميم احترافي
- 🔥 Firebase للبيانات والمصادقة
- 📸 GitHub لتخزين الصور (مجاني)
- 🔐 لوحة تحكم كاملة
- 🌐 جاهز للنشر

---

## ❓ حل المشاكل

### "Internal Server Error"
✅ تأكد من `.env.local` موجود وصحيح

### "لا توجد أقسام"
✅ أضف بيانات تجريبية (القسم السادس)

### "فشل رفع الصورة"
✅ تأكد من GitHub Token صحيح وعنده صلاحية `repo`

### الموقع بطيء
✅ عادي في وضع التطوير (`npm run dev`)
✅ بعد `npm run build` هيكون سريع جداً

---

## 📞 تحتاج مساعدة؟

لو واجهت أي مشكلة، قولي! 😊

**ملفات مهمة:**
- [README.md](file:///d:/downloads/شغل%20كافيه/موقع%20المنيو/README.md) - معلومات عن المشروع
- [GITHUB-SETUP.md](file:///d:/downloads/شغل%20كافيه/موقع%20المنيو/GITHUB-SETUP.md) - تفاصيل أكثر عن GitHub
- [Walkthrough](file:///C:/Users/Mahmoud/.gemini/antigravity/brain/dc406312-d3ab-4f47-a737-881d48d3a749/walkthrough.md) - شرح المشروع بالكامل
