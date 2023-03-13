export const tokenTypes = [
  "name",
  "string",
  "number",
  "parenthesis",
  "operator",
  "space",
  "comment",
  "terminator",
] as const;

export type Token = {
  type: typeof tokenTypes[number];
  value: string;
};

type TokenizeResult = {
  consumed: number;
  token: Token;
};

type Tokenizer = (index: number, source: string) => TokenizeResult | undefined;

const tokenizeCharacter =
  (type: Token["type"], value: string): Tokenizer =>
  (index: number, source: string) =>
    source[index] === value
      ? { consumed: 1, token: { type, value } }
      : undefined;

const tokenizeOpenParens = tokenizeCharacter("parenthesis", "(");
const tokenizeClosedParens = tokenizeCharacter("parenthesis", ")");
const tokenizeSemi = tokenizeCharacter("terminator", ";");

const operators = "+-*/";

const tokenizeOperators = [...operators].map((operator) =>
  tokenizeCharacter("operator", operator)
);

const tokenizePattern =
  (type: Token["type"], pattern: RegExp): Tokenizer =>
  (index: number, source: string) => {
    let string = "";
    while (index < source.length && pattern.test(source[index])) {
      string += source[index];
      index++;
    }
    return string === ""
      ? undefined
      : {
          consumed: string.length,
          token: {
            type,
            value: string,
          },
        };
  };

const tokenizeNumber = tokenizePattern("number", /[0-9]/);
const tokenizeName = tokenizePattern("name", /[a-zA-Z]/);
const tokenizeSpace = tokenizePattern("space", /\s/);

// todo: generalize
const tokenizeString: Tokenizer = (index: number, source: string) => {
  if (source[index] === '"') {
    let string = "";
    index++;
    while (source[index] !== '"') {
      if (index >= source.length) {
        throw new Error("string wasn't terminated!");
      }
      string += source[index];
      index++;
    }
    return {
      consumed: string.length + 2,
      token: {
        type: "string",
        value: string,
      },
    };
  } else return undefined;
};

const tokenizeComment: Tokenizer = (index: number, source: string) => {
  if (source.slice(index, index + 2) === "/*") {
    let string = "";
    index += 2;
    while (source.slice(index, index + 2) !== "*/") {
      if (index >= source.length) {
        throw new Error("comment wasn't terminated!");
      }
      string += source[index];
      index++;
    }
    return {
      consumed: string.length + 4,
      token: {
        type: "comment",
        value: string,
      },
    };
  } else return undefined;
};

const tokenizers: Tokenizer[] = [
  tokenizeComment,
  tokenizeString,
  ...tokenizeOperators,
  tokenizeSpace,
  tokenizeClosedParens,
  tokenizeOpenParens,
  tokenizeSemi,
  tokenizeName,
  tokenizeNumber,
];

export const tokenize = (source: string) => {
  let index = 0;
  const tokens: Token[] = [];
  while (index < source.length) {
    let tokenizerFound = false;
    for (const tokenizer of tokenizers) {
      const tokenizeResult = tokenizer(index, source);
      if (tokenizeResult !== undefined) {
        const { consumed, token } = tokenizeResult;
        index += consumed;
        tokens.push(token);
        tokenizerFound = true;
        break;
      }
    }
    if (!tokenizerFound) {
      throw new Error(
        `that's not a thing! (at "${source[index]}", index ${index})`
      );
    }
  }
  return tokens;
};