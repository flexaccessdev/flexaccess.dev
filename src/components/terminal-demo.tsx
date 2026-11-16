import { useEffect, useRef, useState } from "react";
import "asciinema-player/dist/bundle/asciinema-player.css";
import type { ProductDemo } from "../data";

// Cell metrics of the player's terminal: IBM Plex Mono advances 0.6em per
// column and the player's default line height is 4/3. Used only to reserve
// roughly the right space before the player mounts.
const TERMINAL_FONT = '"IBM Plex Mono"';
const CELL_WIDTH_EM = 0.6;
const LINE_HEIGHT_EM = 4 / 3;

/**
 * A terminal recording (asciicast), played by a self-hosted asciinema-player.
 * The player is a client-only module with a WASM terminal inside, so it is
 * imported on demand, once the frame is near the viewport; the prerendered
 * HTML carries a placeholder of the same shape.
 */
export function TerminalDemo({ demo }: { demo: ProductDemo }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"pending" | "ready" | "failed">("pending");

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    let player: { dispose(): void } | undefined;

    const load = async () => {
      try {
        // The player measures its font once, when it mounts: have the web font
        // in by then, or the terminal is sized for the fallback's metrics.
        const [AsciinemaPlayer] = await Promise.all([
          import("asciinema-player"),
          document.fonts.load(`1em ${TERMINAL_FONT}`).catch(() => undefined),
        ]);
        if (cancelled) return;
        player = AsciinemaPlayer.create(demo.src, mount, {
          cols: demo.cols,
          rows: demo.rows,
          poster: demo.poster,
          // Waits on a download or a handshake are real, but nobody needs to
          // sit through them.
          idleTimeLimit: 2,
          fit: "width",
          theme: "flexaccess",
          terminalFontFamily: `${TERMINAL_FONT}, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`,
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(mount);

    return () => {
      cancelled = true;
      observer.disconnect();
      player?.dispose();
    };
  }, [demo]);

  return (
    <figure className="demo">
      <div
        className="demo-frame"
        style={
          status === "ready"
            ? undefined
            : { aspectRatio: `${demo.cols * CELL_WIDTH_EM} / ${demo.rows * LINE_HEIGHT_EM}` }
        }
      >
        {/* The player owns this node's children; React renders none into it. */}
        <div ref={mountRef} className="demo-player" role="group" aria-label={demo.label} />
        {status === "ready" ? null : (
          <p className="demo-placeholder">
            {status === "failed" ? (
              <>
                The player could not load. <a href={demo.src}>Download the recording</a> and play
                it with <code>asciinema play</code>.
              </>
            ) : (
              "Loading the recording…"
            )}
          </p>
        )}
      </div>
      <figcaption className="demo-caption">{demo.caption}</figcaption>
    </figure>
  );
}
