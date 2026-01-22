
<br>

To setup a dev environment:

```bash
# Clone the repository

# Install dependencies 
npm i

# Run the local dev server
npm run dev
```

To serve a production build:

```bash
# Install dependencies if not already done - 'npi i'

# Build for production
npm run build

# Serve the build using express
npm start
```

## Deploy to Vercel

This repo is configured to deploy as a static site built by Webpack, with an optional serverless API endpoint for sending email.

### 1) Import the repo

- Push your code to GitHub (or GitLab/Bitbucket)
- In Vercel: **Add New → Project** → import this repository

Vercel will use [vercel.json](vercel.json) which sets:

- **Build Command**: `npm run build`
- **Output Directory**: `public`

### 2) Configure environment variables (optional: email API)

If you want to use `POST /api/send-email`, add these in Vercel:

- `FOLIO_EMAIL` — Gmail address used to send mail
- `FOLIO_PASSWORD` — Gmail App Password (recommended) or SMTP password

Optional:

- `FOLIO_TO_EMAILS` — comma-separated recipient list (defaults to `FOLIO_EMAIL`)

### 3) Deploy

- Click **Deploy**
- After deploy, the frontend is served from `public/` and the API endpoint is available at `/api/send-email`
