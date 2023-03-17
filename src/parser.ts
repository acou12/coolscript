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
    }
  | {
      type: "tuple";
      expressions: AST[];
    }
  | {
      type: "array";
      elements: AST[];
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
        `expected ${type} "${value}", found ${input[index].type} "${input[index].value}" at ${index}`
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

  const maybeBinary = (left: AST, precedence: number): AST => {
    if (!done() && input[index].type === "operator") {
      const token = input[index];
      const otherPrecedence =
        PRECEDENCE[token.value as keyof typeof PRECEDENCE];
      if (otherPrecedence > precedence) {
        next();
        const right = maybeBinary(parseCallableAtom(), otherPrecedence);
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

    const id = parseId();

    if (accepts("assign", "=")) {
      skip("assign", "=");
      const expression = parseExpression();
      return {
        type: "assign",
        operator: "=",
        left: id,
        right: expression,
        mutable,
      };
    } else if (accepts("punctuation", "(")) {
      const params = delimited("(", ")", ",", parseId);
      skip("assign", "=");
      return {
        type: "assign",
        operator: "=",
        left: id,
        right: {
          type: "function",
          autoRun: false,
          body: accepts("punctuation", "{")
            ? delimited("{", "}", ";", parseExpression)
            : [parseExpression()],
          params,
        },
        mutable,
      };
    } else {
      throw new Error("syntax error in assignment");
    }
  };

  const parseLambda = (): AST => {
    next();
    let params: AST[] = [];
    while (currentToken().type === "id") {
      params.push(currentToken() as AST);
      next();
      if (currentToken().type === "operator" && currentToken().value === "->") {
        break;
      }
      skip("punctuation", ",");
    }
    skip("operator", "->");
    return {
      type: "function",
      autoRun: false,
      body: accepts("punctuation", "{")
        ? delimited("{", "}", ";", parseExpression)
        : [parseExpression()],
      params,
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

  const parseArray = (): AST => {
    return {
      type: "array",
      elements: delimited("[", "]", ",", parseExpression),
    };
  };

  const parseTuple = (): AST => {
    const expressions = delimited("(", ")", ",", parseExpression);
    if (expressions.length === 1) {
      return expressions[0];
    } else {
      return {
        type: "tuple",
        expressions,
      };
    }
  };

  const intercept = <T>(x: T) => {
    console.log(x);
    return x;
  };

  const parsePossibleAssignmentOrMaybeJustId = (): AST => {
    const id = parseId();
    if (accepts("assign", "=")) {
      const equals = {
        type: "id",
        value: "=",
      } as AST;
      next();
      return {
        type: "call",
        func: equals,
        parameters: [id, parseExpression()],
      };
    } else {
      return id;
    }
  };

  const parseAtom = (): AST => {
    if (accepts("punctuation", "[")) {
      return parseArray();
    }

    if (accepts("punctuation", "(")) {
      return parseTuple();
    }

    if (accepts("keyword", "val") || accepts("keyword", "var"))
      return parseAssignment();

    if (accepts("operator", "\\")) return parseLambda();
    if (accepts("keyword", "if")) return parseIf();

    const token = input[index];
    if (token.type === "number" || token.type === "string") {
      next();
      return {
        type: token.type,
        value: token.value,
      };
    } else if (token.type === "id") {
      return parsePossibleAssignmentOrMaybeJustId();
    }

    throw new Error(`syntax error: ${token.type} "${token.value}" at ${index}`);
  };

  const parseCallableAtom = () => {
    let currentTree = parseAtom();
    while (currentToken().value === "." || currentToken().value === "(") {
      if (currentToken().value === ".") {
        next();
        const func = parseAtom();
        if (accepts("punctuation", "(")) {
          const parameters = delimited("(", ")", ",", parseExpression);
          currentTree = {
            type: "call",
            func,
            parameters: [...parameters, currentTree],
          };
        } else {
          throw new Error("");
          // TODO: should be valid, but the following does not work. (currying is messed up)
          // uh oh.. all functions are messed up?
          // currentTree = {
          //   type: "function",
          //   autoRun: false,
          //   body: [
          //     {
          //       type: "call",
          //       func,
          //       parameters: [currentTree],
          //     },
          //   ],
          //   params: [],
          // };
        }
      } else {
        // (
        const parameters = delimited("(", ")", ",", parseExpression);
        currentTree = {
          type: "call",
          func: currentTree,
          parameters,
        };
      }
    }
    return currentTree;
  };

  const parseExpression = (): AST => maybeBinary(parseCallableAtom(), 0);

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
