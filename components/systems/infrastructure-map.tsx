"use client";

import { type KeyboardEvent, useRef, useState } from "react";
import { skillLayers } from "@/data/skills";

export function InfrastructureMap() {
  const [activeId, setActiveId] = useState(skillLayers[0].id);
  const controlRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeLayer = skillLayers.find((layer) => layer.id === activeId) ?? skillLayers[0];

  const selectLayer = (index: number, moveFocus = false) => {
    const layer = skillLayers[index];
    setActiveId(layer.id);
    if (moveFocus) controlRefs.current[index]?.focus();
  };

  const handleControlKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | undefined;

    switch (event.key) {
      case "ArrowDown":
      case "ArrowRight":
        nextIndex = (index + 1) % skillLayers.length;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        nextIndex = (index - 1 + skillLayers.length) % skillLayers.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = skillLayers.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    selectLayer(nextIndex, true);
  };

  return (
    <div className="infrastructure-map" data-system-map>
      <div className="infrastructure-map__visual">
        <div className="infrastructure-map__legend mono-meta">
          <span>Operational topology</span>
          <span>07 connected layers</span>
        </div>
        <svg viewBox="0 0 720 420" role="img" aria-labelledby="capability-map-title">
          <title id="capability-map-title">
            Rahul&apos;s connected infrastructure engineering capabilities
          </title>
          <g className="infrastructure-map__grid" aria-hidden="true">
            {Array.from({ length: 13 }, (_, index) => (
              <line key={`v-${index}`} x1={index * 60} y1="0" x2={index * 60} y2="420" />
            ))}
            {Array.from({ length: 8 }, (_, index) => (
              <line key={`h-${index}`} x1="0" y1={index * 60} x2="720" y2={index * 60} />
            ))}
          </g>
          <g aria-hidden="true">
            {skillLayers.map((layer) => (
              <line
                className="infrastructure-map__route"
                data-layer-route={layer.id}
                data-active={layer.id === activeId}
                key={layer.id}
                x1="360"
                y1="210"
                x2={layer.x}
                y2={layer.y}
              />
            ))}
          </g>
          <g className="infrastructure-map__core" aria-hidden="true">
            <circle r="46" cx="360" cy="210" />
            <circle r="5" cx="360" cy="210" />
            <text x="360" y="226" textAnchor="middle">
              OPERATE
            </text>
          </g>
          <g aria-hidden="true">
            {skillLayers.map((layer, index) => (
              <g
                className="infrastructure-map__node"
                data-layer-node={layer.id}
                data-active={layer.id === activeId}
                key={layer.id}
                onClick={() => setActiveId(layer.id)}
                onPointerEnter={() => selectLayer(index)}
                transform={`translate(${layer.x} ${layer.y})`}
              >
                <circle r="20" />
                <circle r="4" />
                <circle className="infrastructure-map__node-hit" r="32" />
                <text y="34" textAnchor="middle">
                  {layer.label.toUpperCase()}
                </text>
              </g>
            ))}
          </g>
        </svg>
        <p className="infrastructure-map__caption mono-meta">
          Select a layer to inspect its role in the operating model.
        </p>
      </div>

      <div className="infrastructure-map__interface">
        <ol className="infrastructure-map__controls" aria-label="Capability layers">
          {skillLayers.map((layer, index) => (
            <li key={layer.id}>
              <button
                className="focus-ring"
                type="button"
                aria-controls="capability-layer-detail"
                aria-pressed={layer.id === activeId}
                data-layer-control={layer.id}
                onClick={() => selectLayer(index)}
                onFocus={() => selectLayer(index)}
                onKeyDown={(event) => handleControlKeyDown(event, index)}
                onPointerMove={() => {
                  if (layer.id !== activeId) selectLayer(index);
                }}
                ref={(element) => {
                  controlRefs.current[index] = element;
                }}
                tabIndex={layer.id === activeId ? 0 : -1}
              >
                <span className="mono-meta">{layer.index}</span>
                <span>{layer.label}</span>
                <span aria-hidden="true">↗</span>
              </button>
            </li>
          ))}
        </ol>

        <div
          className="infrastructure-map__detail"
          id="capability-layer-detail"
          aria-atomic="true"
          aria-live="polite"
        >
          <div className="infrastructure-map__detail-content" key={activeLayer.id}>
            <p className="mono-meta">Active layer / {activeLayer.index}</p>
            <h3>{activeLayer.label}</h3>
            <p>{activeLayer.description}</p>
            <p className="infrastructure-map__signal mono-meta">{activeLayer.signal}</p>
            <ul aria-label={`${activeLayer.label} technologies`}>
              {activeLayer.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
