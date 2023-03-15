import { Token } from "./tokenizer";

export type AST =
  | {
      type: "assign";
      mutable: boolean;
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
      autoRun: boolean;
    }
  | {
      type: "if";
      condition: AST;
      ifBranch: AST;
      elseBranch?: AST;
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

  const currentToken = () => input[index];

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
          {
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
  ): AST[] => {
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

  const parseId = () => {
    return input[index++] as AST;
  };

  /*
  valid: 
    { a -> f() } 
    { a, b -> f() }
    { -> f() }
    { a, b -> }
  */

  const parseAssignment = (): AST => {
    const assignType = currentToken().value as "val" | "var";
    next();
    const mutable = assignType === "var";
    return {
      type: "assign",
      operator: "=",
      left: parseId(),
      right: (skip("assign", "="), parseExpression()),
      mutable,
    };
  };

  const parseLambda = (): AST => {
    if (accepts("punctuation", "!")) {
      next();
      return {
        type: "function",
        params: [],
        body: delimited("{", "}", ";", parseExpression),
        autoRun: true,
      };
    }
    skip("punctuation", "{");
    const params: AST[] = [];
    while (!done() && currentToken().type === "id") {
      params.push(parseId());
      if (accepts("punctuation", ",")) {
        next();
      } else {
        break;
      }
    }
    skip("operator", "->");
    const body: AST[] = [];
    while (!done() && !accepts("punctuation", "}")) {
      body.push(parseExpression());
      if (accepts("punctuation", ";")) {
        next();
      } else {
        break;
      }
    }
    skip("punctuation", "}");
    return {
      type: "function",
      params,
      body,
      autoRun: false,
    };
  };

  const parseIf = (): AST => {
    skip("keyword", "if");
    const condition = parseExpression();
    const ifBranch: AST = {
      type: "function",
      params: [],
      body: accepts("punctuation", "{")
        ? delimited("{", "}", ";", parseExpression)
        : [parseExpression()],
      autoRun: true,
    };
    const elseBranch: AST | undefined = accepts("keyword", "else")
      ? (next(),
        {
          type: "function",
          params: [],
          body: accepts("punctuation", "{")
            ? delimited("{", "}", ";", parseExpression)
            : [parseExpression()],
          autoRun: true,
        })
      : undefined;
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

      if (accepts("keyword", "val") || accepts("keyword", "var"))
        return parseAssignment();

      if (accepts("punctuation", "!") && input[index + 1].value === "{")
        return parseLambda();

      if (accepts("punctuation", "{")) return parseLambda();
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

      throw new Error(`syntax error: ${token.type} "${token.value}"`);
    });
  };

  const parseExpression = (): AST =>
    maybeCall(() => maybeBinary(parseAtom(), 0));

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

  return parseTopLevel();
};
