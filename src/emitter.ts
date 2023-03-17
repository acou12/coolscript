import { AST } from "./parser";

export const prefix = `const native = eval;`;

const nativeJsOperators = "+ - / * % == != > < >= <= =".split(" ");

const asciifyOperator = (operator: string) =>
  [...operator]
    .map((c) => ("A" <= c && c <= "z" ? c : "_" + c.charCodeAt(0) + "_"))
    .join("");

const js = (tree: AST): string => {
  switch (tree.type) {
    case "assign":
      return `${tree.mutable ? "let" : "const"} ${js(tree.left)}=${js(
        tree.right
      )}`;
    case "call":
      if (tree.func.type === "id") {
        if (nativeJsOperators.includes(tree.func.value)) {
          return `(${js(tree.parameters[0])} ${tree.func.value} ${js(
            tree.parameters[1]
          )})`;
        } else if (tree.func.value.endsWith("=")) {
          let switched = tree.func.value.startsWith("~");
          return js({
            type: "call",
            parameters: [
              tree.parameters[0],
              {
                type: "call",
                parameters: switched
                  ? [tree.parameters[1], tree.parameters[0]]
                  : [tree.parameters[0], tree.parameters[1]],
                func: {
                  type: "id",
                  value: tree.func.value.slice(switched ? 1 : 0, -1),
                },
              },
            ],
            func: { type: "id", value: "=" },
          });
        }
      }
      return `${js(tree.func)}(${tree.parameters.map(js).join(")(")})`;
    case "function":
      const body = tree.body.map(js).join(",");
      if (tree.params.length > 0) {
        const prefix = tree.params
          .map((param) => `(${(param as { value: string }).value})=>(`)
          .join("");
        const suffix = tree.params.map(() => `)`).join("");
        return `(${prefix}${body}${suffix})${tree.autoRun ? "()" : ""}`;
      } else {
        return `(()=>(${body}))${tree.autoRun ? "()" : ""}`;
      }
    case "id":
      return asciifyOperator(tree.value);
    case "number":
      return tree.value;
    case "string":
      return `"${tree.value}"`;
    case "if":
      return `((${js(tree.condition)})?(${js(tree.ifBranch)}):${
        tree.elseBranch !== undefined ? `(${js(tree.elseBranch)})` : `(()=>{})`
      })`;
    case "while":
      const whileBody = tree.body.map(js).join(",");
      return `while(${js(tree.condition)}){${
        whileBody === "" ? "" : `(${whileBody})`
      }}`;
    case "for":
      const forBody = tree.body.map(js).join(",");
      return `(()=>{for(${js(tree.id)} of ${js(tree.range)}){${
        forBody === "" ? "" : `(${forBody})`
      }}})()`;
    case "tuple":
      // todo: fix lol
      return `${tree.expressions.map(js).join(")(")}`;
    case "array":
      return `[${tree.elements.map(js).join(", ")}]`;
    case "die":
      return `throw new Error("die")`;
  }
};

export const emit = (tree: AST[]) => tree.map(js).join(";") + ";";
