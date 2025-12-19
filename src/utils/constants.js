export const TRANSACTION_TYPE_LABELS = {
  1: "Ingreso",
  "-1": "Gasto",
  0: "Ahorro",
};

export const getTransactionTypeLabel = (typeId) =>
  TRANSACTION_TYPE_LABELS[typeId] ?? "Desconocido";
