// Draws the renderer's subject graph (which `features/<subject>` imports which); fails on a ring between subjects or on
// `project` importing any subject. Specs are excluded.
const fs = require("node:fs");
const path = require("node:path");

const RENDERER = path.join("src", "app", "renderer");
const FEATURES = path.join(RENDERER, "features");
const LEAF = "project";

/** The subject a file belongs to, or `null` outside `features/`. */
function subjectOf(file) {
  const relative = path.relative(FEATURES, file);

  if (relative.startsWith("..")) {
    return null;
  }

  const [subject] = relative.split(path.sep);

  return subject;
}

/** Every `.ts`/`.tsx` under `directory` that is not a spec. */
function sourceFiles(directory) {
  const files = [];

  for (const name of fs.readdirSync(directory)) {
    const file = path.join(directory, name);

    if (fs.statSync(file).isDirectory()) {
      files.push(...sourceFiles(file));

      continue;
    }

    if (/\.tsx?$/.test(name) && !/\.spec\.tsx?$/.test(name)) {
      files.push(file);
    }
  }

  return files;
}

/** The subject edges one file draws: from its subject to each other subject it imports. */
function edgesOf(file) {
  const from = subjectOf(file);
  const text = fs.readFileSync(file, "utf8");
  const edges = new Set();

  for (const match of text.matchAll(/from "(\.[^"]+)"/g)) {
    const to = subjectOf(path.normalize(path.join(path.dirname(file), match[1])));

    if (from !== null && to !== null && to !== from) {
      edges.add(`${from} -> ${to}`);
    }
  }

  return [...edges];
}

const edges = new Set(sourceFiles(FEATURES).flatMap(edgesOf));
const rings = [...edges].filter((edge) => {
  const [from, to] = edge.split(" -> ");

  return from < to && edges.has(`${to} -> ${from}`);
});
const fromLeaf = [...edges].filter((edge) => edge.startsWith(`${LEAF} -> `));

for (const edge of [...edges].sort()) {
  console.log(edge);
}

if (rings.length > 0) {
  console.error(`\nRings between subjects: ${rings.join(", ")}`);
}

if (fromLeaf.length > 0) {
  console.error(`\n\`${LEAF}\` imports a subject: ${fromLeaf.join(", ")}`);
}

process.exit(rings.length + fromLeaf.length > 0 ? 1 : 0);
