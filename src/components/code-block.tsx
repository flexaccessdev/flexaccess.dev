import { CopyButton } from "./copy-button";

interface CodeBlockProps {
  code: string;
  /** Soft-wrap long single lines instead of scrolling (used for one-line installs). */
  wrap?: boolean;
  /** Optional title bar (file name, platform, shell). The copy button lives there when present. */
  title?: string;
  /** Hide the copy button, for illustrative output. */
  noCopy?: boolean;
}

export function CodeBlock({ code, wrap = false, title, noCopy = false }: CodeBlockProps) {
  const copy = noCopy ? null : <CopyButton text={code} />;
  return (
    <div className={`code-block${wrap ? " code-block-wrap" : ""}`}>
      {title ? (
        <div className="code-block-title">
          <span>{title}</span>
          {copy}
        </div>
      ) : null}
      <div className="code-block-body">
        <pre>
          <code>{code}</code>
        </pre>
        {title ? null : copy}
      </div>
    </div>
  );
}
