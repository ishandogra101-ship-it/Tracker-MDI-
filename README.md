# Class Tracker

A shared assignment/quiz tracker for a trusted class group, presented as a live spreadsheet. One shared table, real-time sync, no accounts. Built with Vite + React and Firebase Firestore, hosted on GitHub Pages.

**Features**

- Dense, gridlined table — columns: Task No., Type, Subject, Task, Due, Assignee(s), Status, Group/Individual, Deliverables.
- Click any column header to sort; per-column filter row plus a global search box.
- Export the current (filtered/sorted) view to a real `.xlsx` file.
- Edit in place: click any cell to edit it inline (Enter or click-away saves, Esc cancels). Add rows with the “Add task” button/row; two-step confirm on delete. All edits sync live to every viewer via `onSnapshot`.
- Editorial design: off-white canvas, burnt-orange accent, Space Grotesk + Lora.

Live URL (once deployed): **https://ishandogra101-ship-it.github.io/Tracker-MDI-/**

## 1. Create the Firebase project (free tier)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**. Name it anything (e.g. `class-tracker`). Google Analytics is not needed — disable it.
2. In the project, go to **Build → Firestore Database → Create database**. Pick the free **Spark** default, choose a nearby region, and start in **production mode**.
3. Open the **Rules** tab and replace the rules with (open access — fine for a small trusted group, don't share the URL publicly):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /entries/{entry} {
         allow read, write: if true;
       }
     }
   }
   ```

   Click **Publish**.
4. Go to **Project settings (gear icon) → General → Your apps → Web app (`</>` icon)**, register an app (no hosting needed), and copy the `firebaseConfig` values shown.

## 2. Where the config goes

The app reads the config from six environment variables (see `.env.example`). The `.env` file is gitignored — never commit it.

**Local development:** copy `.env.example` to `.env` and paste your values:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**Deployed site:** add the same six values as repository secrets — GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**, one secret per variable, named exactly as above.

## 3. Run locally

```
npm install
npm run dev
```

Open the printed localhost URL. Without a `.env` the app runs but shows a "Firebase not configured" banner.

## 4. Deploys

- One-time setup: repo → **Settings → Pages → Source: GitHub Actions**.
- Every push (or merged PR) to `main` triggers `.github/workflows/deploy.yml`, which builds the app with the secrets above and publishes `dist/` to GitHub Pages. You can also trigger it manually from the Actions tab (**Deploy to GitHub Pages → Run workflow**).
