import { AST } from "./parser";
import { operators } from "./tokenizer";

const prefix = `
    const println = console.log;
    const native = eval;
`;

const js = (tree: AST): string => {
  switch (tree.type) {
    case "assign":
      return `${tree.mutable ? "let" : "const"} ${js(tree.left)}=${js(
        tree.right
      )}`;
    case "call":
      if (tree.func.type === "id" && operators.includes(tree.func.value)) {
        return `(${js(tree.parameters[0])} ${tree.func.value} ${js(
          tree.parameters[1]
        )})`;
      } else {
        return `${js(tree.func)}(${tree.parameters.map(js).join(",")})`;
      }
    case "function":
      return `(((${tree.params.map(js).join(",")})=>{${tree.body
        .map(js)
        .map((x, i) => (i === tree.body.length - 1 ? `return ${x}` : x))
        .join(";")}})${tree.autoRun ? `()` : ``})`;
    case "id":
      return tree.value;
    case "number":
      return tree.value;
    case "string":
      return `"${tree.value}"`;
    case "if":
      return `((${js(tree.condition)})?(${js(tree.ifBranch)}):${
        tree.elseBranch !== undefined ? `(${js(tree.elseBranch)})` : `(()=>{})`
      })`;
  }
};

export const emit = (tree: AST[]) => prefix + tree.map(js).join(";\n");