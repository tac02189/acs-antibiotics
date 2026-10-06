// Runs `npm run dev -- --port <port> --strictPort` inside design-variants/<name>,
// with node's own directory on PATH (the preview shell has no node/npm on PATH).
// Usage: node .claude/variant-dev.cjs <name> <port>
const path = require("path");
const { spawn } = require("child_process");
const [name, port] = process.argv.slice(2);
if (!name || !port) {
  console.error("usage: node .claude/variant-dev.cjs <variant-name> <port>");
  process.exit(2);
}
const dir = path.resolve(__dirname, "..", "design-variants", name);
const nodeDir = path.dirname(process.execPath);
process.env.PATH = nodeDir + path.delimiter + (process.env.PATH || "");
const npmCli = path.join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js");
const child = spawn(process.execPath, [npmCli, "run", "dev", "--", "--port", port, "--strictPort"], {
  cwd: dir,
  stdio: "inherit",
});
child.on("exit", (code) => process.exit(code == null ? 1 : code));
