# MEOWXCHEATS Gaming Website — upgraded starter

## What's included
- `index.html`: public gaming community website.
- `styles.css`: responsive dark-blue/cyan neon design.
- `app.js`: public download list and community-link loader.
- `admin.html` + `admin.js`: admin login, resource management, and Discord/Telegram link editor.
- `config.js`: public Supabase URL + publishable/anon key placeholders.
- `supabase-setup.sql`: database tables and Row Level Security policies.

## Important security notes
- This is a static website connected to Supabase for authentication and data. Admin access is protected by Supabase Auth and database RLS policies; it is not a client-side hardcoded password.
- Never place a Supabase `service_role` key, private API key, or password in `config.js`, HTML, JavaScript, or a public GitHub repository.
- This dashboard stores resource URLs and metadata. It does not upload files. Upload files to a trusted host or configure Supabase Storage separately.
- Do not use this as a payment system. For paid products/payments, use a trusted payment provider and server-side verification/webhooks before granting access.
- Admin role assignment is done in Supabase SQL Editor, not from the public website.

## Setup A — Configure Supabase (required for real admin)
1. Create a project at https://supabase.com/ .
2. Open SQL Editor and run all of `supabase-setup.sql`.
3. In Project Settings / API (or Connect), copy the Project URL and publishable key (older projects may call this the `anon` key).
4. Paste them into `config.js` as `SUPABASE_URL` and `SUPABASE_ANON_KEY`. These public values are safe to expose when RLS is configured correctly.
5. In Supabase Authentication, create your admin user and set a strong unique password.
6. Open SQL Editor and run the role update shown at the bottom of `supabase-setup.sql`, replacing the example email with your exact admin email. Do this only in the private Supabase dashboard.
7. Sign in at `/admin.html`. If you changed the role while logged in, sign out and sign in again.
8. In Supabase Authentication URL settings, add your deployed website URL to the allowed redirect/site URL settings as needed.

## Setup B — Publish free with GitHub Pages
1. Create/sign into GitHub: https://github.com/
2. Create a **public** repository such as `meowxcheats-website`.
3. Upload the files in this folder to the repository root. Keep `index.html` in the root.
4. Go to repository Settings → Pages.
5. Under Build and deployment, choose `Deploy from a branch`, branch `main`, folder `/(root)`, then Save.
6. Wait for the deployment, then open the URL shown by GitHub Pages. It will look like `https://YOUR-USERNAME.github.io/meowxcheats-website/`.
7. Open the same URL plus `admin.html` to reach the dashboard, for example `https://YOUR-USERNAME.github.io/meowxcheats-website/admin.html`.

## Setup C — Add your community URLs
- Sign in at `admin.html`.
- Paste your actual Discord invite and Telegram channel URLs.
- Click Save community links.
- Add resource title, description, category, URL, optional version/file size, and publish checkbox; click Save resource.
- Published resources show on the homepage. Draft resources remain admin-only.

## Notes
- Until `config.js` is configured, the public site displays demo content and the admin dashboard shows setup instructions.
- Public links should use trusted `https://` URLs. Do not publish files you do not own or have permission to distribute.
- This is a starter project, not a security audit. Keep Supabase, dependencies, and access settings updated.
