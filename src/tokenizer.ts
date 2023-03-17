export const tokenTypes = [
  "id",
  "string",
  "number",
  "operator",
  "space",
  "comment",
  "punctuation",
  "keyword",
  "assign",
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

const tokenizePunctuation = ";,(){}[]|:!."
  .split("")
  .map((c) => tokenizeCharacter("punctuation", c));

const tokenizeEquals = tokenizeCharacter("assign", "=");

export const operators = [
  "<=",
  ">=",
  "==",
  "!=",
  "->",
  "+",
  "-",
  "%",
  "*",
  "/",
  "\\",
  "<",
  ">",
];

// const tokenizeOperator =
//   (operator: string): Tokenizer =>
//   (index: number, string: string) => {
//     if (operator.length + index > string.length) {
//       return undefined;
//     } else {
//       return string.slice(index, index + operator.length) === operator
//         ? ({
//             consumed: operator.length,
//             token: {
//               type: "operator",
//               value: operator,
//             },
//           } as TokenizeResult)
//         : undefined;
//     }
//   };

// const tokenizeOperators = operators.map((operator) =>
//   tokenizeOperator(operator)
// );

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

const tokenizeMiscOperator = tokenizePattern(
  "operator",
  /([\\\!\@\#\$\%\^\&\*\+\-\?\<\>\|\=\/\~]|[^\x00-\x7F])/
);

const tokenizeNumber = tokenizePattern("number", /[0-9]/);
const tokenizeName = tokenizePattern("id", /[a-zA-Z]/);
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
  } else if (source.slice(index, index + 2) === "//") {
    let endIndex = index + 1;
    while (source[endIndex] !== "\n" && endIndex < source.length) {
      endIndex++;
    }
    return {
      consumed: endIndex - index,
      token: {
        type: "comment",
        value: source.slice(index, endIndex),
      },
    };
  } else return undefined;
};

const tokenizeKeyword =
  (keyword: string): Tokenizer =>
  (index: number, string: string) => {
    if (keyword.length + index > string.length) {
      return undefined;
    } else {
      return string.slice(index, index + keyword.length) === keyword
        ? /[^a-zA-Z]/.test(string[index + keyword.length])
          ? ({
              consumed: keyword.length,
              token: {
                type: "keyword",
                value: keyword,
              },
            } as TokenizeResult)
          : undefined
        : undefined;
    }
  };

const keywords = "if else val var for die in while".split(" ");

const tokenizers: Tokenizer[] = [
  tokenizeComment,
  tokenizeString,
  tokenizeMiscOperator,
  ...tokenizePunctuation,
  // ...tokenizeOperators,
  tokenizeSpace,
  ...keywords.map(tokenizeKeyword),
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
