# ⚙️ إعداد GitHub لرفع الصور

## الخطوة 1️⃣: إنشاء Repository للصور

1. اذهب إلى [GitHub](https://github.com)
2. اضغط **New Repository** أو **مستودع جديد**
3. Repository name: `fakhr-alban-images` (أو أي اسم)
4. اختار **Public** (عشان الصور تظهر في الموقع)
5. ✅ فعّل **Add a README file**
6. اضغط **Create repository**

---

## الخطوة 2️⃣: إنشاء Personal Access Token

### في GitHub:

1. اضغط على صورتك الشخصية (أعلى اليمين)
2. **Settings** → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. اضغط **Generate new token** → **Generate new token (classic)**
5. Note: `Fakhr Alban Menu - Image Upload`
6. Expiration: **No expiration** (لا تنتهي)
7. ✅ فعّل **Scopes** التالية:
   - `repo` (كل الصلاحيات تحته)
8. اضغط **Generate token**
9. **انسخ الـ Token** فوراً! (مش هيظهر تاني)

الـ Token هيكون زي كده:
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## الخطوة 3️⃣: إضافة البيانات لملف البيئة

في ملف `.env.local` أضف:

```env
# GitHub Configuration
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here
NEXT_PUBLIC_GITHUB_OWNER=your-username
NEXT_PUBLIC_GITHUB_REPO=fakhr-alban-images
NEXT_PUBLIC_GITHUB_BRANCH=main
```

**استبدل:**
- `ghp_your_token_here` → الـ Token اللي نسخته
- `your-username` → اسم المستخدم بتاعك على GitHub
- `fakhr-alban-images` → اسم الـ repo اللي عملته

**مثال:**
```env
NEXT_PUBLIC_GITHUB_TOKEN=ghp_4F3x2mP9L5nQwR7yT1vZ8kS6hC0aB2j
NEXT_PUBLIC_GITHUB_OWNER=ahmed123
NEXT_PUBLIC_GITHUB_REPO=fakhr-alban-images
NEXT_PUBLIC_GITHUB_BRANCH=main
```

---

## الخطوة 4️⃣: تثبيت المكتبة المطلوبة

في الـ Terminal:

```bash
npm install @octokit/rest
```

---

## الخطوة 5️⃣: إعادة تشغيل السيرفر

```bash
# أوقف السيرفر (Ctrl+C)
# ثم شغله من جديد
npm run dev
```

---

## ✅ جاهز!

الآن لما تدخل صفحة الأدمن وترفع صورة:
1. الصورة هتتضغط تلقائياً
2. هترفع على GitHub Repository
3. هتحصل على رابط مباشر للصورة
4. الرابط هيتحفظ في Firestore

---

## 🔍 كيف تشوف الصور المرفوعة؟

اذهب إلى:
```
https://github.com/your-username/fakhr-alban-images/tree/main/images
```

هتلاقي كل الصور هناك!

---

## 📝 ملاحظات مهمة

### الأمان
⚠️ **لا تشارك الـ Token مع أحد**  
⚠️ **لا ترفع ملف `.env.local` على GitHub**  
✅ الملف `.gitignore` بيمنع رفعه تلقائياً

### الحدود
GitHub Free Plan يسمح بـ:
- ✅ Unlimited public repositories
- ✅ Unlimited storage (معقول)
- ✅ Bandwidth limits تكفي أي موقع صغير

### روابط الصور
الصور بترفع على:
```
https://raw.githubusercontent.com/username/repo/main/images/filename.jpg
```

الروابط دي **ثابتة ومباشرة** وتشتغل من أي مكان!

---

## ❓ حل المشاكل

### "Failed to upload": 
- تأكد من الـ Token صحيح
- تأكد من اسم الـ repo صحيح
- تأكد من الـ repo **Public**

### "Rate limit exceeded":
- انتظر ساعة وحاول تاني
- GitHub عنده rate limits (5000 request/hour)

### الصور مش بتظهر:
- تأكد من الـ repository **Public**
- تأكد من رابط الصورة صحيح (يبدأ بـ raw.githubusercontent.com)

---

**جاهز! لو احتجت مساعدة، قولي! 😊**
