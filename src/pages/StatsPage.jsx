// src/pages/StatsPage.jsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  Legend,
} from "recharts";

import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  DollarSign,
  BarChart as BarIcon,
} from "lucide-react";

// Telegram color palette
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

const TYPE_COLORS = {
  Gasto: TELEGRAM_COLORS.accentRed,
  Ingreso: TELEGRAM_COLORS.accentGreen,
  Ahorro: TELEGRAM_COLORS.primary, // user asked Blue for Ahorro previously; Telegram primary is blue
};

function Money(num) {
  const n = Number(num);
  if (num == null || Number.isNaN(n)) return "—";
  return n.toLocaleString();
}


function EmptyState({ icon: Icon, text = "Sin datos disponibles" }) {
  return (
    <div
      className="empty-state"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        border: `1px dashed ${TELEGRAM_COLORS.border}`,
        borderRadius: 14,
        color: TELEGRAM_COLORS.textSecondary,
        background: TELEGRAM_COLORS.surface,
      }}
    >
      <Icon size={32} className="text-muted" />
      <p className="empty-text" style={{ margin: 0, fontSize: 13 }}>
        {text}
      </p>
    </div>
  );
}

function DualBar({
  data,
  xKey,
  aKey,
  bKey,
  aLabel,
  bLabel,
  height = 260,
  byType = false,
  aColor,
  bColor,
  showValues = true, // ✅ new
}) {
  const clean = Array.isArray(data) ? data : [];
  if (!clean.length) return <EmptyState icon={BarIcon} />;

  // inside DualBar component, before return:

  const typeKeys = ["Ingreso", "Gasto", "Ahorro"]; // order in legend
  const getColor = (t) => TYPE_COLORS[t] || TELEGRAM_COLORS.primary;

  const LegendTwoItemsByType = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 18,
        flexWrap: "wrap",
        paddingBottom: 10,
      }}
    >
      {/* REAL */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: TELEGRAM_COLORS.textSecondary }}>
          Real
        </span>

        <div style={{ display: "flex", gap: 4 }}>
          {typeKeys.map((t) => (
            <span
              key={`real-${t}`}
              title={`${t} Real`}
              style={{
                width: 14,
                height: 10,
                borderRadius: 4,
                background: getColor(t),
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </div>

      {/* PRESUPUESTO */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: TELEGRAM_COLORS.textSecondary }}>
          Presupuesto
        </span>

        <div style={{ display: "flex", gap: 4 }}>
          {typeKeys.map((t) => (
            <span
              key={`budget-${t}`}
              title={`${t} Presupuesto`}
              style={{
                width: 14,
                height: 10,
                borderRadius: 4,
                background: getColor(t),
                opacity: 0.35, // same as budget bars
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );


  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
            data={clean}
            margin={{ top: 10, right: 20, left: 0, bottom: 8 }}
            barCategoryGap={16}
          >
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 12, fill: TELEGRAM_COLORS.textSecondary }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: TELEGRAM_COLORS.textSecondary }}
            axisLine={{ stroke: TELEGRAM_COLORS.border }}
            tickLine={{ stroke: TELEGRAM_COLORS.border }}
          />

          <Legend
            verticalAlign="top"
            align="center"
            height={40}
            content={() => <LegendTwoItemsByType />}
          />

          {/* REAL */}
          <Bar dataKey={aKey} name={aLabel} radius={[8, 8, 0, 0]}>
            {clean.map((entry, i) => (
              <Cell
                key={`real-${i}`}
                fill={
                  byType
                    ? TYPE_COLORS[entry.type] || TELEGRAM_COLORS.primary
                    : aColor || TELEGRAM_COLORS.primary
                }
              />
            ))}

            {showValues && (
              <LabelList
                dataKey={aKey}
                position="top"
                formatter={(v) => Money(v)}
                fontSize={10}
                fill={TELEGRAM_COLORS.textPrimary}
              />
            )}
          </Bar>

          {/* PRESUPUESTO */}
          <Bar dataKey={bKey} name={bLabel} radius={[8, 8, 0, 0]}>
            {clean.map((entry, i) => (
              <Cell
                key={`budget-${i}`}
                fill="transparent"
                stroke={byType ? (TYPE_COLORS[entry.type] || TELEGRAM_COLORS.primary) : (bColor || TELEGRAM_COLORS.accentBlue)}
                strokeWidth={2}
              />
            ))}

            {showValues && (
              <LabelList
                dataKey={bKey}
                position="top"
                formatter={(v) => Money(v)}
                fontSize={10}
                fill={TELEGRAM_COLORS.textSecondary} // slightly lighter for budget
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DualBarGroupedRight({
  data,
  yKey,                 // "subcategory"
  aKey,                 // "tracked"
  bKey,                 // "budget"
  aLabel = "Real",
  bLabel = "Presupuesto",
  aColor = TELEGRAM_COLORS.primary,
  bColor = TELEGRAM_COLORS.accentBlue,
  height = 300,
  valueFormatter = Money,
  showLabels = true,
}) {
  const clean = Array.isArray(data) ? data : [];
  if (!clean.length) return <EmptyState icon={BarIcon} />;

  const toNum = (v) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  const chartData = clean.map((d) => ({
    ...d,
    __a: toNum(d[aKey]),
    __b: toNum(d[bKey]),
  }));

  const maxVal = Math.max(
    ...chartData.flatMap((d) => [d.__a, d.__b]),
    0
  );

  const fmt = (v) => valueFormatter(v);

  const TopLegend = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 12,
        paddingBottom: 6,
        flexWrap: "wrap",
      }}
    >
      <LegendItem color={aColor} label={aLabel} />
      <LegendItem color={bColor} label={bLabel} />
    </div>
  );

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 24, left: 2, bottom: 10 }}
          barCategoryGap={54}
          barGap={2}
        >
          {/* Legend */}
          <Legend
            verticalAlign="top"
            align="center"
            height={28}
            content={() => <TopLegend />}
          />

          <XAxis
            type="number"
            domain={[0, maxVal * 1.1]}
            tickFormatter={fmt}
            tick={{ fill: TELEGRAM_COLORS.textSecondary, fontSize: 12 }}
            axisLine={{ stroke: TELEGRAM_COLORS.border }}
            tickLine={{ stroke: TELEGRAM_COLORS.border }}
          />

          <YAxis
            type="category"
            dataKey={yKey}
            width={90}
            tick={{ fill: TELEGRAM_COLORS.textSecondary, fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          {/* Real */}
          <Bar dataKey="__a" fill={aColor} barSize={16} radius={[0, 8, 8, 0]}>
            {showLabels && (
              <LabelList
                dataKey="__a"
                position="right"
                formatter={fmt}
                style={{ fontSize: 10, fontWeight: 800, fill: TELEGRAM_COLORS.textPrimary }}
              />
            )}
          </Bar>

          {/* Presupuesto */}
          <Bar dataKey="__b" fill={bColor} barSize={16} radius={[0, 8, 8, 0]}>
            {showLabels && (
              <LabelList
                dataKey="__b"
                position="right"
                formatter={fmt}
                style={{ fontSize: 10, fontWeight: 800, fill: TELEGRAM_COLORS.textPrimary }}
              />
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* Small helper */
function LegendItem({ color, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: color,
        }}
      />
      <span style={{ fontSize: 11, fontWeight: 800, color: TELEGRAM_COLORS.text }}>
        {label}
      </span>
    </div>
  );
}

function ProgressTable({ title, type, rows }) {
  if (!rows?.length) return null;

  // Height of the scrollable body
  const TABLE_BODY_MAX_HEIGHT = 220;

  // Color theme per transaction type
  const TYPE_THEME = {
    Ingreso: {
      badgeBg: TYPE_COLORS.Ingreso,
      text: TYPE_COLORS.Ingreso,
    },
    Gasto: {
      badgeBg: TYPE_COLORS.Gasto,
      text: TYPE_COLORS.Gasto,
    },
    Ahorro: {
      badgeBg: TYPE_COLORS.Ahorro,
      text: TYPE_COLORS.Ahorro,
    },
  };

  const theme = TYPE_THEME[type] || {};

  return (
    <div
      className="card"
      style={{
        border: `1px solid ${TELEGRAM_COLORS.border}`,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        className="card-header"
        style={{
          fontWeight: 900,
          fontSize: 13,
          color: theme.text,
          padding: "12px 14px",
        }}
      >
        {title}
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          {/* Table header */}
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th style={{ fontSize: 12, padding: "12px" }}>Subcategoría</th>
                <th style={{ fontSize: 12, padding: "12px" }} className="text-end">
                  Real
                </th>
                <th style={{ fontSize: 12, padding: "12px" }} className="text-end">
                  Presupuesto
                </th>
                <th style={{ fontSize: 12, padding: "12px" }} className="text-end">
                  %
                </th>
                <th style={{ fontSize: 12, padding: "12px" }} className="text-end">
                  Restante
                </th>
              </tr>
            </thead>
          </table>

          {/* Scrollable body */}
          <div
            style={{
              maxHeight: TABLE_BODY_MAX_HEIGHT,
              overflowY: "auto",
            }}
          >
            <table className="table table-hover mb-0">
              <tbody>
                {rows.map((r, idx) => {
                  const pct = Number(r.pct_completed);
                  const remaining = Number(r.remaining);

                  return (
                    <tr key={idx} style={{ fontSize: 12 }}>
                      <td style={{ padding: "12px" }} className="fw-medium">
                        {r.subcategory}
                      </td>

                      <td style={{ padding: "12px" }} className="text-end">
                        ${Money(r.tracked)}
                      </td>

                      <td style={{ padding: "12px" }} className="text-end">
                        ${Money(r.budget)}
                      </td>

                      {/* % badge (always black text) */}
                      <td style={{ padding: "12px" }} className="text-end">
                        <span
                          style={{
                            backgroundColor: theme.badgeBg,
                            color: "#000",
                            fontWeight: 800,
                            padding: "4px 8px",
                            borderRadius: 10,
                            fontSize: 11,
                          }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </td>

                      {/* Remaining */}
                      <td
                        style={{ padding: "12px" }}
                        className={`text-end fw-medium ${
                          remaining >= 0 ? "text-success" : "text-danger"
                        }`}
                      >
                        ${Money(remaining)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}


function StatCard({ title, value, icon: Icon, color, trend, subtitle }) {
  return (
    <div
      className="stat-card"
      style={{
        border: `1px solid ${TELEGRAM_COLORS.border}`,
        borderRadius: 16,
        padding: 14,
        background: TELEGRAM_COLORS.background,
        boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div className="stat-card-header" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={20} color={color} />
        <span className="stat-card-title" style={{ fontSize: 12, color: TELEGRAM_COLORS.textSecondary }}>
          {title}
        </span>
      </div>
      <div className="stat-card-value" style={{ fontSize: 22, fontWeight: 800, marginTop: 6 }}>
        ${Money(value)}
      </div>
      {subtitle && (
        <div className="stat-card-subtitle" style={{ marginTop: 4, fontSize: 12, color: TELEGRAM_COLORS.textSecondary }}>
          {subtitle}
        </div>
      )}
      {trend != null && (
        <div
          className={`stat-card-trend ${trend > 0 ? "trend-up" : "trend-down"}`}
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            padding: "4px 10px",
            borderRadius: 999,
            background: TELEGRAM_COLORS.surface,
            color: trend > 0 ? TYPE_COLORS.Ingreso : TYPE_COLORS.Gasto,
            fontWeight: 600,
          }}
        >
          {trend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
}

export default function StatsPage({ bootstrap }) {
  const stats = bootstrap?.monthlyStatistics;
  console.log("ejemplo");

  if (!stats) {
    return (
      <div className="alert alert-warning" style={{
        backgroundColor: "#fff3cd",
        borderColor: "#ffeaa7",
        color: "#856404",
        borderRadius: "12px",
        padding: "16px",
        margin: "16px",
        fontSize: 14,
      }}>
        No hay estadísticas disponibles.
      </div>
    );
  }

  // ✅ USE normalized arrays created in getBootstrapFromQuery()
  const totalsArr = stats.month_totals_by_type_arr || [];
  const incomeBySub = stats.month_income_by_subcategory_arr || [];
  const expenseBySub = stats.month_expenses_by_subcategory_arr || [];


  // if your chart expects type_name, keep type_name; if expects type, adjust accordingly
  const trackedVsBudgetByType = (stats.month_savings_by_subcategory_arr || []).map((r) => ({
    type: r.type,          // normalized in bootstrap
    tracked: Number(r.tracked ?? 0),
    budget: Number(r.budget ?? 0),
  }));

  const tvbIngreso = stats.tracked_vs_budget_by_subcategory_Ingreso || [];
  const tvbGasto = stats.tracked_vs_budget_by_subcategory_Gasto || [];
  const tvbAhorro = stats.tracked_vs_budget_by_subcategory_Ahorro || [];

  const savingsRate = Number(stats.savings_rate_for_month || 0);

  const totalIncome = totalsArr.find((t) => t.type === "Ingreso")?.total || 0;
  const totalExpense = totalsArr.find((t) => t.type === "Gasto")?.total || 0;
  const totalSavings = totalsArr.find((t) => t.type === "Ahorro")?.total || 0;

  const TYPE_COLORS = {
    Ingreso: "#22c55e", // Green
    Gasto: "#ef4444",   // Red
    Ahorro: "#3b82f6",  // Blue
  };

  return (
    <div className="stats-container" style={{ minHeight: "100%" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 14 }}>
        <h1 className="page-title" style={{ margin: 0, fontSize: 26, fontWeight: 900, color: TELEGRAM_COLORS.textPrimary }}>
          Estadísticas
        </h1>
        <div className="page-subtitle" style={{ marginTop: 4, fontSize: 13, color: TELEGRAM_COLORS.textSecondary }}>
          Resumen financiero del mes
        </div>
      </div>

      {/* KPI Row */}
      <div
        className="kpi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <StatCard title="Ingresos" value={totalIncome} icon={TrendingUp} color={TYPE_COLORS.Ingreso} />
        <StatCard title="Gastos" value={totalExpense} icon={TrendingDown} color={TYPE_COLORS.Gasto} />
        <StatCard title="Ahorros" value={totalSavings} icon={PiggyBank} color={TYPE_COLORS.Ahorro} />
      </div>

      {/* Savings Rate */}
      <div
        className="card"
        style={{
          borderRadius: 16,
          border: `1px solid ${TELEGRAM_COLORS.border}`,
          background: TELEGRAM_COLORS.background,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          marginBottom: 14,
        }}
      >
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: `1px solid ${TELEGRAM_COLORS.border}`,
          }}
        >
          <div className="d-flex align-items-center gap-2" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <DollarSign size={18} color={TELEGRAM_COLORS.primary} />
            <h6 className="mb-0" style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>
              Tasa de Ahorro
            </h6>
          </div>
          <div className="savings-rate-value" style={{ fontSize: 18, fontWeight: 900, color: TYPE_COLORS.Ahorro }}>
            {savingsRate.toFixed(1)}%
          </div>
        </div>
        <div className="card-body" style={{ padding: 14 }}>
          <div
            className="progress"
            style={{
              height: 12,
              borderRadius: 999,
              background: TELEGRAM_COLORS.surface,
              overflow: "hidden",
              border: `1px solid ${TELEGRAM_COLORS.border}`,
            }}
          >
            <div
              className="progress-bar"
              role="progressbar"
              style={{
                width: `${Math.max(0, Math.min(100, savingsRate))}%`,
                borderRadius: 999,
                background: TYPE_COLORS.Ahorro,
              }}
            />
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: TELEGRAM_COLORS.textSecondary }}>
            Meta sugerida: 20%–30%
          </div>
        </div>
      </div>

      {/* Charts Grid - Type distribution */}
      <div className="section-title" style={{ fontWeight: 900, margin: "10px 0 10px", color: TELEGRAM_COLORS.textPrimary }}>
        Distribución por Tipo
      </div>

      <div
        className="charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
      </div>

      {/* Real vs Budget by Type */}
      <div
        className="card"
        style={{
          borderRadius: 16,
          border: `1px solid ${TELEGRAM_COLORS.border}`,
          background: TELEGRAM_COLORS.background,
          boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          marginBottom: 14,
        }}
      >
        <div
          className="card-header"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 14px",
            borderBottom: `1px solid ${TELEGRAM_COLORS.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarIcon size={16} color={TELEGRAM_COLORS.primary} />
            <h6 className="mb-0" style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>
              Real vs Presupuesto (por tipo)
            </h6>
          </div>
        </div>
        <div className="card-body" style={{ padding: 14 }}>
          <DualBar
            data={trackedVsBudgetByType}
            xKey="type"
            aKey="tracked"
            bKey="budget"
            aLabel="Real"
            bLabel="Presupuesto"
            byType={true}
            height={260}
          />
        </div>
      </div>

      {/* Real vs Budget by Subcategory (ALL TYPES) */}
      <div className="section-title" style={{ fontWeight: 900, margin: "10px 0 10px", color: TELEGRAM_COLORS.textPrimary }}>
        Real vs Presupuesto (por subcategoría)
      </div>

      <div
        className="charts-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          className="card chart-card"
          style={{
            borderRadius: 16,
            border: `1px solid ${TELEGRAM_COLORS.border}`,
            background: TELEGRAM_COLORS.background,
            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="card-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              borderBottom: `1px solid ${TELEGRAM_COLORS.border}`,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <TrendingUp size={16} color={TYPE_COLORS.Ingreso} />
            <span>Ingreso</span>
          </div>
          <div className="card-body" style={{ padding: 14 }}>
            <DualBarGroupedRight
              data={tvbIngreso}
              yKey="subcategory"
              aKey="tracked"
              bKey="budget"
              aLabel="Real"
              bLabel="Presupuesto"
              aColor={TYPE_COLORS.Ingreso}
              bColor={TELEGRAM_COLORS.accentBlue}
              height={tvbIngreso.length * 42 + 100}
            />
          </div>
        </div>

        <div
          className="card chart-card"
          style={{
            borderRadius: 16,
            border: `1px solid ${TELEGRAM_COLORS.border}`,
            background: TELEGRAM_COLORS.background,
            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="card-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              borderBottom: `1px solid ${TELEGRAM_COLORS.border}`,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <TrendingDown size={16} color={TYPE_COLORS.Gasto} />
            <span>Gasto</span>
          </div>
          <div className="card-body" style={{ padding: 14 }}>
            <DualBarGroupedRight
              data={tvbGasto}
              yKey="subcategory"
              aKey="tracked"
              bKey="budget"
              aLabel="Real"
              bLabel="Presupuesto"
              aColor={TYPE_COLORS.Gasto}
              bColor={TELEGRAM_COLORS.accentBlue}
              height={tvbGasto.length * 42 + 100}
            />
          </div>
        </div>

        <div
          className="card chart-card"
          style={{
            borderRadius: 16,
            border: `1px solid ${TELEGRAM_COLORS.border}`,
            background: TELEGRAM_COLORS.background,
            boxShadow: "0 10px 24px rgba(0,0,0,0.06)",
          }}
        >
          <div
            className="card-header"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 14px",
              borderBottom: `1px solid ${TELEGRAM_COLORS.border}`,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <PiggyBank size={16} color={TYPE_COLORS.Ahorro} />
            <span>Ahorro</span>
          </div>
          <div className="card-body" style={{ padding: 14 }}>
            <DualBarGroupedRight
              data={tvbAhorro}
              yKey="subcategory"
              aKey="tracked"
              bKey="budget"
              aLabel="Real"
              bLabel="Presupuesto"
              aColor={TYPE_COLORS.Ahorro}
              bColor={TELEGRAM_COLORS.accentBlue}
              height={tvbAhorro.length * 42 + 100}
            />
          </div>
        </div>
      </div>

      {/* Progress Tables */}
      <div className="section-title" style={{ fontWeight: 900, margin: "10px 0 10px", color: TELEGRAM_COLORS.textPrimary }}>
        Progreso Detallado
      </div>

      <div
        className="tables-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 12,
          marginBottom: 10,
        }}
      >
        <ProgressTable title="Ingresos" type="Ingreso" rows={tvbIngreso} />
        <ProgressTable title="Gastos" type="Gasto" rows={tvbGasto} />
        <ProgressTable title="Ahorros" type="Ahorro" rows={tvbAhorro} />
      </div>
    </div>
  );
}
