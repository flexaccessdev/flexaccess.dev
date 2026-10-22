import type { InstallCommand } from "../data";
import { CodeBlock } from "./code-block";

export function InstallBlock({ commands }: { commands: InstallCommand[] }) {
  return (
    <div className="install-grid">
      {commands.map((item) => (
        <div key={item.label} className="install">
          <CodeBlock code={item.command} title={item.label} wrap />
          {item.note ? <p className="install-hint">{item.note}</p> : null}
        </div>
      ))}
    </div>
  );
}
