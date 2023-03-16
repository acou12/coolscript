import { AST } from "./parser";
import { operators } from "./tokenizer";

export const prefix = `const native = eval;`;

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
        return `${js(tree.func)}(${tree.parameters.map(js).join(")(")})`;
      }
    case "function":
      const body = tree.body.map(js).join(",");
      if (tree.params.length > 0) {
        const prefix = tree.params
          .map((param) => `(${(param as { value: string }).value})=>(`)
          .join("");
        const suffix = tree.params.map(() => `)`).join("");
        return `${prefix}${body}${suffix}`;
      } else {
        return `()=>(${body})`;
      }
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

export const emit = (tree: AST[]) => tree.map(js).join(";") + ";";
