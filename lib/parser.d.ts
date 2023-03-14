import { Token } from "./tokenizer";
export type AST = {
    type: "program";
    prog: AST[];
} | {
    type: "assign";
    operator: string;
    left: AST;
    right: AST;
} | {
    type: "number";
    value: string;
} | {
    type: "string";
    value: string;
} | {
    type: "call";
    func: AST;
    parameters: AST[];
} | {
    type: "id";
    value: string;
} | {
    type: "function";
    params: AST[];
    body: AST[];
} | {
    type: "if";
    condition: AST;
    ifBranch: AST;
    elseBranch: AST;
};
export declare const parse: (input: Token[]) => AST[];
