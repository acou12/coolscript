import { Token } from "./tokenizer";
type AST = {
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
};
export declare const parse: (input: Token[]) => AST[];
export {};
