import React from 'react';

export default function Loading() {
  return (
    <svg
      style={{
        margin: "auto",
        background: "none",
        display: "block",
        shapeRendering: "auto"
      }}
      width="25px"
      height="25px"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle
        cx={50}
        cy={50}
        fill="none"
        stroke="#ffffff"
        strokeWidth={10}
        r={35}
        strokeDasharray="164.93361431346415 56.97787143782138"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          repeatCount="indefinite"
          dur="1s"
          values="0 50 50;360 50 50"
          keyTimes="0;1"
        />
      </circle>
    </svg>
  );
}
