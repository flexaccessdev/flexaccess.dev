// Post-processes a demo recording made by record-ezvpn.sh (asciicast v2):
//
//   node scripts/demo/finish-cast.mjs <file.cast> [hold-seconds]
//
// 1. Cuts the recording where tmux leaves the alternate screen, so it ends on
//    the last frame of the demo rather than on a cleared "[server exited]"
//    screen, and holds that frame for a few seconds.
// 2. Fails if anything on screen looks like an address from outside the
//    private ranges (a host's public IPv4, a global IPv6, a CGNAT overlay
//    address). Nothing is redacted: a recording that shows one is rejected.
//
// The screen content itself is never altered.

import { readFileSync, writeFileSync } from "node:fs";

const [file, holdArg] = process.argv.slice(2);
if (!file) {
  console.error("usage: finish-cast.mjs <file.cast> [hold-seconds]");
  process.exit(2);
}
const hold = Number(holdArg ?? 4);

const lines = readFileSync(file, "utf8").split("\n").filter(Boolean);
const header = JSON.parse(lines[0]);
if (header.version !== 2) {
  console.error(`expected an asciicast v2 file, got version ${header.version}`);
  process.exit(2);
}

const LEAVE_ALT_SCREEN = "\u001b[?1049l";
const events = [];
for (const line of lines.slice(1)) {
  const event = JSON.parse(line);
  if (event[1] !== "o") continue;
  // tmux resets the terminal (scroll region, modes, clear) in the same write
  // that leaves the alternate screen, so the whole event goes.
  if (event[2].includes(LEAVE_ALT_SCREEN)) break;
  events.push(event);
}
if (events.length === 0) {
  console.error("recording has no output");
  process.exit(1);
}

const screenText = events
  .map((event) => event[2])
  .join("")
  // CSI, OSC and two-character escape sequences
  .replace(/\u001b\[[0-9;?]*[ -\/]*[@-~]/g, "")
  .replace(/\u001b\][^\u0007\u001b]*(\u0007|\u001b\\)/g, "")
  .replace(/\u001b[()][0-9A-Za-z]/g, "")
  .replace(/\u001b./g, "");
// A long line wraps at the pane edge, so also look with line breaks removed.
const haystacks = [screenText, screenText.replace(/[\r\n]+/g, "")];

const PRIVATE_V4 = /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|0\.0\.)/;
const leaks = new Set();
for (const text of haystacks) {
  for (const [addr] of text.matchAll(/(?<![\d.])(\d{1,3}\.){3}\d{1,3}(?![\d.])/g)) {
    if (!PRIVATE_V4.test(addr)) leaks.add(addr);
  }
  for (const [addr] of text.matchAll(/(?<![0-9a-f:])([0-9a-f]{1,4}:){3,}[0-9a-f:]*/gi)) {
    leaks.add(addr);
  }
}
if (leaks.size > 0) {
  console.error("recording shows non-private addresses:");
  for (const addr of leaks) console.error(`  ${addr}`);
  process.exit(1);
}

const end = events[events.length - 1][0] + hold;
events.push([Number(end.toFixed(6)), "o", ""]);
writeFileSync(
  file,
  [JSON.stringify(header), ...events.map((event) => JSON.stringify(event))].join("\n") + "\n",
);
console.log(`${file}: ${events.length} events, ${end.toFixed(1)}s`);
