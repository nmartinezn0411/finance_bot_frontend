import { useEffect, useState } from "react";
// Debug Functions
import { logDebug } from "./utils/debug";
import { DebugPanel } from "./utils/debug";

// Constants
import { getTransactionTypeLabel } from "./utils/constants";

// Functions
import { badgeClassByType } from "./utils/functions";

// Helper function for the app.jsx
import { TransactionCard } from "./user_info/cards";

const normalizeName = (name) =>
  name?.trim().toLowerCase();

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h5 className="mb-1">{title}</h5>
      {subtitle ? <div className="text-body-secondary small">{subtitle}</div> : null}
    </div>
  );
}

function upsertOp(ops, nextOp, keyField) {
  const idx = ops.findIndex((o) => o.op === nextOp.op && o[keyField] === nextOp[keyField]);
  if (idx === -1) return [...ops, nextOp];
  const copy = ops.slice();
  copy[idx] = nextOp;
  return copy;
}

function removeOps(ops, predicate) {
  return ops.filter((o) => !predicate(o));
}

function App() {
  const [tg, setTg] = useState(null);

  // Form Error useState 
  const [formErrors, setFormErrors] = useState([]);


  // Users
  const [userForm, setUserForm] = useState({
    name: "",
    telegram_user_id: "",
    email: "",
    salary_day: "",
  });

  // Delete state variable
  const [confirmDelete, setConfirmDelete] = useState(false);

  // 1) Read prefill data from URL query params
  const params = new URLSearchParams(window.location.search);
  logDebug(params);

  const urlName = params.get("name") || "";
  const urlEmail = params.get("email") || "";
  const urlSalaryDay = params.get("salary_day") || "";
  const urlTelegramUserID = params.get("telegram_user_id") || "";
  const salary_day_end = params.get("salary_day_end") || "";
  const urlAction = params.get("action") || "";// action of the form
  const initialTransactions = JSON.parse(params.get("initial_transactions") || "[]");
  const transactionSubcategories = JSON.parse(
    params.get("initial_db_subcategories") || "[]"
  );

  // INITIAL_BUDGETS
  const [budgets, setBudgets] = useState(() => {
    const raw = params.get("initial_budgets");
    try {
      const parsed = JSON.parse(raw);
      return Object.fromEntries(
        Object.entries(parsed).map(([k, b]) => [
          k,
          {
            ...b,
            ideal_amount: Number(b.ideal_amount),
            transaction_type_id: Number(b.transaction_type_id),
          },
        ])
      );
    } catch (e) {
      console.error("Error parsing initial_budgets:", e, raw);
      return {};
    }
  });

  // Subtransactions_Types
  const [subtransactions, setSubtransactions] = useState(() => {
    const raw = params.get("initial_subtransactions");
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);

      // 🔒 Estas son las que vinieron “iniciales” en la URL
      return parsed.map((st) => ({
        ...st,
        is_initial: true, // <--- NUEVO
        transaction_type_id: Number(st.transaction_type_id),
        ideal_amount: Number(st.ideal_amount),
      }));
    } catch (e) {
      console.error("Error parsing initial_subtransactions:", e, raw);
      return [];
    }
  });

  const normalizedNames = subtransactions.map((st) =>
    normalizeName(st.name)
  );

  const duplicatedNames = normalizedNames.filter(
    (name, index) =>
      name &&
      normalizedNames.indexOf(name) !== index
  );

  const hasDuplicateNames = duplicatedNames.length > 0;

  // Set transactions
  const [transactions, setTransactions] = useState(() => initialTransactions);

  // ops list that will be sent to backend
  const [transactionsOps, setTransactionsOps] = useState([]);

  // draft for create
  const [txDraft, setTxDraft] = useState({
    transaction_subcategory_id: "",
    amount: "",
    transaction_date: "", // optional
    description: "",
    raw_text: "",
  });

  // --- Transactions handlers (MUST be inside App) ---
  const handleTxAdd = () => {
    const client_id = `tmp-${Date.now()}`;
    const payload = {
      client_id,
      transaction_subcategory_id: Number(txDraft.transaction_subcategory_id),
      amount: Number(txDraft.amount),
      transaction_date: txDraft.transaction_date || null,
      description: txDraft.description || null,
      raw_text: txDraft.raw_text || null,
    };

    setTransactions((prev) => [
      {
        id: null,
        ...payload,
        date: payload.transaction_date,
        subcategory_id: payload.transaction_subcategory_id,
      },
      ...prev,
    ]);

    setTransactionsOps((prev) => [...prev, { op: "create", ...payload }]);

    setTxDraft({
      transaction_subcategory_id: "",
      amount: "",
      transaction_date: "",
      description: "",
      raw_text: "",
    });
  };

  const handleTxUpdate = (transaction_id, patch) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === transaction_id ? { ...t, ...patch } : t))
    );

    setTransactionsOps((prev) =>
      upsertOp(prev, { op: "update", transaction_id, ...patch }, "transaction_id")
    );
  };

  const handleTxDelete = (row) => {
    setTransactions((prev) => prev.filter((t) => t !== row));

    setTransactionsOps((prev) => {
      // deleting a temp tx => remove its create op
      if (row.id == null && row.client_id) {
        return removeOps(prev, (o) => o.op === "create" && o.client_id === row.client_id);
      }
      // deleting existing => remove pending update, upsert delete
      let next = removeOps(prev, (o) => o.op === "update" && o.transaction_id === row.id);
      next = upsertOp(next, { op: "delete", transaction_id: row.id }, "transaction_id");
      return next;
    });
  };

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    logDebug("webApp : " + JSON.stringify(webApp));

    // 2) Prefill the form
    setUserForm((prev) => ({
      ...prev,
      name: urlName || prev.name,
      email: urlEmail || prev.email,
      salary_day: urlSalaryDay || prev.salary_day,
      telegram_user_id: urlTelegramUserID || prev.telegram_user_id,
    }));

    // 3) Check Telegram Apps
    if (!webApp) {
      console.log("Not running inside Telegram WebApp");
      return;
    }
    webApp.ready();
    webApp.expand();
    setTg(webApp);
  }, []);

  // Handlers para Users
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handlers para Budgets (solo ideal_amount)
  const handleBudgetAmountChange = (budgetKey, value) => {
    setBudgets((prev) => ({
      ...prev,
      [budgetKey]: {
        ...prev[budgetKey],
        ideal_amount: value === "" ? "" : Number(value),
      },
    }));
  };

  // Handlers para Subtransactions
  const handleSubtransactionChange = (index, field, value) => {
    setSubtransactions((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]:
          field === "transaction_type_id" || field === "ideal_amount"
            ? value === ""
              ? ""
              : Number(value)
            : value,
      };
      return copy;
    });
  };

  const handleAddSubtransaction = () => {
    setSubtransactions((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        transaction_type_id: -1,
        ideal_amount: 0,
        is_initial: false, // opcional pero recomendado
      },
    ]);
  };

  const handleRemoveSubtransaction = (index) => {
    setSubtransactions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteUser = () => {
    const webApp = window.Telegram?.WebApp;
    if (!tg || !webApp) return;

    const payload = {
      action: "delete_user",
      telegram_user_id: userForm.telegram_user_id,
    };

    logDebug("SENDING DELETE PAYLOAD: " + JSON.stringify(payload, null, 2));
    webApp.sendData(JSON.stringify(payload));
    webApp.close();
  };

  const handleSubmit = () => {
    const webApp = window.Telegram?.WebApp;
    if (!tg || !webApp) return;

    const errors = [];

    if (!userForm.name.trim()) errors.push("El nombre es obligatorio.");
    if (!userForm.email.includes("@"))
      errors.push("El correo no es válido, debe contener '@'.");

    const salaryDayNum = Number(userForm.salary_day);
    logDebug(salary_day_end);

    if (
      !Number.isInteger(salaryDayNum) ||
      salaryDayNum < 1 ||
      salaryDayNum > Number(salary_day_end)
    ) {
      errors.push(
        `El campo 'salary day' debe ser un número entero entre 1 y ${salary_day_end}.`
      );
    }

    Object.entries(budgets).forEach(([key, budget]) => {
      const val = Number(budget.ideal_amount);
      if (isNaN(val) || val <= 0) {
        errors.push(`El monto ideal del budget "${key}" debe ser un número positivo.`);
      }
    });

    subtransactions.forEach((st, index) => {
      const val = Number(st.ideal_amount);
      if (isNaN(val) || val <= 0) {
        errors.push(
          `El monto ideal de la subtransacción #${index + 1} debe ser un número positivo.`
        );
      }
    });

    // ✅ OPTIONAL: validate transaction ops too (only if edit mode)
    if (urlAction === "edit") {
      transactionsOps.forEach((op, i) => {
        if (op.op === "create") {
          if (!op.transaction_subcategory_id) {
            errors.push(`Transacción nueva #${i + 1}: falta subcategoría.`);
          }
          const amt = Number(op.amount);
          if (isNaN(amt) || amt <= 0) {
            errors.push(`Transacción nueva #${i + 1}: monto inválido.`);
          }
        }
        if (op.op === "update") {
          // if user edited amount, ensure positive
          if (op.amount != null) {
            const amt = Number(op.amount);
            if (isNaN(amt) || amt <= 0) {
              errors.push(`Editar transacción #${i + 1}: monto inválido.`);
            }
          }
        }
      });
    }

    


    if (errors.length > 0) {
      setFormErrors(errors);
      logDebug("VALIDATION ERRORS:\n" + errors.join("\n"));
      return;
    }

    // si todo está bien, limpia errores
    setFormErrors([]);

    const payload = {
      Users: {
        name: userForm.name,
        email: userForm.email,
        salary_day: salaryDayNum,
        telegram_user_id: userForm.telegram_user_id,
      },
      budgets: budgets,
      Subtransactions_Types: subtransactions,
      action: urlAction,
    };

    // ✅ HERE: attach TransactionsOps (only for edit mode)
    if (urlAction === "edit") {
      payload.TransactionsOps = transactionsOps; // 👈 this is the line you asked about
    }

    logDebug("SENDING PAYLOAD: " + JSON.stringify(payload, null, 2));
    webApp.sendData(JSON.stringify(payload));
    webApp.close();
  };

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex flex-column mb-3">
        <div>
        
          <h4 className="mb-0">
            {urlAction === "create new user"
              ? "Crear Usuario y Presupuestos"
              : urlAction === "create new month"
              ? "Creación de Presupuesto para Nuevo Mes"
              : urlAction === "edit"
              ? "Modificar Información y Presupuestos de usuario"
              : ""}
          </h4>

          <div className="text-body-secondary small">
            Completa tus datos, ajusta montos y envía al bot.
          </div>
        </div>
        <span className="badge text-bg-secondary mt-2 align-self-start">
          Día Máximo de Sueldo: {salary_day_end || "—"}
        </span>
      </div>

      {/* USERS */}
      <div className="card mb-3">
        <div className="card-body">
          <SectionTitle title="Datos del usuario" subtitle="Campos requeridos para crear tu perfil." />

          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Nombre Completo</label>
              <input
                className="form-control"
                name="name"
                placeholder="Full Name"
                value={userForm.name}
                onChange={handleUserChange}
              />
            </div>

            <div className="col-12">
              <label className="form-label">Correo</label>
              <input
                className="form-control"
                name="email"
                placeholder="Email"
                value={userForm.email}
                onChange={handleUserChange}
              />
              <div className="form-text">Debe contener @</div>
            </div>

            <div className="col-4">
              <label className="form-label">Día de Sueldo</label>
              <input
                className="form-control"
                type="number"
                name="salary_day"
                placeholder={`1-${salary_day_end || "31"}`}
                value={userForm.salary_day}
                onChange={handleUserChange}
              />
            </div>

            <div className="col-8">
              <label className="form-label">Telegram User ID (ONLY READ)</label>
              <input
                className="form-control"
                name="telegram_user_id"
                value={userForm.telegram_user_id}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>

      {/* BUDGETS */}
      <div className="card mb-3">
        <div className="card-body">
          <SectionTitle
            title="Presupuestos Generales"
            subtitle="Solo puedes editar el monto aproximado de cada presupuesto."
          />

          <div className="row g-3">
            {Object.entries(budgets || {}).map(([key, budget]) => (
              <div className="col-12" key={key}>
                <div className="border rounded p-3">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div>
                      <div className="fw-semibold">{budget.name}</div>
                      <div className="text-body-secondary small">
                        {budget.period_start} - {budget.period_end}
                      </div>
                    </div>

                    <span className={`badge ${badgeClassByType(budget.transaction_type_id)}`}>
                      {getTransactionTypeLabel(budget.transaction_type_id)}
                    </span>
                  </div>

                  <div className="mt-3">
                    <label className="form-label mb-1">Monto Aproximado</label>
                    <input
                      className="form-control"
                      type="number"
                      value={budget.ideal_amount}
                      onChange={(e) => handleBudgetAmountChange(key, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SUBTRANSACTIONS */}
      <div className="card mb-3">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <SectionTitle
              title="Tipo de Subtransacciones"
              subtitle="Máximo 5. Puedes agregar o eliminar."
            />
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleAddSubtransaction}
              disabled={subtransactions.length >= 7} // Amount of subtransactions allowed for an user
            >
              Add
            </button>
          </div>

          <div className="row g-3">
            {subtransactions.map((st, index) => {
              const isEditMode = urlAction === "edit";
              const isLocked = isEditMode && st.is_initial;

              const current = normalizeName(st.name);
              const isDuplicate = !!current && normalizedNames.indexOf(current) !== index;

              return (
                <div className="col-12" key={index}>
                  <div className="border rounded p-3">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <span className="fw-semibold">Tipo #{index + 1}</span>
                        <span className={`badge ${badgeClassByType(st.transaction_type_id)}`}>
                          {getTransactionTypeLabel(st.transaction_type_id)}
                        </span>

                        {isLocked && (
                          <span className="badge text-bg-secondary">Inicial</span>
                        )}
                      </div>

                      {subtransactions.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleRemoveSubtransaction(index)}
                          disabled={isLocked}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label">Nombre</label>
                        <input
                          className={`form-control ${isDuplicate ? "is-invalid" : ""}`}
                          value={st.name}
                          disabled={isLocked}
                          onChange={(e) =>
                            handleSubtransactionChange(index, "name", e.target.value)
                          }
                        />

                        {isDuplicate && (
                          <div className="invalid-feedback">
                            Este nombre ya existe en otra subtransacción.
                          </div>
                        )}
                      </div>

                      <div className="col-12">
                        <label className="form-label">Descripción</label>
                        <input
                          className="form-control"
                          value={st.description}
                          onChange={(e) =>
                            handleSubtransactionChange(index, "description", e.target.value)
                          }
                        />
                      </div>

                      <div className="col-6">
                        <label className="form-label">Tipo de Transacción</label>
                        <select
                          className="form-select"
                          value={st.transaction_type_id}
                          disabled={isLocked}
                          onChange={(e) =>
                            handleSubtransactionChange(
                              index,
                              "transaction_type_id",
                              Number(e.target.value)
                            )
                          }
                        >
                          <option value={-1}>Gasto</option>
                          <option value={0}>Ahorro</option>
                          <option value={1}>Ingreso</option>
                        </select>
                      </div>

                      <div className="col-6">
                        <label className="form-label">Monto Aproximado</label>
                        <input
                          className="form-control"
                          type="number"
                          value={st.ideal_amount}
                          onChange={(e) =>
                            handleSubtransactionChange(index, "ideal_amount", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {urlAction === "edit" && (
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between">
              <SectionTitle
                title="Transacciones del Mes"
                subtitle="CRUD local. Se guarda al enviar el formulario."
              />
              <span className="badge text-bg-secondary">
                Ops pendientes: {transactionsOps.length}
              </span>
            </div>

            {/* Create */}
            <div className="border rounded p-3 mb-3">
              <div className="fw-semibold mb-2">Agregar Transacción</div>

              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label">Subcategoría</label>
                  <select
                    className="form-select"
                    value={txDraft.transaction_subcategory_id}
                    onChange={(e) =>
                      setTxDraft((p) => ({ ...p, transaction_subcategory_id: e.target.value }))
                    }
                  >
                    <option value="">Select...</option>
                    {transactionSubcategories.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        {sc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-3">
                  <label className="form-label">Monto</label>
                  <input
                    className="form-control"
                    type="number"
                    value={txDraft.amount}
                    onChange={(e) => setTxDraft((p) => ({ ...p, amount: e.target.value }))}
                  />
                </div>

                <div className="col-12 col-md-5">
                  <label className="form-label">Fecha (opcional)</label>
                  <input
                    className="form-control"
                    type="date"
                    value={txDraft.transaction_date}
                    onChange={(e) =>
                      setTxDraft((p) => ({ ...p, transaction_date: e.target.value }))
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Descripción</label>
                  <input
                    className="form-control"
                    value={txDraft.description}
                    onChange={(e) =>
                      setTxDraft((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Raw text</label>
                  <input
                    className="form-control"
                    value={txDraft.raw_text}
                    onChange={(e) =>
                      setTxDraft((p) => ({ ...p, raw_text: e.target.value }))
                    }
                  />
                </div>

                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    disabled={!txDraft.transaction_subcategory_id || !Number(txDraft.amount)}
                    onClick={handleTxAdd}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* List (CARDS) */}
            <div className="row g-3">
              {transactions.map((tx, index) => (
                <TransactionCard
                  key={tx.id ?? tx.client_id ?? index}
                  tx={tx}
                  subcategories={transactionSubcategories}
                  onUpdate={handleTxUpdate}
                  onDelete={handleTxDelete}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Errors */}
      {formErrors.length > 0 && (
        <div className="alert alert-danger">
          <h6 className="alert-heading mb-2">Por favor corrige los siguientes errores:</h6>
          <ul className="mb-0">
            {formErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {urlAction === "edit" && (
        <div className="card mb-3 border-danger">
          <div className="card-body">
            <SectionTitle
              title="Zona de peligro"
              subtitle="Eliminar tu cuenta borrará tus presupuestos, categorías y transacciones (acción irreversible)."
            />

            {!confirmDelete ? (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => setConfirmDelete(true)}
              >
                Eliminar cuenta
              </button>
            ) : (
              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteUser()}
                >
                  Sí, eliminar definitivamente
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancelar
                </button>
              </div>
            )}

            <div className="form-text mt-2">
              Esta acción no se puede deshacer.
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT */}
      <div className="d-grid gap-2">
        <button 
          className="btn btn-primary btn-lg" 
          onClick={handleSubmit}
          disabled={hasDuplicateNames}
          >
          Enviar
        </button>
        <div className="text-body-secondary small">
          Al enviar, se manda la data a Telegram Finance Bot y se cierra el WebApp Form.
        </div>
      </div>

      <DebugPanel />
    </div>
  );
}

export default App;