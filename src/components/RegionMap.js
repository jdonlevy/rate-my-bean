export default function RegionMap({ pins, size = "large" }) {
  return (
    <div className={`region-map ${size}`}>
      <div className="region-map-surface" />
      {pins.map((pin, index) => (
        <div
          className="region-pin"
          key={`${pin.country}-${pin.region || "all"}-${index}`}
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          title={`${pin.country}${pin.region ? ` · ${pin.region}` : ""}`}
        />
      ))}
    </div>
  );
}
