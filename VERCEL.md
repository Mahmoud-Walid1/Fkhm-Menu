# 🚀 نشر الموقع على Vercel

## الطريقة السريعة:

### 1. إنشاء حساب على Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بـ GitHub account

### 2. استيراد المشروع
1. اضغط **New Project**
2. اختر الريبو: `Mahmoud-Walid1/F5m`
3. اضغط **Import**

### 3. الإعدادات
- **Framework Preset**: Other (أو اتركه فاضي)
- **Root Directory**: `./`
- **Build Command**: اتركه فاضي
- **Output Directory**: `./`

### 4. Environment Variables (مهم!)
أضف Firebase config:
```
FIREBASE_API_KEY=your_key_here
FIREBASE_AUTH_DOMAIN=your_domain_here
...
```

> **ملاحظة**: لازم تعدل `js/firebase-config.js` يقرأ من environment variables

### 5. Deploy
اضغط **Deploy** وانتظر دقيقة! 🎉

---

## الرابط
بعد النشر هيظهرلك:
```
https://your-project.vercel.app
```

---

## التحديثات التلقائية
أي push على GitHub → Vercel ينشر تلقائياً! 🚀

---

## Custom Domain (اختياري)
في **Settings → Domains** ممكن تربط دومين خاص بيك.

---

**تم! الموقع شغال على الإنترنت** ✅
