export function WindAtmosphere({ warm = false }: { warm?: boolean }) {
  return <div className={`wind-atmosphere${warm ? " warm-breeze" : ""}`} aria-hidden="true">
    <svg className="wind-ribbon ribbon-one" viewBox="0 0 280 90" fill="none"><path d="M2 70C85 70 61 18 147 37S214 80 278 14" /></svg>
    <svg className="wind-ribbon ribbon-two" viewBox="0 0 280 90" fill="none"><path d="M2 56C80 4 133 97 212 37S268 13 278 25" /></svg>
    <span className="wind-leaf leaf-one" /><span className="wind-leaf leaf-two" /><span className="wind-leaf leaf-three" />
    <span className="warm-mote mote-one" /><span className="warm-mote mote-two" /><span className="warm-mote mote-three" />
  </div>;
}
