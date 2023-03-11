export declare const tokenTypes: readonly ["name", "string", "number", "parenthesis", "operator", "space", "comment"];
export type Token = {
    type: typeof tokenTypes[number];
    value: string;
};
export declare const tokenize: (source: string) => Token[];
