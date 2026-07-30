function HoneypotField() {
  return (
    <input
      type="text"
      name="honeypot"
      autoComplete="off"
      tabIndex={-1}
      aria-hidden="true"
      style={{ display: 'none' }}
    />
  );
}

export default HoneypotField;
