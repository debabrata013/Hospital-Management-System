# 📋 Hostinger Upload Checklist

## 🎯 **EXACTLY What to Upload to `/public_html`**

Upload **ALL** these files and folders from your `out/` directory:

### 📁 **Folders to Upload:**
```
✅ _next/                    (Next.js assets - CRITICAL)
✅ 404/                      (Error page folder)
✅ admin/                    (Admin dashboard)
✅ doctor/                   (Doctor portal)
✅ forgot-password/          (Password reset)
✅ landingpage/              (Landing page)
✅ login/                    (Login page)
✅ pharmacy/                 (Pharmacy management)
✅ receptionist/             (Receptionist interface)
✅ reset-password/           (Password reset)
✅ signup/                   (Registration)
✅ staff/                    (Staff management)
✅ super-admin/              (Super admin panel)
```

### 📄 **Files to Upload:**
```
✅ index.html               (Homepage - 95KB)
✅ 404.html                 (Error page - 8KB)
✅ index.txt                (Text version)
✅ pic3.jpeg                (Hospital image - 48KB)
✅ placeholder-logo.png     (Logo image)
✅ placeholder-logo.svg     (Logo vector)
✅ placeholder-user.jpg     (User avatar)
✅ placeholder.jpg          (Placeholder image)
✅ placeholder.svg          (Placeholder vector)
```

## 🚀 **Step-by-Step Upload Process:**

### **Step 1: Access Hostinger File Manager**
1. Login to Hostinger Control Panel
2. Go to **Files** → **File Manager**
3. Navigate to **public_html** folder

### **Step 2: Clear public_html (Important!)**
```
❌ Delete any existing files in public_html
❌ Remove default index.html if present
❌ Clear the folder completely
```

### **Step 3: Upload Everything**
1. **Select ALL contents** from your `out/` folder
2. **Drag and drop** OR use **Upload** button
3. **Upload directly to public_html** (not in a subfolder!)

### **Step 4: Verify Structure**
After upload, your `public_html` should look like:
```
public_html/
├── _next/                  ← CRITICAL for functionality
├── admin/
├── doctor/
├── pharmacy/
├── receptionist/
├── staff/
├── super-admin/
├── login/
├── signup/
├── index.html             ← Your homepage
├── 404.html
├── pic3.jpeg
├── placeholder-logo.png
└── [all other files...]
```

## ⚠️ **CRITICAL POINTS:**

### **✅ DO:**
- Upload **ALL** files and folders
- Keep the **exact folder structure**
- Ensure `index.html` is in root of public_html
- Include the `_next/` folder (contains JavaScript/CSS)

### **❌ DON'T:**
- Don't create a subfolder in public_html
- Don't skip the `_next/` folder
- Don't rename any files
- Don't upload the `out/` folder itself

## 🔍 **Quick Verification:**

After upload, check:
1. **Homepage**: `https://yourdomain.com` should show your hospital homepage
2. **Admin**: `https://yourdomain.com/admin/` should work
3. **Login**: `https://yourdomain.com/login/` should work
4. **All sections** should be accessible

## 📊 **Upload Summary:**
- **Total Size**: 5.9MB
- **Total Files**: ~100+ files
- **Total Folders**: 13 folders
- **Main File**: index.html (95KB)

---

**🏥 Ready to make आरोग्य अस्पताल live on Hostinger!**
