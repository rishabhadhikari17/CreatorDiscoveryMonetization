import "./ColorSwatch.css";

export function ColorSwatch({ color, name, token, usage, darkText = false }) {
  return (
    <article className="color-swatch">
      <div
        className={`color-swatch__sample${darkText ? " color-swatch__sample--dark" : ""}`}
        style={{ backgroundColor: color }}
      >
        <span>{color}</span>
      </div>
      <div className="color-swatch__details">
        <div>
          <h3>{name}</h3>
          <code>{token}</code>
        </div>
        <p>{usage}</p>
      </div>
    </article>
  );
}
