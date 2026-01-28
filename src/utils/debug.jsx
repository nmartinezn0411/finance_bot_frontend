// Log Debug Function
export function logDebug(msg) {
  const el = document.getElementById("debug-log");
  if (el) el.innerText += String(msg) + "\n";
  console.log(msg);
}

// Log DebugPanel function
export function DebugPanel() {
  return (
    <div className="card mt-4">
      <div className="card-header py-2">
        <strong className="small">Debug</strong>
      </div>
      <div
        id="debug-log"
        className="card-body font-monospace small bg-dark text-success"
        style={{ height: 320, overflowY: "auto", whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}