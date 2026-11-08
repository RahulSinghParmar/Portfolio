# Edit your portfolio like a résumé

Open **`content/portfolio.json`**. This is the source for public identity, introduction, projects, employment, education, certifications, skills and links. You do not need to edit React components for routine updates.

Keep the first `$schema` line. VS Code uses `content/portfolio.schema.json` for completion and validation; use Ctrl+Space inside an object to see available fields. JSON uses double quotes and does not allow comments or trailing commas. Put explanatory notes in this guide rather than inside the JSON file.

## First local run

Use Node.js 22.23.1 or a newer supported Node 22 release:

```powershell
npm ci
npm run dev
```

Open http://localhost:3000 for content work. Validation runs before the development server starts. After editing, run `npm run content:check`; errors include a path such as `/projects/1/slug`. The development page refreshes as you save.

To review APIs, response headers and the real production behavior, stop the development server and run:

```powershell
npm run preview:cloudflare
```

Open http://127.0.0.1:8788. The preview rebuilds first; restart it after source changes. A clean build must not run while another process holds the output files open on Windows.

## Where each change belongs

| JSON key                                        | What you edit                                                                                 |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `profile`                                       | Name, title, employer, location, experience, biography, email, portrait, site/repository URLs |
| `profile.nameLines`                             | One to three short display lines for the hero name                                            |
| `profile.initials`, `username`, `employerShort` | Navigation/icon initials, account identity and short employer name                            |
| `profile.statement`, `introduction`, `headline` | Introduction heading, main paragraph and compact professional summary                         |
| `sections.about`, `sections.work`               | About/work headings and introductory copy                                                     |
| `experience`                                    | Career history, newest first                                                                  |
| `educationHistory`                              | One or more degrees; the first appears in the compact snapshot                                |
| `certifications`                                | Credential name, issuer, issue date and public verification link                              |
| `projects`                                      | Selected work, ordered by the story you want to tell                                          |
| `skillLayers`                                   | Capability-map labels, descriptions and tools                                                 |
| `workingModes`, `careerDirections`              | Current areas of practice and career direction                                                |
| `contactChannels`                               | Social, blog, homelab, referral and source links                                              |
| `seo`                                           | Search description, social summary, language, keywords and update date                        |

Name, current role, employer, location and links feed the hero, contact area, metadata and structured data automatically. Social cards, icons and sitemap regenerate during a build. Project/certification numbers and release-check expectations are generated; do not maintain counters yourself.

### Change your current job

Update `profile.role`, `profile.employer` and `profile.employerShort`. The employment object with `"current": true` inherits those values and your location. Update that object's summary and responsibilities. Keep only one current entry that inherits the shared profile.

When moving to another employer, change the previous entry to `"current": false` and give it its own `company`, `role` and `location`; then add the new current entry. Example shape:

```json
{
  "current": false,
  "period": "2024–2026",
  "company": "Your previous employer",
  "role": "Your previous role",
  "location": "Your location",
  "summary": "A specific description of the work you did.",
  "responsibilities": ["One factual responsibility or outcome."]
}
```

Use actual dates and outcomes. An empty `responsibilities` array is valid. Do not disclose private employer operations.

### Add education

Append to `educationHistory`:

```json
{
  "degree": "Your degree",
  "discipline": "Your field",
  "institution": "Your institution",
  "period": "Your actual dates",
  "note": "Optional context written as a string."
}
```

`institution` and `period` may be omitted. Keep `degree`, `discipline` and `note` present. Move the most relevant degree first.

### Add a certification

Append to `certifications`:

```json
{
  "name": "Your verified credential",
  "issuer": "Issuing organization",
  "issued": "Month Year",
  "credentialUrl": null
}
```

Replace `null` with a public HTTPS verification URL if one exists. Use an empty `issued` string when the date is unknown; do not invent it. Credential numbering updates automatically. An empty certifications array is valid.

### Add a project without drawing a diagram

Append this shape to `projects`, replacing the example values:

```json
{
  "slug": "my-automation-project",
  "title": "My automation project",
  "summary": "What it does and who it helps.",
  "role": "Development + automation",
  "year": "2026",
  "technologies": ["Python", "PowerShell"],
  "outcome": "The specific problem solved, without invented metrics.",
  "repositoryUrl": "https://github.com/YOUR-USER/YOUR-REPO",
  "liveUrl": null
}
```

