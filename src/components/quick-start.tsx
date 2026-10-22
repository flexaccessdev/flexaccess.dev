import type { QuickStartStep } from "../data";
import { CodeBlock } from "./code-block";

export function QuickStart({ steps }: { steps: QuickStartStep[] }) {
  return (
    <ol className="quick-start">
      {steps.map((step, index) => (
        <li key={step.title} className="qs-step">
          <div className="qs-marker" aria-hidden="true">
            {index + 1}
          </div>
          <div className="qs-body">
            <h3 className="qs-title">{step.title}</h3>
            {step.body ? <p className="qs-text">{step.body}</p> : null}
            {step.code ? <CodeBlock code={step.code} title={step.codeTitle} /> : null}
            {step.aside ? <p className="qs-aside">{step.aside}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
