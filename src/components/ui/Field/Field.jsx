import "./Field.css";

export function Field({ id, label, hint, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input id={id} {...props} />
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function SelectField({ id, label, children, ...props }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <select id={id} {...props}>
        {children}
      </select>
    </label>
  );
}
