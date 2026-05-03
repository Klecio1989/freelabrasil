"use client";

export default function Stars({ nota, setNota, readonly }) {
  return (
    <div style={{ fontSize: 28 }}>
      {[1,2,3,4,5].map((n) => (
        <span
          key={n}
          onClick={() => !readonly && setNota && setNota(n)}
          style={{
            cursor: readonly ? "default" : "pointer",
            color: n <= nota ? "#facc15" : "#d1d5db"
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}