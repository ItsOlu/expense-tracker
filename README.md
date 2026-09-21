# Expense Tracker — React + Chart.js + Firebase

A responsive expense tracker with:

- Email/password authentication
- Firestore-backed expense CRUD
- Real-time updates with `onSnapshot`
- Category and month filters
- Total, average, and top-category summaries
- Doughnut chart by category
- Bar chart for the last six months of spending
- Per-user Firestore security rules

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Firebase project and add a Web app.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Create a **Cloud Firestore** database.
5. Copy `.env.example` to `.env` and paste in your Firebase Web config values.
6. Publish the rules in `firestore.rules` using the Firebase console or Firebase CLI.
7. Start the app:
   ```bash
   npm run dev
   ```

## Production build

```bash
npm run build
```

## Data model

Expenses are stored at:

`users/{uid}/expenses/{expenseId}`

Each expense contains `description`, `amount`, `category`, `date`, `createdAt`, and `updatedAt`.
