export declare const tokenTypes: readonly ["id", "string", "number", "operator", "space", "comment", "punctuation", "keyword"];
export type Token = {
    type: typeof tokenTypes[number];
    value: string;
};
export declare const tokenize: (source: string) => Token[];
