# Contributing to FDFSClub

Thanks for helping out. Bug reports, ideas and pull requests are all welcome.

## Before you start

- For anything bigger than a small fix, open an [issue](https://github.com/sai-sahith7/fdfsclub-frontend/issues) first so we can agree on the approach.
- Problems with alerts, emails or the Telegram bot belong in [fdfsclub-backend](https://github.com/sai-sahith7/fdfsclub-backend/issues).
- Found a security issue? Don't open a public issue. See [SECURITY.md](SECURITY.md).

## Setup

```bash
npm install
cp .env.example .env
npm run dev   # http://localhost:5173
```

For sign-in and alerts to work locally, run [fdfsclub-backend](https://github.com/sai-sahith7/fdfsclub-backend) too and point `VITE_API_BASE_URL` at it.

## Making a change

1. Fork the repo and create a branch from `master`.
2. Keep changes focused on one thing.
3. Add or update tests for new behaviour.
4. Make sure these pass. CI runs them on every pull request:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
5. Open a pull request that says what changed and how you tested it. Add before and after screenshots for anything visual.

## Style

- Check new UI at phone width (390px).
- Keep copy plain and short. Write "FDFSClub", say "tickets open", use a plain hyphen for ranges and no em dashes.
- Keep the landing copy in `index.html` and `public/llms.txt` in step with the page.
- Code has no comments. Use clear names instead.

## Commit messages

Use one short line in the [Conventional Commits](https://www.conventionalcommits.org) style, for example `fix(alerts): keep the selected date after going back`.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
