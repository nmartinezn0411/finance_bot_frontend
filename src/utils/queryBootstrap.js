export function parseJsonParam(params, key, fallback) {
  const raw = params.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error parsing ${key}:`, e, raw);
    return fallback;
  }
}

function dictToArray(d, keyName, valName) {
  if (!d || typeof d !== "object") return [];
  return Object.entries(d).map(([k, v]) => ({ [keyName]: k, [valName]: Number(v) }));
}

function tuplesToArray(list, keyName, valName) {
  if (!Array.isArray(list)) return [];
  return list.map(([k, v]) => ({ [keyName]: k, [valName]: Number(v) }));
}

function pairsOrObjectsToArray(list, keyName, valName) {
  if (!Array.isArray(list)) return [];

  // If backend sends objects: [{subcategory, total}]
  if (list.length && list[0] && typeof list[0] === "object" && !Array.isArray(list[0])) {
    return list.map((o) => ({
      [keyName]: o?.[keyName],
      [valName]: Number(o?.[valName] ?? 0),
    }));
  }

  // If backend sends tuples: [["Sueldo", 42000], ...]
  return list.map((pair) => {
    const [k, v] = Array.isArray(pair) ? pair : [null, null];
    return { [keyName]: k, [valName]: Number(v ?? 0) };
  });
}


export function getBootstrapFromQuery() {
  const params = new URLSearchParams(window.location.search);

  const urlAction = params.get("action") || "";
  const salary_day_end = params.get("salary_day_end") || "31";

  const initialTransactions = parseJsonParam(params, "initial_transactions", []);
  const transactionSubcategories = parseJsonParam(params, "initial_db_subcategories", []);
  const initialBudgetsRaw = parseJsonParam(params, "initial_budgets", {});
  const initialSubtransactionsRaw = parseJsonParam(params, "initial_subtransactions", []);

  // ✅ NEW: your actual stats key
  const monthlyStatisticUserRaw = parseJsonParam(params, "monthly_statistic_user", null);

  const budgets = Object.fromEntries(
    Object.entries(initialBudgetsRaw || {}).map(([k, b]) => [
      k,
      { ...b, ideal_amount: Number(b.ideal_amount), transaction_type_id: Number(b.transaction_type_id) },
    ])
  );

  const subtransactions = (initialSubtransactionsRaw || []).map((st) => ({
    ...st,
    is_initial: true,
    transaction_type_id: Number(st.transaction_type_id),
    ideal_amount: Number(st.ideal_amount),
  }));

  const userPrefill = {
    name: params.get("name") || "",
    email: params.get("email") || "",
    salary_day: params.get("salary_day") || "",
    telegram_user_id: params.get("telegram_user_id") || "",
  };

  // ✅ Normalize stats into chart-friendly shapes
  const monthlyStatistics = monthlyStatisticUserRaw
  ? {
      ...monthlyStatisticUserRaw,

      month_totals_by_type_arr: dictToArray(
        monthlyStatisticUserRaw.month_totals_by_type,
        "type",
        "total"
      ),

      month_income_by_subcategory_arr: pairsOrObjectsToArray(
        monthlyStatisticUserRaw.month_income_by_subcategory,
        "subcategory",
        "total"
      ),

      month_expenses_by_subcategory_arr: pairsOrObjectsToArray(
        monthlyStatisticUserRaw.month_expenses_by_subcategory,
        "subcategory",
        "total"
      ),

      // normalize this too
      month_savings_by_subcategory_arr: (monthlyStatisticUserRaw.month_savings_by_subcategory || []).map((r) => ({
        month: r.month,
        type: r.type_name,
        tracked: Number(r.tracked ?? 0),
        budget: Number(r.budget ?? 0),
      })),
    }
  : null;

  return {
    urlAction,
    salary_day_end,
    userPrefill,
    budgets,
    subtransactions,
    initialTransactions,
    transactionSubcategories,
    monthlyStatistics, // ✅ expose
  };
}
