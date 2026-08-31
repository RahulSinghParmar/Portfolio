"use client";

import { useState } from "react";
import { skillLayers } from "@/data/skills";

export function InfrastructureMap() {
  const [activeId, setActiveId] = useState(skillLayers[0].id);
  const activeLayer = skillLayers.find((layer) => layer.id === activeId) ?? skillLayers[0];

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
            {skillLayers.map((layer) => (
              <g
                className="infrastructure-map__node"
                data-active={layer.id === activeId}
                key={layer.id}
                transform={`translate(${layer.x} ${layer.y})`}
              >
                <circle r="20" />
                <circle r="4" />
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
          {skillLayers.map((layer) => (
            <li key={layer.id}>
              <button
                className="focus-ring"
                type="button"
                aria-pressed={layer.id === activeId}
                onClick={() => setActiveId(layer.id)}
                onPointerEnter={() => setActiveId(layer.id)}
              >
                <span className="mono-meta">{layer.index}</span>
                <span>{layer.label}</span>
                <span aria-hidden="true">↗</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="infrastructure-map__detail" aria-live="polite">
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
  );
}
