const deliverySteps = [
  { index: "01", title: "Commit", detail: "Reviewed source on GitHub" },
  { index: "02", title: "Validate", detail: "Lint · types · Worker tests" },
  { index: "03", title: "Export", detail: "Next.js static assets" },
  { index: "04", title: "Package", detail: "API Worker + asset manifest" },
  { index: "05", title: "Deploy", detail: "Cloudflare edge runtime" },
] as const;

export function DeploymentPipeline() {
  return (
    <div className="delivery-pipeline" data-reveal>
      <header>
        <p className="mono-meta">Delivery path / Cloudflare</p>
        <h3>From reviewed change to observable runtime.</h3>
      </header>
      <ol>
        {deliverySteps.map((step) => (
          <li key={step.index}>
            <span className="delivery-pipeline__route" aria-hidden="true" />
            <span className="mono-meta">{step.index}</span>
            <h4>{step.title}</h4>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
      <p className="delivery-pipeline__note mono-meta">
        Reviewed changes pass automated checks, then an approved GitHub Actions deployment publishes
        the static assets and API Worker to Cloudflare.
      </p>
    </div>
  );
}
