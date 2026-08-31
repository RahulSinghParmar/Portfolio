const pipeline = [
  { index: "01", title: "Observe", detail: "PRTG · Domotz · health endpoints" },
  { index: "02", title: "Detect", detail: "Thresholds · state transitions" },
  { index: "03", title: "Decide", detail: "Runbooks · routing · policy" },
  { index: "04", title: "Automate", detail: "PowerShell · Python · Shell" },
  { index: "05", title: "Verify", detail: "Metrics · recovery · alert close" },
] as const;

export function AutomationPipeline() {
  return (
    <div className="automation-pipeline" data-reveal>
      <div className="automation-pipeline__heading">
        <p className="mono-meta">Operating loop / closed</p>
        <h3>Signals become controlled action.</h3>
      </div>
      <ol>
        {pipeline.map((step) => (
          <li key={step.index}>
            <span className="automation-pipeline__line" aria-hidden="true" />
            <span className="mono-meta">{step.index}</span>
            <h4>{step.title}</h4>
            <p>{step.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
