# Frontend

React application for PingDeck. Built with Vite, TypeScript, and Tailwind CSS v4.

---

## Prerequisites

- Node.js v18+
- Backend services running (see `../Backend/README.md`)

---

## Local setup

**1. Install dependencies**

```bash
npm install
```

**2. Set up environment**

Create a `.env` file in this directory:

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

**3. Start the dev server**

```bash
npm run dev
```

Opens at `http://localhost:5173`.

---

## Project structure

```
src/
  features/
    auth/         Login, register, email verification, Google OAuth
    dashboard/    Main layout after login
    projects/     Project list and sidebar navigation
    monitor/      Endpoint config, latency charts, response history
    landing/      Public landing page
  shared/         Shared UI components, API client (axios), layout
  store/          Zustand auth store
```

---

## Build

```bash
npm run build
```

Output goes to `dist/`. Deploy to Vercel or any static host.
