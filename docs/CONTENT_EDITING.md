# Editing portfolio content

The portfolio keeps public facts in typed data modules and presentation in React components. Routine biography, career, project and contact updates should not require changing component markup.

## Content map

| What you want to change                                                      | Source of truth          | Used by                                                   |
| ---------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------- |
| Name, role, employer, headline, biography, location, email and primary links | `data/profile.ts`        | Hero, introduction, metadata, contact and structured data |
| Employment history                                                           | `data/experience.ts`     | Career record                                             |
| Education, working modes and career direction                                | `data/professional.ts`   | Professional practice                                     |
| Case studies, architecture diagrams, metrics and project links               | `data/projects.ts`       | Selected work                                             |
| Capability groups and tools                                                  | `data/skills.ts`         | Engineering stack                                         |
| Certifications and verification links                                        | `data/certifications.ts` | Credential archive and structured data                    |
| Contact directory                                                            | `data/contact.ts`        | Contact section                                           |
| Search title, description, keywords and updated date                         | `lib/seo.ts`             | Metadata, structured data, sitemap and release checks     |

The interfaces in `data/types.ts` document required fields. TypeScript and the release gate will reject missing or malformed values.

## Common updates

### Change role, employer, biography or email

1. Edit the corresponding value in `data/profile.ts`.
2. Add or update the matching career entry in `data/experience.ts`.
3. If public positioning materially changed, revise `siteMetadata.description`, `socialDescription`, `keywords` and `contentUpdated` in `lib/seo.ts`.
4. Update the expected title or identity assertions in `scripts/check-seo.mjs` and `scripts/check-deployment.mjs` only when the public contract intentionally changed.

Do not duplicate these values directly in components. A value that appears in multiple sections belongs in the data layer.

### Add employment or education

- Add a new object to `experience` in `data/experience.ts`, newest first.
- Use an empty `responsibilities` array when operational detail should remain private.
- Edit `education` in `data/professional.ts` for the primary degree.
- Publish only role details, dates and outcomes that can be verified and safely disclosed.

### Add a project

1. Add one `Project` object in `data/projects.ts`.
2. Give it a unique `slug`, two-digit `index`, honest metrics and valid public URLs.
3. Define its architecture nodes and routes in the same object; the project component renders them automatically.
4. Update the selected-work count in `scripts/check-seo.mjs` if the public list size changes.

Keep the strongest and most relevant work first. Describe the operational problem, the design decision and the outcome rather than listing technologies alone.

### Change skills or certifications

- Edit capability groups in `data/skills.ts`; keep `id` values unique and preserve coordinates inside the diagram's view box.
- Add credentials in `data/certifications.ts`. Use `null` for a verification URL or date that is not publicly available.

### Change contact links

Update identity links in `data/profile.ts` and the detailed channel row in `data/contact.ts`. If the number of verified public identities changes, update the corresponding assertion in `scripts/check-seo.mjs`.

## Portrait workflow

The visible portrait is `public/images/rahul-portrait.webp`. It has a real alpha channel and no rectangular backdrop.

To replace it:

1. Prepare a PNG with the person on a flat chroma-key green plate. Keep the face, hair and body natural; do not add text, logos or a simulated checkerboard.
2. Place the source outside `public/`. The ignored `myphotos/` directory is suitable for local source material.
3. Run:

   ```powershell
   npm run asset:portrait -- "myphotos/new-portrait-green.png"
   ```

4. Inspect `public/images/rahul-portrait.webp` in both themes, especially hair, hands and clothing edges.
5. If the crop dimensions change materially, update the `width` and `height` values in `components/hero/hero-foundation.tsx`.
6. Run the full release gate.

The conversion script trims transparent space, removes the green plate, reduces edge spill and writes a compressed WebP with alpha. Keep source photographs out of Git unless their publication is intentional.

## Local development

Use Node.js 22 or later:

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. For the actual hosting runtime, use:

```powershell
npm run preview:cloudflare
```

Then, in a second terminal:

```powershell
npm run deployment:check -- http://127.0.0.1:8788
```

The Cloudflare preview is the authoritative local acceptance environment because it exercises static assets, API routes, cache policy, security headers and 404 behavior together.

## Validation before Git

Format the repository and run the complete gate:

```powershell
npm run format
npm run release:check
git status --short
```

Review the diff before committing. Never commit `.env*`, `.dev.vars`, tokens, private monitoring payloads or unpublished source portraits.

## Publishing a change

A push runs repository quality checks; it does not bypass the protected release process or automatically change production.

1. Create a focused branch and commit with your configured Git identity.
2. Push the branch and open a pull request.
3. Wait for **Release quality** to pass.
4. Deploy that exact commit to the preview environment with **Deploy Cloudflare portfolio**.
5. Review desktop, mobile, light, dark, reduced-motion and full-motion behavior.
6. Merge the accepted revision to `main`.
7. During an approved release window, enable the production gate and manually deploy the exact `main` SHA.
8. Run the public deployment contract, then disable the production gate again.

This deliberate promotion flow prevents an unfinished biography edit or broken visual change from going directly to the public domain. See [DEPLOYMENT.md](./DEPLOYMENT.md) for environment setup, promotion and rollback.

## Code conventions

- Prefer server components. Add `"use client"` only for browser behavior.
- Keep content in `data/`, layout in `components/`, shared contracts in `lib/` and edge behavior in `worker/`.
- Comment decisions and constraints, not syntax that the code already explains.
- Preserve semantic HTML, keyboard behavior, focus visibility and reduced-motion fallbacks.
- Avoid adding a dependency for a small behavior that CSS or existing utilities can handle.
- Keep claims factual and keep internal infrastructure details out of public content.
