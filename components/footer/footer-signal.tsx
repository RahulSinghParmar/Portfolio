export function FooterSignal() {
  return (
    <svg
      className="footer-signal"
      viewBox="0 0 720 110"
      role="img"
      aria-label="A continuous infrastructure signal travelling between connected nodes"
    >
      <path className="footer-signal__base" d="M0 55 H135 L188 18 H332 L390 92 H528 L585 55 H720" />
      <path
        className="footer-signal__active"
        d="M0 55 H135 L188 18 H332 L390 92 H528 L585 55 H720"
      />
      {[0, 135, 188, 332, 390, 528, 585, 720].map((x, index) => {
        const y = [55, 55, 18, 18, 92, 92, 55, 55][index];
        return <circle key={x} cx={x} cy={y} r={index === 7 ? 5 : 2.5} />;
      })}
    </svg>
  );
}
