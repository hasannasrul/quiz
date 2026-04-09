# History Quest (Expo)

Mobile trivia quiz app (History-only for now) built with Expo + Firebase.

## Quick start

1) Create env file:

- Copy `.env.example` to `.env`
- Fill Firebase + Google client IDs

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

## Notes on Ads + Stripe

- Ads and subscriptions are scaffolded but **not fully implemented** in Expo Go.
- For real ads / Stripe payments, use a **custom dev client** + EAS build.
