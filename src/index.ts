import * as fs from "fs/promises";
import { parseExpression } from "./parser";
import { tokenize } from "./tokenizer";

fs.readFile("./src/index.cool").then((file) => {
  const tokens = tokenize(file.toString()).filter(
    ({ type }) => !["space", "comment"].includes(type)
  );
  const conversion = {
    "+": "add",
    "-": "subtract",
    "*": "multiply",
    "/": "divide",
  };
  const toString = (t: typeof tree.expression): string => {
    if (t.type === "function_call") {
      return `${
        conversion[t.function as keyof typeof conversion]
      }(${t.parameters.map(toString).join(", ")})`;
    } else if (t.type === "number_literal") {
      return `${t.value}`;
    } else if (t.type === "string_literal") {
      return `"${t.value}"`;
    }
    throw new Error();
  };
  const tree = parseExpression(tokens, 0);
  console.log(toString(tree.expression));
});
