import { Token } from "./tokenizer";

export type AST =
  | {
      type: "program";
      prog: AST[];
    }
  | {
      type: "assign";
      operator: string;
      left: AST;
      right: AST;
    }
  | {
      type: "number";
      value: string;
    }
  | {
      type: "string";
      value: string;
    }
  | {
      type: "call";
      func: AST;
      parameters: AST[];
    }
  | {
      type: "id";
      value: string;
    }
  | {
      type: "function";
      params: AST[];
      body: AST[];
    }
  | {
      type: "if";
      condition: AST;
      ifBranch: AST;
      elseBranch: AST;
    };

const PRECEDENCE = {
  "=": 1,
  "||": 2,
  "&&": 3,
  "<": 4,
  ">": 4,
  "<=": 4,
  ">=": 4,
  "==": 4,
  "!=": 4,
  "+": 5,
  "-": 5,
  "*": 6,
  "/": 6,
  "%": 6,
};

export const parse = (input: Token[]) => {
  let index = 0;
  const done = () => index >= input.length;
  const accepts = (type: Token["type"], value: string) =>
    input[index].type === type && input[index].value === value;
  const expects = (type: Token["type"], value: string) => {
    if (!accepts(type, value)) {
      throw new Error(
        `expected ${type} "${value}", found ${input[index].type} "${input[index].value}"`
      );
    }
  };
  const next = () => {
    index++;
  };
  const skip = (type: Token["type"], value: string) => {
    expects(type, value);
    next();
  };
  const parseTopLevel = () => {
    const program: AST[] = [];
    while (!done()) {
      program.push(parseExpression());
      if (!done()) {
        skip("punctuation", ";");
      }
    }
    return program;
  };
  const maybeCall = (expr: () => AST): AST => {
    const evaluated = expr();
    return !done() && accepts("punctuation", "(")
      ? parseCall(evaluated)
      : evaluated;
  };
  const parseCall = (func: AST): AST => {
    return {
      type: "call",
      func,
      parameters: delimited("(", ")", ",", parseExpression),
    };
  };
  const maybeBinary = (left: AST, precedence: number): AST => {
    if (!done() && input[index].type === "operator") {
      const token = input[index];
      const otherPrecedence =
        PRECEDENCE[token.value as keyof typeof PRECEDENCE];
      if (otherPrecedence > precedence) {
        next();
        const right = maybeBinary(parseAtom(), otherPrecedence);
        return maybeBinary(
          token.value === "="
            ? {
                type: "assign",
                operator: token.value,
                left,
                right,
              }
            : {
                type: "call",
                func: {
                  type: "id",
                  value: token.value,
                },
                parameters: [left, right],
              },
          precedence
        );
      }
    }
    return left;
  };
  const delimited = (
    start: string,
    stop: string,
    seperator: string,
    parser: () => AST
  ) => {
    const asts: AST[] = [];
    let first = true;
    skip("punctuation", start);
    while (!done()) {
      if (accepts("punctuation", stop)) break;
      if (first) {
        first = false;
      } else {
        skip("punctuation", seperator);
      }
      if (accepts("punctuation", stop)) break;
      asts.push(parser());
    }
    skip("punctuation", stop);
    return asts;
  };
  const parseProgram = (): AST & { type: "program" } => ({
    type: "program",
    prog: delimited("{", "}", ";", parseExpression),
  });

  const parseLambda = (): AST => {
    skip("operator", "\\");
    const params = delimited("(", ")", "|", parseExpression);
    skip("operator", "->");
    let body;
    if (accepts("punctuation", "{")) {
      body = delimited("{", "}", ";", parseExpression);
    } else {
      body = [parseExpression()];
    }
    return {
      type: "function",
      params,
      body,
    };
  };

  const parseIf = (): AST => {
    skip("keyword", "if");
    const condition = parseExpression();
    skip("punctuation", ",");
    const ifBranch = parseExpression();
    skip("punctuation", ",");
    const elseBranch = parseExpression();
    return {
      type: "if",
      condition,
      ifBranch,
      elseBranch,
    };
  };

  const parseAtom = (): AST => {
    return maybeCall(() => {
      if (accepts("punctuation", "(")) {
        next();
        const expression = parseExpression();
        skip("punctuation", ")");
        return expression;
      }

      if (accepts("punctuation", "{")) return parseProgram();
      if (accepts("operator", "\\")) return parseLambda();
      if (accepts("keyword", "if")) return parseIf();
      const token = input[index];
      if (
        token.type === "id" ||
        token.type === "number" ||
        token.type === "string"
      ) {
        next();
        return {
          type: token.type,
          value: token.value,
        };
      }
      throw new Error(`token unrecognized: ${token.type} "${token.value}"`);
    });
  };
  const parseExpression = (): AST =>
    maybeCall(() => maybeBinary(parseAtom(), 0));

  return parseTopLevel();
};
