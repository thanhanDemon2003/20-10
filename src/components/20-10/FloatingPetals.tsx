const petals = [
  { left: "7%", delay: "-3s", duration: "22s", size: 11, drift: "80px" },
  { left: "22%", delay: "-11s", duration: "28s", size: 7, drift: "-60px" },
  { left: "78%", delay: "-18s", duration: "26s", size: 13, drift: "65px" },
  { left: "91%", delay: "-7s", duration: "24s", size: 8, drift: "-70px" },
  { left: "63%", delay: "-22s", duration: "31s", size: 6, drift: "90px" },
  { left: "39%", delay: "-15s", duration: "30s", size: 8, drift: "-110px" },
];

export function FloatingPetals({ burst = false }: { burst?: boolean }) {
  return <div className={`petals ${burst ? "petals-burst" : ""}`} aria-hidden="true">
    {petals.map((petal, i) => <span key={i} style={{
      left: petal.left, animationDelay: petal.delay, animationDuration: petal.duration,
      width: petal.size, height: petal.size * 1.5, "--drift": petal.drift,
    } as React.CSSProperties} />)}
  </div>;
}
