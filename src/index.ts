import * as fs from "fs/promises";

type Token = string | Token[];

const tetrate = (x: number, y: number): number =>
  y === 0 ? 1 : Math.pow(x, tetrate(x, y - 1));

const tokenize = (s: string): Token[] => {
  let tokens: Token[] = [];
  let parens = 0;
  let currentSubexpression: string = "";
  let currentToken: string = "";
  for (let i = 0; i < s.length; i++) {
    if (parens === 0) {
      if (s[i] === "(") {
        parens++;
      } else if (s[i] === " ") {
        if (currentToken !== "") {
          tokens.push(currentToken);
        }
        currentToken = "";
      } else {
        currentToken += s[i];
      }
    } else {
      if (s[i] === ")") {
        parens--;
        if (parens === 0) {
          tokens.push(tokenize(currentSubexpression));
          currentSubexpression = "";
        } else {
          currentSubexpression += s[i];
        }
      } else {
        currentSubexpression += s[i];
        if (s[i] === "(") parens++;
      }
    }
  }
  if (currentToken !== "") {
    tokens.push(currentToken);
  }
  return tokens;
};

const operators: Record<string, (x: number, y: number) => number> = {
  "*"(x: number, y: number) {
    return x * y;
  },
  "+"(x: number, y: number) {
    return x + y;
  },
  "-"(x: number, y: number) {
    return x - y;
  },
  "/"(x: number, y: number) {
    return x / y;
  },
  "%"(x: number, y: number) {
    return x % y;
  },
  "^"(x: number, y: number) {
    return Math.pow(x, y);
  },
  "^^"(x: number, y: number) {
    return tetrate(x, y);
  },
  logbase(x: number, y: number) {
    return Math.log(x) / Math.log(y);
  },
};

const evaluate = (tokens: Token[]): number => {
  if (tokens.length === 1)
    return Array.isArray(tokens[0]) ? evaluate(tokens[0]) : parseInt(tokens[0]);
  const x = evaluate(tokens.slice(0, tokens.length - 2));
  const op = tokens[tokens.length - 2] as string;
  const y = tokens[tokens.length - 1];
  const yVal = Array.isArray(y) ? evaluate(y) : parseInt(y);
  return operators[op](x, yVal);
};

fs.readFile("./src/index.cool").then((file) => {
  const stringSource = file.toString().toLowerCase();
  const tokens = tokenize(stringSource);
  console.log(evaluate(tokens));
});
