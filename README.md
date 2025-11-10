Bazaar — Local preview and client-side auth (school project)

Overview

This is a simple static marketplace demo built with HTML/CSS/vanilla JavaScript. For your school project, a client-side login/registration flow has been added that stores a minimal "user" object in localStorage (no backend used).

Files added/modified

- `login.html` — Sign in / Register forms (client-side only).
- `auth.js` — Handles register/login actions and messages (stores user in localStorage). Included by `login.html`.
- `style.css` — styles already present; login-related styles were appended.
- `script.js` — updated to show authenticated state in the nav (shows "Login" or "Name (Logout)").
- `products.html`, `about.html`, `contact.html`, `index.html` — nav updated to include a login/auth link.

How to run locally

1. Open the project folder `e:/sem5/DM/project` in your file explorer or code editor.
2. Open `index.html` in your browser (double-click or right-click > Open with...).

Notes about authentication (important)

- This implementation is for demonstration and school projects only. It does not provide real security.
- Registration and login are simulated and saved to `localStorage` as a plain JSON object under the key `user`.
- For a real application you must implement a backend with proper password hashing, secure session tokens, and email verification.

Quick test

- Visit `login.html`, register with a name and email. After registration you'll be forwarded to `index.html` and the nav should show your name followed by `(Logout)`.
- Click the nav name to logout (clears localStorage `user`).

Next steps (optional)

- Hook the forms to a backend API (Node/Express, Firebase, or similar).
- Add form validation and stronger password rules client-side.
- Replace Unsplash direct links with local images if you want the site to work fully offline.

If you'd like, I can:
- Add a small mock "profile" page showing stored user info.
- Wire a fake REST endpoint using a local JSON file and `fetch` to simulate a backend.
- Add email format and password-strength feedback on the signup form.

