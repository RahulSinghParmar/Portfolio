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
        <p className="mono-meta">Delivery path / target architecture</p>
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
        The Cloudflare package is locally verified. Hosted preview, public routing and traffic
        cutover remain operator-controlled release steps.
      </p>
    </div>
  );
}
