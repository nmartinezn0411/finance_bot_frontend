const TELEGRAM_COLORS = {
  primary: "#0088cc",
  primaryDark: "#0077b3",
  background: "#ffffff",
  surface: "#f8f9fa",
  textPrimary: "#212121",
  textSecondary: "#6c757d",
  accentGreen: "#34c759",
  accentRed: "#ff3b30",
  accentBlue: "#5ac8fa",
  border: "#e1e5e9",
};

export function TopNav({ active, onChange, canShowStats }) {
  const Tab = ({ id, label, disabled }) => {
    const isActive = active === id;

    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(id)}
        disabled={disabled}
        title={disabled ? "No hay estadísticas disponibles" : ""}
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 999,
          border: "none",
          backgroundColor: isActive
            ? TELEGRAM_COLORS.primary
            : "transparent",
          color: isActive
            ? TELEGRAM_COLORS.background
            : TELEGRAM_COLORS.text,
          fontSize: 12,
          fontWeight: 900,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.45 : 1,
          transition: "all 160ms ease",
          boxShadow: isActive
            ? "0 8px 18px rgba(0,0,0,0.12)"
            : "none",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: 6,
          borderRadius: 999,
          border: `1px solid ${TELEGRAM_COLORS.border}`,
          background: TELEGRAM_COLORS.background,
          boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Tab id="form" label="Formulario" />
        <Tab id="stats" label="Estadísticas" disabled={!canShowStats} />
      </div>
    </div>
  );
}
