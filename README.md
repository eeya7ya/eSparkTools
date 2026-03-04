# eSpark Tools — Internal Portal

A Next.js 14+ full-stack login page with Google OAuth and credentials authentication, backed by Neon (PostgreSQL) and styled with Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Auth**: NextAuth.js v5 (Auth.js)
- **Database**: Neon (PostgreSQL, serverless)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd eSparkTools
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your app URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

### 3. Set up the database

Run the schema migration against your Neon database:

```bash
psql $DATABASE_URL -f lib/db/schema.sql
```

Or paste the contents of `lib/db/schema.sql` into the Neon SQL Editor in your dashboard.

### 4. Create the first user

To create an admin user with credentials login, hash a password and insert:

```sql
-- Generate a bcrypt hash first (in Node.js):
-- const bcryptjs = require('bcryptjs');
-- bcryptjs.hash('your-password', 12).then(console.log);

INSERT INTO users (name, email, password_hash, role)
VALUES (
  'Admin User',
  'admin@esparktools.com',
  '$2a$12$YOUR_HASHED_PASSWORD_HERE',
  'admin'
);
```

Or use this Node.js one-liner to generate the hash:

```bash
node -e "require('bcryptjs').hash('your-password', 12).then(h => console.log(h))"
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to the login page.

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth client ID**
5. Select **Web application** as the application type
6. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-domain.com/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret** into your `.env.local`

## Deploy to Vercel

### With Neon Integration

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com/new)
3. Go to the **Integrations** tab and add the **Neon** integration
4. Vercel will automatically set `DATABASE_URL` for you
5. Add the remaining environment variables in **Settings > Environment Variables**:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
6. Deploy

### Manual Setup

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set all environment variables in Vercel
4. Deploy

## Authentication

- **Google OAuth**: Any Google account can sign in (creates a user record automatically)
- **Credentials**: Only `@esparktools.com` email addresses are allowed. Users must be pre-created in the database by an admin — there is no public registration.

## Project Structure

```
├── app/
│   ├── api/auth/[...nextauth]/route.ts  # NextAuth API routes
│   ├── dashboard/page.tsx               # Protected dashboard page
│   ├── login/page.tsx                   # Login page
│   ├── layout.tsx                       # Root layout
│   └── globals.css                      # Global styles
├── components/
│   └── LoginForm.tsx                    # Login form component
├── lib/
│   ├── auth.ts                          # NextAuth configuration
│   ├── db/
│   │   ├── client.ts                    # Neon database client
│   │   └── schema.sql                   # Database migration
│   └── utils.ts                         # Utility functions
├── middleware.ts                         # Auth middleware
└── .env.local.example                   # Environment variable template
```
