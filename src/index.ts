import * as fs from "fs/promises";
import { exit } from "process";
import { AST, parse } from "./parser";
import { operators, tokenize } from "./tokenizer";

fs.readFile("./src/index.cool").then((file) => {
  try {
    const tokens = tokenize(file.toString()).filter(
      ({ type }) => !["space", "comment"].includes(type)
    );
    const out = prefix + parse(tokens).map(js).join("\n");
    fs.writeFile("out.js", out);
  } catch (e: any) {
    console.log(e.message);
    exit(1);
  }
});

const prefix = `
const println = console.log;
`;

const js = (tree: AST): string => {
  switch (tree.type) {
    case "assign":
      return `let ${js(tree.left)}=${js(tree.right)}`;
    case "call":
      if (tree.func.type === "id" && operators.includes(tree.func.value)) {
        return `(${js(tree.parameters[0])} ${tree.func.value} ${js(
          tree.parameters[1]
        )})`;
      } else {
        return `${js(tree.func)}(${tree.parameters.map(js).join(",")})`;
      }
    case "function":
      return `(${tree.params.map(js).join(",")})=>{${tree.body
        .map(js)
        .map((x, i) => (i === tree.body.length - 1 ? `return ${x}` : x))
        .join(";")}}`;
    case "id":
      return tree.value;
    case "number":
      return tree.value;
    case "program":
      return `{${tree.prog.map(js).join(";")}}`;
    case "string":
      return `"${tree.value}"`;
    case "if":
      return `((${js(tree.condition)}) ? (${js(tree.ifBranch)}) : (${js(
        tree.elseBranch
      )}))`;
  }
};
