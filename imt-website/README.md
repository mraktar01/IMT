# 🏛️ Institute of Modern Technology — Website

## Complete Setup Guide for Beginners

This guide walks you through everything — from setting up Firebase and Cloudinary,
to testing on your computer, to deploying live on Vercel. Follow every step in order.

---

## 📋 Table of Contents

1. [What You Need Before Starting](#1-what-you-need-before-starting)
2. [Project File Structure](#2-project-file-structure)
3. [Step 1 — Firebase Setup](#3-step-1--firebase-setup)
4. [Step 2 — Cloudinary Setup](#4-step-2--cloudinary-setup)
5. [Step 3 — Add Your Keys to the Website Files](#5-step-3--add-your-keys-to-the-website-files)
6. [Step 4 — Test on Your Computer (Local)](#6-step-4--test-on-your-computer-local)
7. [Step 5 — Deploy to Vercel (Go Live)](#7-step-5--deploy-to-vercel-go-live)
8. [How to Use the Admin Panel](#8-how-to-use-the-admin-panel)
9. [Mobile Navigation Behaviour](#9-mobile-navigation-behaviour)
10. [Firestore Security Rules](#10-firestore-security-rules)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What You Need Before Starting

You need these **free accounts** — create them if you haven't already:

| Service | Link | What It Does |
|---------|------|-------------|
| Firebase | https://firebase.google.com | Database for posts, gallery, contacts |
| Cloudinary | https://cloudinary.com | Image hosting for gallery & post images |
| GitHub | https://github.com | Store your code (needed for Vercel) |
| Vercel | https://vercel.com | Host the website for free |

You also need **VS Code** (free code editor):
→ Download at https://code.visualstudio.com

---

## 2. Project File Structure

```
imt-website/
├── index.html              ← Public website (one page)
├── admin.html              ← Admin dashboard (password protected)
├── vercel.json             ← Vercel deployment settings
├── .env.local              ← Your secret keys (NEVER share this file)
├── README.md               ← This guide
└── assets/
    ├── css/
    │   ├── style.css       ← Public website styles
    │   └── admin.css       ← Admin panel styles
    └── js/
        ├── main.js         ← Public website JavaScript
        ├── admin.js        ← Admin panel JavaScript
        └── config.js       ← Key reference (template only)
```

---

## 3. Step 1 — Firebase Setup

### 3a. Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click the big **"Add project"** button
3. Enter a project name, e.g. `imt-website`
4. **Disable** Google Analytics (you don't need it) → Click **Create project**
5. Wait for it to finish, then click **Continue**

### 3b. Create a Firestore Database

1. In the left sidebar, click **Build** → **Firestore Database**
2. Click the blue **"Create database"** button
3. Choose **"Start in test mode"** (we'll secure it later) → Click **Next**
4. Choose any location near you (e.g. `asia-south1` for India) → Click **Done**
5. Wait for the database to be created

### 3c. Get Your Firebase Config Keys

1. Click the **gear icon ⚙️** near "Project Overview" (top left) → **Project settings**
2. Scroll down to **"Your apps"** section
3. Click the **`</>`** (Web) icon to add a web app
4. Enter any nickname, e.g. `imt-web` → Click **Register app**
5. You will see a block of code like this — **copy everything inside the `{}`**:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyABC123...",
  authDomain: "imt-website-abc.firebaseapp.com",
  projectId: "imt-website-abc",
  storageBucket: "imt-website-abc.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

6. Click **Continue to console** — you're done with this step.

> ⚠️ **Keep these keys safe.** Do not post them publicly or commit them to a public GitHub repo.

---

## 4. Step 2 — Cloudinary Setup

Cloudinary hosts your images (gallery photos and post thumbnails).

### 4a. Get Your Cloud Name

1. Log in to https://cloudinary.com
2. You land on the **Dashboard**
3. Look for **"Cloud Name"** — it's right at the top (e.g. `dxyz12abc`)
4. Copy it — you'll need it in Step 3

### 4b. Create an Upload Preset

An upload preset lets the website upload images without needing a secret API key in the browser.

1. Click your **account name** (top right) → **Settings**
2. Click the **"Upload"** tab
3. Scroll down to **"Upload presets"**
4. Click **"Add upload preset"**
5. Fill in:
   - **Preset name:** `imt_upload` (you can choose any name)
   - **Signing Mode:** change to **"Unsigned"** ← very important!
   - **Folder:** type `imt-website` (optional but keeps things organised)
6. Click **Save** at the top right

> ✅ You now have:
> - Cloud Name (e.g. `dxyz12abc`)
> - Upload Preset (e.g. `imt_upload`)

---

## 5. Step 3 — Add Your Keys to the Website Files

Now you'll paste your Firebase and Cloudinary details into the code. You need to edit **3 places**.

### 5a. Open the project in VS Code

1. Open VS Code
2. Click **File** → **Open Folder** → select your `imt-website` folder
3. You'll see all the files in the left sidebar

### 5b. Edit `index.html` — Add Firebase keys

1. Open `index.html`
2. Press `Ctrl+F` (Windows) or `Cmd+F` (Mac) to search
3. Search for: `REPLACE_WITH_YOUR_API_KEY`
4. You'll find this block near the bottom of the file (inside a `<script type="module">` tag):

```javascript
const firebaseConfig = {
  apiKey:            "REPLACE_WITH_YOUR_API_KEY",
  authDomain:        "REPLACE_WITH_YOUR_AUTH_DOMAIN",
  projectId:         "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket:     "REPLACE_WITH_YOUR_STORAGE_BUCKET",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId:             "REPLACE_WITH_YOUR_APP_ID"
};
```

5. Replace each `"REPLACE_WITH_..."` value with your actual Firebase values from Step 3c.

**Example of what it should look like after:**
```javascript
const firebaseConfig = {
  apiKey:            "AIzaSyABC123xyz",
  authDomain:        "imt-website-abc.firebaseapp.com",
  projectId:         "imt-website-abc",
  storageBucket:     "imt-website-abc.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abcdef"
};
```

### 5c. Edit `admin.html` — Add Firebase keys

1. Open `admin.html`
2. Do the **exact same thing** — find and replace the same 6 Firebase values
   (admin.html has its own copy of the firebaseConfig)

### 5d. Edit `assets/js/admin.js` — Add credentials + Cloudinary

1. Open `assets/js/admin.js`
2. Search for `ADMIN_CONFIG`
3. Find this block near the top:

```javascript
const ADMIN_CONFIG = {
  username:     window.__IMT_ADMIN_USERNAME__          || "admin",
  password:     window.__IMT_ADMIN_PASSWORD__          || "imt@admin2024",
  cloudName:    window.__IMT_CLOUDINARY_CLOUD_NAME__   || "REPLACE_YOUR_CLOUD_NAME",
  uploadPreset: window.__IMT_CLOUDINARY_UPLOAD_PRESET__|| "REPLACE_YOUR_UPLOAD_PRESET"
};
```

4. Replace the fallback values:

```javascript
const ADMIN_CONFIG = {
  username:     window.__IMT_ADMIN_USERNAME__          || "your_chosen_username",
  password:     window.__IMT_ADMIN_PASSWORD__          || "your_strong_password",
  cloudName:    window.__IMT_CLOUDINARY_CLOUD_NAME__   || "dxyz12abc",
  uploadPreset: window.__IMT_CLOUDINARY_UPLOAD_PRESET__|| "imt_upload"
};
```

> ⚠️ **Change the username and password!** Don't leave them as `admin` / `imt@admin2024` on a live site.

---

## 6. Step 4 — Test on Your Computer (Local)

You can't just open `index.html` by double-clicking it — browsers block Firebase connections from local files. You need a **local web server**.

### Option A: Using VS Code Live Server (Easiest)

1. In VS Code, go to **Extensions** (left sidebar, the puzzle piece icon)
2. Search for **"Live Server"** by Ritwick Dey → Click **Install**
3. Once installed, right-click `index.html` in the file explorer
4. Click **"Open with Live Server"**
5. Your browser will open at `http://127.0.0.1:5500/index.html`

### Option B: Using Python (if you have Python installed)

1. Open Terminal / Command Prompt
2. Navigate to your project folder:
   ```
   cd path/to/imt-website
   ```
3. Run:
   ```
   python -m http.server 5500
   ```
4. Open your browser at `http://localhost:5500`

### What to Test Locally

| Test | What to check |
|------|--------------|
| `http://localhost:5500/` | Public website loads with all sections |
| `http://localhost:5500/admin.html` | Admin login page appears |
| Login with your credentials | Dashboard opens with all panels |
| Announcement bar | Save settings → reload public site |
| Gallery | Upload a test image → check it appears on public site |
| Posts | Create a test blog post → check it appears on public site |
| Section toggles | Turn off gallery → reload public site → gallery gone |
| Mobile | Open browser dev tools → toggle mobile view → test bottom nav |

### Testing Firebase Connection

After loading the site, open **browser dev tools** (press F12) and look at the Console tab:
- ✅ If Firebase is connected: no red errors
- ❌ If you see `Firebase: Error` — double-check your firebaseConfig values in `index.html`

---

## 7. Step 5 — Deploy to Vercel (Go Live)

### 7a. Push to GitHub

1. Go to https://github.com → Sign in → Click **"New repository"**
2. Name it `imt-website` → Keep it **Private** → Click **Create repository**
3. In VS Code, open the Terminal (`Ctrl+` `` ` ``)
4. Run these commands one by one:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/imt-website.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your actual GitHub username.

> ⚠️ **Do NOT commit `.env.local`** — it's just a reference file, your real keys are already inside the HTML/JS files.

### 7b. Deploy on Vercel

1. Go to https://vercel.com → Sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Find your `imt-website` repository → Click **"Import"**
4. On the Configure Project screen:
   - **Framework Preset:** leave as **Other**
   - **Root Directory:** leave empty (`.`)
   - **Build Command:** leave empty
   - **Output Directory:** leave empty
5. Click **"Deploy"**
6. Wait ~30 seconds → Your site is live! 🎉

Vercel gives you a URL like: `https://imt-website-abc.vercel.app`

### 7c. Set a Custom Domain (Optional)

1. In your Vercel project, go to **Settings** → **Domains**
2. Add your domain (e.g. `imtinstitute.org`)
3. Follow Vercel's instructions to update your domain's DNS settings

### 7d. After Deploying — Test Everything Live

- Public site: `https://your-vercel-url.vercel.app`
- Admin panel: `https://your-vercel-url.vercel.app/admin`

Run through the same tests from Step 4 — everything should work the same.

### 7e. Making Updates Later

Whenever you change a file:
```bash
git add .
git commit -m "describe what you changed"
git push
```

Vercel automatically detects the push and redeploys in ~30 seconds. Zero downtime.

---

## 8. How to Use the Admin Panel

Go to `your-site.com/admin` and log in.

### Dashboard Overview
Shows live stats: how many gallery images, posts, and contact messages you have.

### 📢 Announcement Bar
- **Enable toggle:** turns the bar on/off globally
- **Text field:** what the bar says (e.g. "Scholarship applications open!")
- **CTA Button Text + URL:** adds a clickable button (e.g. "Apply Now" → your form link)
- **Color swatches:** pick the bar background colour
- After saving → **refresh the public site** to see the change

### 🖼️ Gallery / Moments
- Fill in the **Title** and **Date**, then click the upload zone to pick an image
- Click **"Add to Gallery"** — it uploads to Cloudinary and saves the URL in Firebase
- The gallery on the public site updates automatically
- **Quick-toggle button** (top right of panel): instantly shows/hides the entire Gallery section

### 📝 Posts & Blogs
- Choose **type:** Blog, Event, or Announcement
- **Preview text** = the short teaser shown on the card
- **Full Content** = the full article that opens in the popup when users click "Read More"
- Thumbnail images are optional (blogs typically don't have them)
- **Quick-toggle button** (top right): instantly shows/hides the entire Posts section

### ⚙️ Section Visibility
Control which sections appear on the public site:
- **Announcement Bar** — the top coloured strip
- **Gallery / Moments** — the photo grid section
- **Recent Posts** — the blog/event cards section

Each toggle shows a live label: **🟢 Visible on site** or **🔴 Hidden from site**

Hit **"Save All Settings"** → changes go live after visitors refresh their page.

### ✉️ Contact Submissions
See all messages sent through the contact form. Click the email address to reply directly. Delete messages you've handled.

---

## 9. Mobile Navigation Behaviour

On mobile phones (screen width ≤ 768px), the navigation works differently:

### Normal behaviour (Home view)
- Full page is shown with all sections
- Bottom navigation bar is visible
- "Home" tab is active (highlighted)

### Section Focus Mode
When you tap any tab other than Home:
- **Only that section** appears (plus the Quotes bar at the bottom)
- All other sections are hidden
- A **"← Home"** back bar appears at the top with the section name
- Tap **"← Home"** to return to the full page

| Tab | What shows |
|-----|-----------|
| 🏠 Home | Full page — all sections |
| 📚 Programs | Only "Our Programs" section |
| 🏛️ About | Only "About Us" section |
| 🖼️ Moments | Only "Moments/Gallery" section |
| ✉️ Contact | Only "Contact" section |

> **On desktop**, this feature is disabled. Desktop always uses smooth scrolling — all sections are always visible.

---

## 10. Firestore Security Rules

When you first set up Firestore in "test mode", **anyone can read and write** your database. That's fine for testing but you should update the rules before going live.

1. In Firebase Console → **Firestore Database** → click the **"Rules"** tab
2. Replace everything there with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Anyone can read settings, gallery, posts (needed for public site)
    match /settings/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /gallery/{doc} {
      allow read: if true;
      allow write: if false;
    }
    match /posts/{doc} {
      allow read: if true;
      allow write: if false;
    }

    // Contact form: anyone can submit, nobody can read/delete publicly
    match /contacts/{doc} {
      allow create: if true;
      allow read, update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

> ⚠️ **Note:** With these rules, your admin panel won't be able to write to Firestore from the browser
> because the rules block writes. This is for maximum security.
>
> **For a working admin panel with secure rules**, you have two practical options:
>
> **Option A (Easy):** Keep the rules in test mode while you're actively using the admin panel,
> then switch to secure rules when you don't need to make updates for a while.
>
> **Option B (Advanced):** Set up Firebase Authentication (email/password) and require
> the user to be authenticated before allowing writes. This is the proper long-term solution
> but requires additional Firebase setup.

---

## 11. Troubleshooting

### Website shows but gallery/posts don't load
→ Your Firebase config values are wrong. Open browser dev tools (F12) → Console tab.
→ Look for red error messages. Usually says "Firebase: Error (auth/invalid-api-key)".
→ Go back to Firebase Console → Project Settings → copy the exact values again.

### Images don't upload in admin panel
→ Your Cloudinary cloud name or upload preset is wrong.
→ Make sure the upload preset is set to **Unsigned** (not Signed).
→ Check the browser console (F12) for error messages.

### "Firebase not connected" toast appears in admin
→ The firebase config in `admin.html` is missing or wrong.
→ Both `index.html` AND `admin.html` need their own copy of the firebaseConfig.

### Admin panel login doesn't work
→ Check the `username` and `password` values in `assets/js/admin.js` inside `ADMIN_CONFIG`.
→ Make sure you saved the file after changing them.

### Site deploys on Vercel but Firebase doesn't work
→ Vercel is serving your files exactly as they are on disk.
→ Since your keys are directly in the HTML/JS files, they should work.
→ Double-check you didn't accidentally leave any `REPLACE_WITH_...` placeholders.

### Mobile section focus isn't working
→ Make sure you're testing on an actual phone or using Chrome DevTools mobile emulation.
→ The feature only activates at screen width ≤ 768px.
→ Try a hard refresh: on mobile Chrome, tap the 3-dot menu → Reload.

### Changes in admin don't appear on public site
→ The public site loads data from Firebase each time the page loads.
→ After saving in admin, **hard-refresh** the public site (Ctrl+Shift+R on desktop).
→ On mobile, close and reopen the browser tab.

---

## 📞 Need Help?

Contact: info@imtinstitute.org

---

*Last updated: 2024 | Institute of Modern Technology*
