export function badgeClassByType(typeId) {
  // -1 gasto, 0 ahorro, 1 ingreso
  if (typeId === 1) return "bg-success";
  if (typeId === 0) return "bg-primary";
  return "bg-danger";
}