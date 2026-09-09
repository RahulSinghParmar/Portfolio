import { NetworkFoundation } from "./network-foundation";
import { NetworkSignalRuntime } from "./network-signal-runtime";

export function InfrastructureNetwork() {
  return (
    <figure
      className="infrastructure-network"
      aria-labelledby="network-caption network-description"
      data-network-frame
    >
      <span className="sr-only" id="network-description">
        A responsive infrastructure topology connecting edge, network, security, compute,
        observability, cloud and automation layers.
      </span>
      <NetworkFoundation />
      <NetworkSignalRuntime />
      <figcaption id="network-caption">
        <span>Topology / live signal routing</span>
        <span className="infrastructure-network__mode">Adaptive pointer response</span>
      </figcaption>
    </figure>
  );
}
