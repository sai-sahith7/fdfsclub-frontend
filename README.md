# FDFSClub frontend

Web app for [FDFSClub](https://fdfsclub.in): pick a city, movie, date and theatres, and get a Telegram message or email when tickets open. The API and scan workers live in [fdfsclub-backend](https://github.com/sai-sahith7/fdfsclub-backend).

## Stack

React 18, TypeScript, Vite, React Router, TanStack Query for server data, Zustand for auth and the create-alert wizard, framer-motion for animation. Styles live in `src/index.css` plus inline styles. Tests use Vitest and Testing Library.

## Setup

```bash
npm install
npm run dev   # http://localhost:5173
```

Copy `.env.example` to `.env` and fill in the values:

| Variable | Example | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_GOOGLE_AUTH_URL` | `http://localhost:8000/auth/google` | Google sign-in start URL on the backend |
| `VITE_GA_MEASUREMENT_ID` | `G-XXXXXXXXXX` | Google Analytics 4 measurement ID (optional, production builds only) |
| `VITE_CLARITY_PROJECT_ID` | `abcd1234ef` | Microsoft Clarity project ID (optional, production builds only) |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm test` | Run the test suite once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | ESLint, zero warnings allowed |

## Layout

```text
src/
  api/         axios client, one module per backend area, error helpers
  components/  shared UI (ui/, layout/) and feature components (alerts/, auth/, create-alert/, landing/)
  hooks/       React Query hooks and auth helpers
  pages/       one component per route
  store/       Zustand stores and the session cookie helpers
  types/       shared TypeScript types
tests/         mirrors src/
public/        static assets, Cloudflare Pages _headers, robots.txt, sitemap.xml, llms.txt
```

## Sessions

The sign-in token is a 7-day JWT stored in a cookie. Every API call checks it first. An expired token, or any 401 from the API, signs the user out and opens the sign-in sheet, which returns them to the same page after they sign in.

## Deploy

Live at https://fdfsclub.in, hosted on Cloudflare Pages. Pushing to `master` builds and deploys. Production uses `VITE_API_BASE_URL=https://api.fdfsclub.in` and `VITE_GOOGLE_AUTH_URL=https://api.fdfsclub.in/auth/google`.

`public/_headers` sets the security and cache headers, and marks the `*.pages.dev` preview hosts `noindex`.

## SEO and agents

Only `/` is public. `index.html` carries the canonical URL, Open Graph and Twitter tags, and JSON-LD (WebSite, Organization, WebApplication, FAQPage). It also holds a plain-HTML copy of the landing content inside `#root`, so crawlers and agents that don't run JavaScript still read it. React replaces it on load. Keep that copy, the JSON-LD FAQ and `public/llms.txt` in step with the landing page and `MAX_ACTIVE_ALERTS`.

`robots.txt` keeps crawlers out of the signed-in routes and points to `sitemap.xml`. `llms.txt` is a plain-text summary for AI agents.

## License

[MIT](LICENSE). To contribute, see [CONTRIBUTING.md](CONTRIBUTING.md).
