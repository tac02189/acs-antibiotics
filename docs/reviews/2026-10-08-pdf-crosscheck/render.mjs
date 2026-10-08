// Render PDF pages/crops to PNG through headless Chrome over the DevTools protocol (no dependencies).
import http from "node:http"; import fs from "node:fs"; import path from "node:path"; import { spawn } from "node:child_process"; import os from "node:os";
const [www, outDir, chrome] = process.argv.slice(2);
const types = { ".html": "text/html", ".mjs": "text/javascript", ".pdf": "application/pdf" };
const server = http.createServer((req, res) => {
  const f = path.join(www, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!f.startsWith(www) || !fs.existsSync(f)) { res.writeHead(404).end(); return; }
  res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }).end(fs.readFileSync(f));
}).listen(0, "127.0.0.1");
await new Promise((r) => server.once("listening", r));
const base = `http://127.0.0.1:${server.address().port}/render.html`;
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "xcheck-chrome-"));
const proc = spawn(chrome, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "about:blank"], { stdio: "ignore" });
let portFile = path.join(profile, "DevToolsActivePort"), t0 = Date.now();
while (!fs.existsSync(portFile)) { if (Date.now() - t0 > 20000) throw new Error("chrome did not start"); await new Promise((r) => setTimeout(r, 200)); }
const [port, wsPath] = fs.readFileSync(portFile, "utf8").trim().split("\n");
const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}, sessionId) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
const { result: { targetId } } = await send("Target.createTarget", { url: "about:blank" });
const { result: { sessionId } } = await send("Target.attachToTarget", { targetId, flatten: true });
const evalJs = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true }, sessionId)).result.result.value;
const jobs = JSON.parse(fs.readFileSync(path.join(outDir, "jobs.json"), "utf8"));
for (const j of jobs) {
  const url = `${base}?page=${j.page}&scale=${j.scale}${j.crop ? "&crop=" + j.crop.join(",") : ""}`;
  await send("Page.navigate", { url }, sessionId);
  let title = ""; t0 = Date.now();
  while (!/^(done|error)/.test(title)) { if (Date.now() - t0 > 30000) { title = "timeout"; break; } await new Promise((r) => setTimeout(r, 150)); title = (await evalJs("document.title")) || ""; }
  if (title !== "done") { console.log(j.name, title); continue; }
  const data = await evalJs("document.getElementById('c').toDataURL('image/png')");
  fs.writeFileSync(path.join(outDir, j.name + ".png"), Buffer.from(data.split(",")[1], "base64"));
  const dims = await evalJs("[document.getElementById('c').width, document.getElementById('c').height].join('x')");
  console.log(j.name, dims);
}
ws.close(); proc.kill(); server.close();
