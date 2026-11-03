import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { pathToFileURL } from "node:url";
export function compileUI(output, files) {
  for (const file of files) {
    const destination = path.join(output, file.replace(/\.tsx?$/, ".js"));
    let code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText;
    code = code.replace(
      /(from\s+["'])(\.[^"']+)(["'])/g,
      (_, a, b, c) => `${a}${b.endsWith(".js") ? b : b + ".js"}${c}`,
    );
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, code);
  }
  return (relative) =>
    import(pathToFileURL(path.resolve(output, relative)).href);
}
