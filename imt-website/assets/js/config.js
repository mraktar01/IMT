// ============================================================
// config.js — All environment variables injected by Vercel
// On Vercel: set these in Project > Settings > Environment Variables
// Locally: use .env.local (Vite/Node) or replace placeholders
// ============================================================

const IMT_CONFIG = {
  firebase: {
    apiKey:            "%%VITE_FIREBASE_API_KEY%%",
    authDomain:        "%%VITE_FIREBASE_AUTH_DOMAIN%%",
    projectId:         "%%VITE_FIREBASE_PROJECT_ID%%",
    storageBucket:     "%%VITE_FIREBASE_STORAGE_BUCKET%%",
    messagingSenderId: "%%VITE_FIREBASE_MESSAGING_SENDER_ID%%",
    appId:             "%%VITE_FIREBASE_APP_ID%%"
  },
  cloudinary: {
    cloudName:    "%%VITE_CLOUDINARY_CLOUD_NAME%%",
    uploadPreset: "%%VITE_CLOUDINARY_UPLOAD_PRESET%%"
  },
  admin: {
    username: "%%VITE_ADMIN_USERNAME%%",
    password: "%%VITE_ADMIN_PASSWORD%%"
  }
};

// Vercel replaces %%VAR%% at build time when using @vercel/static-build.
// For pure static hosting on Vercel, the cleanest approach is to
// replace the placeholders below with your actual values after setting
// Vercel environment variables, OR use a build script.
// This file is intentionally NOT committed with real keys.
