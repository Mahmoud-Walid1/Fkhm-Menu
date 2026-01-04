# 🚀 رفع الموقع على GitHub

## الخطوات:

### 1. إنشاء Repository على GitHub

1. اذهب إلى [github.com](https://github.com)
2. اضغط **New repository** (الزر الأخضر)
3. املأ التفاصيل:
   - **Repository name**: `fakhr-alban-menu` (أو أي اسم تحبه)
   - **Description**: موقع منيو فخم البن
   - **Public** ✅ (عشان GitHub Pages يشتغل مجاناً)
   - **لا تختار** "Initialize with README" (عندنا ملفات جاهزة)
4. اضغط **Create repository**

### 2. رفع الملفات من الكمبيوتر

افتح Terminal/CMD في مجلد المشروع وشغّل:

```bash
# ربط GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/fakhr-alban-menu.git

# رفع الملفات
git push -u origin main
```

> **ملاحظة:** استبدل `YOUR_USERNAME` باسم المستخدم بتاعك على GitHub

### 3. تفعيل GitHub Pages

1. في الـ repo على GitHub، اذهب إلى **Settings**
2. من القائمة الجانبية، اختر **Pages**
3. في **Source**، اختر:
   - Branch: `main`
   - Folder: `/ (root)`
4. اضغط **Save**
5. انتظر دقيقة، هيظهرلك الرابط:
   ```
   https://YOUR_USERNAME.github.io/fakhr-alban-menu/
   ```

### 4. إعداد Firebase للموقع المنشور

لما الموقع ينشر، لازم تعدل إعدادات Firebase:

1. افتح [Firebase Console](https://console.firebase.google.com/)
2. اختر المشروع بتاعك
3. **Project Settings** → **Authorized domains**
4. أضف الدومين:
   ```
   YOUR_USERNAME.github.io
   ```

---

## ✅ تمام!

الموقع دلوقتي شغال على الإنترنت! 🎉

شارك الرابط مع العملاء واستمتع! ☕

---

## 🔒 أمان Firebase Config

**مهم جداً:**
- ملف `js/firebase-config.js` فيه بيانات Firebase
- الملف أصلاً في `.gitignore` عشان ما يترفعش
- لو عايز تنشر الموقع، حط Firebase config في **Environment Variables** على GitHub
- أو استخدم Firebase Hosting بدل GitHub Pages (أأمن)

---

## 🆘 مشاكل شائعة

**المشكلة:** `git` مش موجود  
**الحل:** حمّل [Git](https://git-scm.com/downloads)

**المشكلة:** صفحة بيضاء بعد النشر  
**الحل:** تأكد إن Firebase config صح والـ domain مضاف في Authorized domains

**المشكلة:** الموقع لا يعرض البيانات  
**الحل:** راجع Firebase Rules (لازم تسمح بـ read للجميع)

---

**تم إنشاء الـ Git Repository محلياً! ✅**
