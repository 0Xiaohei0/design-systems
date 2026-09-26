// Multi-page workspace: every .html under the repo is an entry point, so adding a
// design system under systems/ needs no config change. Dev serves them all from
// one server; the root portal links to each.
import { defineConfig } from "vite";
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const SKIP = new Set(["node_modules", "dist", ".git"]);

function findHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith(".")) {
      continue;
    }
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      findHtml(full, out);
    } else if (name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

// Rollup input keys become the output paths, so key on the repo-relative path
// minus the extension: systems/objekt/index.html -> systems/objekt/index.
const input = Object.fromEntries(
  findHtml(root).map((file) => [
    relative(root, file).replace(/\.html$/, "").split(sep).join("/"),
    file,
  ])
);

export default defineConfig({
  appType: "mpa",
  server: { open: "/" },
  build: { rollupOptions: { input } },
});
