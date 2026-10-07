// Runs `npm run dev -- --port <port> --strictPort` inside a design-variant
// checkout, with node's own directory on PATH (the preview shell has no
// node/npm on PATH). The variants are git worktrees on design/<name> branches,
// kept OUTSIDE OneDrive at %USERPROFILE%\acs-variants\<name> — no sync churn,
// no brackets in the path for Codex's shells (root CLAUDE.md, Rule 0 trap 2).
// Resolved from the home directory, never hardcoded (root CLAUDE.md, Rule 1).
// Usage: node .claude/variant-dev.cjs <name> <port>
const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");
const [name, port] = process.argv.slice(2);
if (!name || !port) {
  console.error("usage: node .claude/variant-dev.cjs <variant-name> <port>");
  process.exit(2);
}
const dir = path.join(os.homedir(), "acs-variants", name);
if (!fs.existsSync(path.join(dir, "package.json"))) {
  console.error(`no variant checkout at ${dir} (expected a git worktree on design/${name})`);
  process.exit(2);
}
const nodeDir = path.dirname(process.execPath);
process.env.PATH = nodeDir + path.delimiter + (process.env.PATH || "");
const npmCli = path.join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js");
const child = spawn(process.execPath, [npmCli, "run", "dev", "--", "--port", port, "--strictPort"], {
  cwd: dir,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code == null ? 1 : code));
