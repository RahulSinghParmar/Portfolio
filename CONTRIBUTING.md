# Contributing

This portfolio is a personal production site, but focused corrections and improvements are welcome.

## Before opening an issue

- Use an issue for a reproducible defect, accessibility problem, broken link, security-safe performance regression or documentation error.
- Do not open public issues containing secrets, private infrastructure details or vulnerability instructions. Follow [SECURITY.md](./SECURITY.md) instead.
- Content about Rahul's employment, credentials, projects or availability must be verifiable before publication.

## Local setup

```bash
git clone https://github.com/RahulSinghParmar/Portfolio.git
cd Portfolio
npm ci
npm run dev
```

Node.js 22 is recommended. Open `http://localhost:3000`.

## Change standards

- Keep public content in the typed modules under `data/`.
- Preserve server-component boundaries unless client state is required.
- Do not make animation necessary for navigation or comprehension.
- Test desktop, tablet and mobile layouts without horizontal overflow.
- Preserve keyboard access, focus visibility and reduced-motion behavior.
- Add dependencies only when the maintenance and bundle cost is justified.
- Never commit `.env` files, tokens, monitoring payloads or internal hostnames.

## Required checks

Run the complete local gate before submitting a pull request:

```bash
npm run quality:check
```

For deployment-related changes, also build and test the container as described in [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

## Pull requests

Keep each pull request narrow. Describe the problem, the decision made, visual or operational impact, and the checks performed. Include before/after captures only when they clarify a visual change; do not add generated assets without documenting their source and publication rights.

By contributing, you agree that your code contribution is licensed under the repository's MIT License.
