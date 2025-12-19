export function logDebug(msg) {
  const el = document.getElementById("debug-log");
  if (el) el.innerText += String(msg) + "\n";
  console.log(msg);
}
