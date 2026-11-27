import { Download } from "lucide-react";
import type { AppDownload, InstallCommand } from "../data";
import { CodeBlock } from "./code-block";

function CommandItem({ item }: { item: InstallCommand }) {
  return (
    <div className="install">
      <CodeBlock code={item.command} title={item.label} wrap />
      {item.note ? <p className="install-hint">{item.note}</p> : null}
    </div>
  );
}

function DownloadItem({ item }: { item: AppDownload }) {
  return (
    <div className="install">
      <div className="download-card">
        <div className="code-block-title">
          <span>{item.label}</span>
        </div>
        <div className="download-card-body">
          <a href={item.href} className="button">
            <Download aria-hidden="true" />
            Download from GitHub
          </a>
          <code className="download-file">{item.file}</code>
        </div>
      </div>
      {item.note ? <p className="install-hint">{item.note}</p> : null}
    </div>
  );
}

export function InstallBlock({
  commands,
  downloads = [],
}: {
  commands: InstallCommand[];
  downloads?: AppDownload[];
}) {
  const count = commands.length + downloads.length;
  return (
    <div className={`install-grid${count === 3 ? " install-grid-3" : ""}`}>
      {commands.map((item) => (
        <CommandItem key={item.label} item={item} />
      ))}
      {downloads.map((item) => (
        <DownloadItem key={item.label} item={item} />
      ))}
    </div>
  );
}
