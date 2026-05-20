# SoloPhotography Frontend — Vercel Deployment

## Deploy in 5 clicks

1. Upload this folder to a new GitHub repo named `solo-photography-frontend`.
2. Go to https://vercel.com → sign in with GitHub → **Add New → Project**.
3. Import the `solo-photography-frontend` repo.
4. Framework preset auto-detects as **Vite**. Leave everything default.
5. Click **Deploy**.

Vercel gives you a public URL like `https://solo-photography-frontend.vercel.app`
that works on any device, any network, no Bit login.

## Backend URL

The default backend is set to `https://solo-oy78.onrender.com`. To override:
- Vercel project → **Settings → Environment Variables**
- Add `VITE_BACKEND_URL` = your backend URL
- Redeploy

## Admin login

- `solophotography@icloud.com`
- `Shlomi123!`
