import { useState } from "react";
import { getTransactionTypeLabel } from "../utils/constants";
import { badgeClassByType } from "../utils/functions";

export function TransactionCard({ tx, subcategories, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(tx.id == null); // new ones start in edit mode

  const [draft, setDraft] = useState({
    transaction_subcategory_id:
      tx.subcategory_id ?? tx.transaction_subcategory_id ?? "",
    amount: tx.amount ?? "",
    transaction_date: tx.date ?? tx.transaction_date ?? "",
    description: tx.description ?? "",
  });

  const selectedSubcat = subcategories.find(
    (s) => s.id === Number(draft.transaction_subcategory_id)
  );

  const typeId = selectedSubcat?.transaction_type_id; // -1/0/1 from your prefill
  const badgeClass = badgeClassByType(typeId ?? -1);

  const canSave = !!draft.transaction_subcategory_id && Number(draft.amount) > 0;

  return (
    <div className="col-12">
      <div className="border rounded p-3">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold">
              {tx.id ? `Transacción #${tx.id}` : "Nueva Transacción"}
            </span>

            {selectedSubcat && (
              <span className={`badge ${badgeClass}`}>
                {getTransactionTypeLabel(typeId)}
              </span>
            )}

            {tx.id == null && (
              <span className="badge text-bg-secondary">Pendiente</span>
            )}
          </div>

          <div className="d-flex gap-2">
            {tx.id != null && !isEditing && (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                Editar
              </button>
            )}

            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={() => onDelete(tx)}
            >
              {tx.id == null ? "Remover" : "Eliminar"}
            </button>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label">Fecha</label>
            <input
              className="form-control"
              type="date"
              disabled={!isEditing}
              value={draft.transaction_date || ""}
              onChange={(e) =>
                setDraft((p) => ({ ...p, transaction_date: e.target.value }))
              }
            />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Subcategoría</label>
            <select
              className="form-select"
              disabled={!isEditing}
              value={draft.transaction_subcategory_id}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  transaction_subcategory_id: e.target.value,
                }))
              }
            >
              <option value="">Select...</option>
              {subcategories.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name} ({getTransactionTypeLabel(sc.transaction_type_id)})
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-2">
            <label className="form-label">Monto</label>
            <input
              className="form-control"
              type="number"
              disabled={!isEditing}
              value={draft.amount}
              onChange={(e) => setDraft((p) => ({ ...p, amount: e.target.value }))}
            />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Descripción</label>
            <input
              className="form-control"
              disabled={!isEditing}
              value={draft.description}
              onChange={(e) =>
                setDraft((p) => ({ ...p, description: e.target.value }))
              }
            />
          </div>

          {isEditing && (
            <div className="col-12 d-flex gap-2">
              <button
                type="button"
                className="btn btn-success btn-sm"
                disabled={!canSave || tx.id == null} // updates only for existing
                onClick={() => {
                  onUpdate({ id: tx.id, client_id: tx.client_id }, {
                    transaction_subcategory_id: Number(draft.transaction_subcategory_id),
                    amount: Number(draft.amount),
                    transaction_date: draft.transaction_date || null,
                    description: draft.description || null,
                  });
                  setIsEditing(false);
                }}
              >
                Save
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>

              {tx.id == null && (
                <span className="text-body-secondary small align-self-center">
                  * Las nuevas se guardan al enviar el formulario.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
