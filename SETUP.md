# Lighthouse Six Pillars OS Setup

## Files

- `six-pillars-audit.html`: the mobile-first frontend app.
- `manifest.json`, `app-icon.svg`, `sw.js`: installable PWA support.
- `google-apps-script-backend.gs`: Google Apps Script API for Google Sheets.

## Google Sheet Schema

Create a Google Sheet, open `Extensions > Apps Script`, paste `google-apps-script-backend.gs`, save it, then run `setupSheets()` once.

The script creates these tabs:

- `Food_Entries`
- `Food_Presets`
- `Workout_Entries`
- `Weight_Entries`
- `Jar_Entries`
- `Pillar_Checkins`
- `Advice_Jar_Entries`
- `Journal_Entries`
- `Projects`
- `Settings`

Each tab includes `id`, `created_at`, `updated_at`, `date`, `device_source`, and `sync_status`, plus section-specific fields.

## Apps Script Web App

1. In Apps Script, click `Deploy > New deployment`.
2. Choose `Web app`.
3. Execute as yourself.
4. Access can be `Anyone with the link` for simplest personal use, or restricted if you host the frontend in a way that can authenticate.
5. Copy the deployed `/exec` URL.
6. In `six-pillars-audit.html`, replace the `GOOGLE_SCRIPT_URL` constant with your URL.

The frontend uses optimistic updates. Entries appear immediately, then the outbox quietly syncs to Apps Script. If network or Apps Script fails, the sync chip shows an error and the local outbox retries when refreshed or back online.

## Hosting

For GitHub Pages:

1. Put these files in a repository.
2. Enable Pages from the branch containing the files.
3. Open the Pages URL ending in `/six-pillars-audit.html`.

For Netlify:

1. Drag the folder into Netlify deploys or connect the repo.
2. No build command is needed.
3. Publish directory is the folder containing `six-pillars-audit.html`.

## Add To Phone Home Screen

On iPhone Safari:

1. Open the hosted `six-pillars-audit.html` URL.
2. Tap Share.
3. Tap `Add to Home Screen`.

On Android Chrome:

1. Open the hosted URL.
2. Tap the browser menu.
3. Tap `Install app` or `Add to Home screen`.

## PIN

The 4 digit PIN is stored on the device in local storage. It is casual privacy, not real authentication. Protect the Google Sheet and Apps Script deployment carefully.

## Updating Later

The app is organized around table names and render functions. Future sections can plug into the existing model:

- Add a table schema in `google-apps-script-backend.gs`.
- Add the table name to `TABLES` in the frontend.
- Add render and entry sheet functions.
- Reuse `insertRow`, `updateRow`, and `deleteRow` for optimistic sync.

Project and budget structures are already represented in the backend schema so they can be promoted into full tabs later. The workout schema also supports multi-part workouts through `category` values joined with `|` and an `intensity_by_category` JSON object.

The workout plan lives in the `Settings` tab under the `weekly_plan` key and is also cached locally so the Today dashboard can show training progress immediately.

## Assumptions

- Version 1 stays dependency-free: plain HTML, CSS, and JavaScript.
- The PIN is intentionally local-only.
- Apps Script is the cloud API and Google Sheets is the database.
- The existing Claude single-file direction was preserved instead of splitting the app into a larger build system.