That is enough for a project card. Optional `challenge`, `approach`, `automation`, `security` and `observability` paragraphs create the expandable deep dive. Optional `metrics` is an array of `{ "value": "...", "label": "..." }`. Include only measured or independently verifiable claims.

An optional `architecture` object adds the SVG diagram; copy an existing diagram only when you need it. Nodes use a 720×320 view box; IDs must be unique. A project slug must be unique and must not duplicate a page section such as `about` or `contact`. Array order determines display order and numbering.

### Update social, contact or referral links

Edit `contactChannels` once. Each entry contains `label`, `value` (display handle), `href` (HTTPS URL), `description` and `identity`.

Set `identity: true` only for a public profile that identifies you, such as GitHub or LinkedIn. It will also appear in search structured data. Set it to `false` for a project, homelab or referral link. Clearly describe a referral's purpose and any commercial relationship.

Email comes from `profile.email`. Contact order and labels are automatic. Review any manually written summary in `seo.description` after changing your role.

### Replace the portrait

Place the optimized public image under `public/images/` and update `profile.portrait.src`, `width` and `height` to its real dimensions. Use a transparent WebP or PNG for a cutout. The current portrait is already compressed and has an alpha channel.

For the existing green-screen conversion workflow:

```powershell
npm run asset:portrait -- "myphotos/new-portrait-green.png"
```

Inspect hair, hands, clothes and transparency in both themes. Keep private source photographs in the ignored `myphotos/` directory; anything in `public/` will be published.

## Fork this project for someone else

1. Fork/clone, install dependencies and edit the JSON keys in the table above.
2. Replace portrait, initials, name lines, social handles, repository URL and site URL. Review every project/certification before representing it as your own.
3. Set `seo.description`, `socialDescription`, `twitterHandle`, `contentUpdated` and keywords. Set the date to the actual content-update date.
4. Add or remove array entries as needed. A source fork retains upstream license notices; review the MIT license before redistribution.
5. Keep the existing infrastructure capability-map structure if it suits your work; changing its number of connected layers or spatial layout is a design change rather than a résumé edit.
6. For deployment, choose **your own** Worker names in `wrangler.jsonc`, GitHub environments/secrets and domain. Copying source does not grant access to the original owner's Cloudflare account. `NEXT_PUBLIC_SITE_URL`, if present, overrides the JSON domain at build time.
7. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for hosting, and [UPDATE_AND_RELEASE.md](UPDATE_AND_RELEASE.md) for publishing reviewed changes.

The `data/*.ts` files are rendering adapters. Edit the JSON rather than those adapters. `lib/seo.ts` and the SEO/deployment checks now read the configured identity and list sizes automatically.

## Validation and publishing

```powershell
npm run content:check
npm run release:check
```

With the local Cloudflare preview running in a second terminal:

```powershell
npm run deployment:check -- http://127.0.0.1:8788
npx playwright install chromium
npm run test:browser -- http://127.0.0.1:8788
```

Browser installation is a one-time development step. On Windows with Edge already installed, use `$env:BROWSER_CHANNEL = "msedge"` for the browser command instead.

The browser suite checks motion on a simulated two-core device, persistent motion controls, light/dark layouts at 320/390/820/1440 pixels, runtime health, mobile-menu keyboard behavior and reading without JavaScript. It is also part of the GitHub quality workflow.

Publishing remains a reviewed GitHub Actions operation. Saving JSON, committing or pushing does not change the live site by itself. Do not commit secrets, private monitoring data or unpublished source photos.

## Runtime signal and animation

The footer's **Motion / Auto, On, Off** control persists your choice. Auto respects reduced-motion and data-saving preferences. A low CPU-core count alone no longer disables the design. For diagnosis only, `?motion=full` and `?motion=reduced` still work; a visible control choice clears that override.

Without an external monitor, the Runtime signal checks this portfolio's own `/api/health`. Its timing includes the visitor's network. It does not claim an uptime percentage or verify homelab services.

See [STATUS_INTEGRATION.md](STATUS_INTEGRATION.md) to connect a separate, read-only JSON monitoring source when one is ready.
