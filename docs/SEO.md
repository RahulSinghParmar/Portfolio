# SEO and social-sharing baseline

Phase 10 turns the portfolio into a consistent machine-readable profile without changing its editorial interface. Search crawlers, social preview bots, recruiter searches, browsers and structured-data consumers now receive the same verified identity and project story.

## Search positioning

The primary entity is **Rahul Singh Parmar, Team Lead Network Engineer in Mumbai**. Supporting vocabulary covers the actual work represented on the page:

- network engineering, infrastructure operations and network security;
- AWS, cloud infrastructure, Linux and Windows administration;
- PowerShell, Python, GitHub Actions and operational automation;
- Docker, Cloudflare Workers, homelab engineering and self-hosting.

The title and description lead with the current role instead of presenting Rahul as a developer-only or generic DevOps profile. Keywords support recruiter terminology, but the visible copy and structured data remain the primary source of meaning.

## Metadata contract

- One absolute canonical URL: `https://rahulsinghparmar.site`.
- `en-IN` document language and a self-referencing language alternate.
- Recruiter-focused title and a search description kept within 120–160 characters.
- Index/follow on the home page and explicit noindex on the not-found route.
- Extended Googlebot preview permissions for large images and complete text snippets.
- Open Graph profile metadata for Rahul's name and public identity.
- Twitter/X large-card metadata tied to `@rahulsingh474`.
- Generated 1200×630 PNG previews with explicit dimensions and alt text.
- Generated 64×64 browser and 180×180 Apple icons, plus a web manifest.

## Structured data graph

The home page emits one escaped JSON-LD `@graph` containing:

- `Person` — name, current role, location, public identities, expertise and verified credentials;
- `WebSite` — portfolio identity, language and publisher relationship;
- `ProfilePage` — canonical profile page, primary image and maintained content date;
- `ItemList` — the three selected systems and their canonical on-page case-study anchors.

No employer, university, credential identifier or service claim is invented when the repository does not contain verified data. JSON-LD is serialized with `<` escaped to prevent executable markup injection.

## Crawl surfaces

- `/robots.txt` allows the public site, blocks the non-content `/api/` surface and declares the production sitemap.
- `/sitemap.xml` contains the canonical home route, maintained modification date and profile image.
- `/manifest.webmanifest` provides install identity, scope, theme and the generated icon.
- `/opengraph-image` and `/twitter-image` are statically generated and cached by Next.js.

Update `siteMetadata.contentUpdated` in `lib/seo.ts` only when meaningful public content changes. Avoid replacing it with the build time, which would send a false freshness signal on every deployment.

## Lighthouse review

Measured locally on 31 August 2026 against the production build:

| Profile | SEO score | Scored failures |
| ------- | --------: | --------------: |
| Desktop |       100 |               0 |
| Mobile  |       100 |               0 |

The pre-Phase 10 page also scored 100 because Lighthouse covers the basic discoverability path. The repository contract adds the deeper checks Lighthouse does not score: social image completeness, structured-data entities, canonical consistency, crawl files, manifest identity and not-found indexing behavior.

## Regression workflow

Run the production checks after any title, profile, project, route or social-card change:

```bash
npm run build
npm run seo:check
npm run performance:check
```

`seo:check` validates the prerendered HTML, not-found metadata, JSON-LD graph, robots file, sitemap, manifest, social images and icons. Lighthouse is a complementary audit rather than a replacement for this repository-specific contract.

## Production follow-up

After the new build is live:

1. Verify the production HTML and generated preview-image URLs resolve through the deployed domain.
2. Validate JSON-LD with Schema.org Validator and Google Rich Results Test.
3. Add the domain to Google Search Console and Bing Webmaster Tools, then submit `/sitemap.xml`.
4. Add provider verification tokens to Next.js metadata only after ownership is established; do not commit secret API keys.
5. Refresh cached previews with LinkedIn Post Inspector and the relevant social-card debugger.
6. Monitor indexed canonical URLs and structured-data warnings after crawlers revisit the site.

Search-console verification and live social cache refreshes are provider-dependent and intentionally remain deployment tasks.
