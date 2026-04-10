# Quiz App (Expo)

Mobile trivia quiz app built with Expo + Firebase.

## Quick start

1) Create env file:

- Copy `.env.example` to `.env`
- Fill Firebase + Google client IDs + Expo owner

2) Run:

- `npm start`

## Firebase setup (minimum)

- Enable **Authentication**: Email/Password + Google
- Create **Firestore** database
- Create **Storage** bucket
- Add the Firestore rules from `firebase/firestore.rules`
- Add the Storage rules from `firebase/storage.rules`

### Firestore collections

- `Users/{uid}`
- `Questions/{id}`
- `Scores/{id}`
- `QuizSessions/{id}` (optional)

### Questions schema (for real bank)

Each document in `Questions` should use:

- `text` (string)
- `options` (array of strings, min 2, ideally 4)
- `correctIndex` (number)
- `category` (string, e.g. `History`, `Geography`)
- `categoryId` (string, e.g. `history`, `geography`)
- `subCategory` (string, e.g. `ancient`, `capitals`)
- `difficulty` (string: `easy` | `medium` | `hard`)
- `explanation` (string, optional)
- `roast` (string, optional)
- `imageUrl` (string, optional)

`categoryId` + `subCategory` are used as primary query keys for speed.

### Import real questions

The repo now includes a bulk importer:

- Sample file: `data/questions.sample.json`
- Spreadsheet-ready file: `data/questions.sample.csv`
- Import script: `functions/scripts/import-questions.js`

What you need:

- A Firebase service account JSON on your machine
- `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json`

Run it like this:

1. Install function dependencies:
- `cd functions && npm install`

2. Import questions:
- `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json npm run import:questions -- ../data/questions.sample.json`

You can also import a spreadsheet export:
- `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json npm run import:questions -- ../data/questions.sample.csv`

3. Replace the full bank if needed:
- `GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json npm run import:questions -- ../data/questions.sample.json --replace`

CSV columns should be:

- `text`
- `optionA`
- `optionB`
- `optionC`
- `optionD`
- `correctIndex`
- `category`
- `categoryId`
- `subCategory`
- `difficulty`
- `explanation`
- `roast`
- `imageUrl`

### Firestore indexes

Composite indexes now live in `firebase/firestore.indexes.json` and are wired through `firebase.json`.

If Firebase asks for indexes later, deploy them with:

- `firebase deploy --only firestore:indexes`

## Google Sign-In setup (Expo Go)

If Google says "invalid_request", verify all of these:

1. `.env` has:
- `EXPO_OWNER=your_expo_username_or_team`
- `EXPO_SLUG=quiz-app` (or your slug)
- `GOOGLE_EXPO_CLIENT_ID=...apps.googleusercontent.com`

2. In Google Cloud Console OAuth client:
- Add authorized redirect URI:
  `https://auth.expo.io/@<EXPO_OWNER>/<EXPO_SLUG>`

3. Restart Expo with clean cache:
- `npx expo start -c`

Important:

- Expo Go is not a reliable production path for Google sign-in on mobile.
- For real Android/iOS Google auth, move to a development build and wire a native Google sign-in library.

## Notes on Ads + Stripe

- Ads and subscriptions are scaffolded but **not fully implemented** in Expo Go.
- For real ads / Stripe payments, use a **custom dev client** + EAS build.
