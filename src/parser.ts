import { Token } from "./tokenizer";

type Tree =
  | {
      type: "expression";
      children: Tree[];
    }
  | {
      type: "value";
      value: string;
    };

export const parse = (tokens: Token[]): Tree => {
  let index = 0;
  let currentTree: Tree = {
    type: "expression",
    children: [],
  };
  while (index < tokens.length) {
    const currentToken = tokens[index];
    if (currentToken.type === "parenthesis") {
      if (currentToken.value === ")") {
        throw new Error("closed parenthesis found before open");
      } else {
        let endingIndex = index + 1;
        let opens = 0;
        while (
          !(
            tokens[endingIndex].type === "parenthesis" &&
            tokens[endingIndex].value === ")" &&
            opens === 0
          )
        ) {
          if (tokens[endingIndex].type === "parenthesis") {
            if (tokens[endingIndex].value === "(") {
              opens++;
            } else {
              opens--;
            }
          }
          endingIndex++;
          if (endingIndex >= tokens.length) {
            throw new Error("parenthesis were not closed :/");
          }
        }
        const subTree = parse(tokens.slice(index + 1, endingIndex));
        currentTree.children.push(subTree);
        index = endingIndex;
      }
    } else {
      currentTree.children.push({
        type: "value",
        value: currentToken.value,
      });
    }
    index++;
  }
  if (currentTree.children.length === 1) {
    return currentTree.children[0];
  } else {
    return currentTree;
  }
};

export const toString = (tree: Tree, indentationLevel: number): string => {
  const indentation = `  `.repeat(indentationLevel);
  if (tree.type === "value") {
    return `${indentation}value(${tree.value})`;
  } else {
    return `${indentation}expression(\n${tree.children
      .map((child) => toString(child, indentationLevel + 1))
      .join("\n")}\n${indentation})`;
  }
};

export const calculate = (tree: Tree): number => {
  if (tree.type === "value") {
    return parseInt(tree.value);
  } else {
    const operator = tree.children[0];
    if (operator.type !== "value") {
      throw new Error("you can't start an expression with another expression!");
    }
    const f = {
      "+": (x: number, y: number) => x + y,
      "-": (x: number, y: number) => x - y,
      "/": (x: number, y: number) => x / y,
      "*": (x: number, y: number) => x * y,
    }[operator.value]!;
    return tree.children.slice(1).map(calculate).reduce(f);
  }
};
