import { Token } from "./tokenizer";

type Expression =
  | {
      type: "function_call";
      function: string;
      parameters: Expression[];
    }
  | {
      type: "number_literal";
      value: string;
    }
  | {
      type: "string_literal";
      value: string;
    };

type ParseResult = {
  consumed: number;
  expression: Expression;
};

type Parser = (tokens: Token[], index: number) => ParseResult;

const parseNumber: Parser = (tokens: Token[], index: number) => ({
  consumed: 1,
  expression: {
    type: "number_literal",
    value: tokens[index].value,
  },
});

const parseString: Parser = (tokens: Token[], index: number) => ({
  consumed: 1,
  expression: {
    type: "string_literal",
    value: tokens[index].value,
  },
});

// const parsePrefixFunction: Parser = (tokens: Token[], index: number) => {
//   let f = tokens[index].value;
//   let endIndex = index + 2;
//   let parens = 0;
//   while (tokens[endIndex].value !== "," || parens !== 0) {
//     if (tokens[endIndex].value === "(") {
//       parens++;
//     } else if (tokens[endIndex].value === ")") {
//       parens--;
//     }
//     endIndex++;
//     if (endIndex >= tokens.length) throw new Error();
//   }
//   const x = {
//     consumed: 3,
//     expression: {
//       type: "string_literal",
//       value: tokens[index].value,
//     },
//   };
// };

export const parseExpression: Parser = (tokens: Token[], index: number) => {
  let firstParse: ParseResult;
  switch (tokens[index].type) {
    case "number":
      firstParse = parseNumber(tokens, index);
      break;
    case "string":
      firstParse = parseString(tokens, index);
      break;
    // case "name":
    //   firstParse = parsePrefixFunction(tokens, index);
    //   break;
    case "parenthesis":
      if (tokens[index].value === ")") throw new Error();
      let endIndex = index + 1;
      let parens = 0;
      while (tokens[endIndex].value !== ")" || parens !== 0) {
        if (tokens[endIndex].value === "(") {
          parens++;
        } else if (tokens[endIndex].value === ")") {
          parens--;
        }
        endIndex++;
        if (endIndex >= tokens.length) throw new Error();
      }
      firstParse = parseExpression(tokens.slice(index + 1, endIndex), 0);
      firstParse.consumed += 2;
      break;
    default:
      throw new Error();
  }
  index += firstParse.consumed;
  if (index < tokens.length) {
    const f = tokens[index].value;
    const secondParse = parseExpression(tokens.slice(index + 1), 0);
    return {
      consumed: firstParse.consumed + 1 + secondParse.consumed,
      expression: {
        type: "function_call",
        function: f,
        parameters: [firstParse.expression, secondParse.expression],
      },
    };
  } else {
    return firstParse;
  }
};
