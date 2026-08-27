import type { InstallCommand } from "../data";

export function InstallBlock({ commands }: { commands: InstallCommand[] }) {
  return (
    <div className="install-grid">
      {commands.map((item) => (
        <div key={item.label} className="install">
          <span className="install-label">{item.label}</span>
          <pre className="install-cmd">
            <code>{item.command}</code>
          </pre>
          {item.note ? <p className="install-hint">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
