import { Token } from "./tokenizer";
type Tree = {
    type: "expression";
    children: Tree[];
} | {
    type: "value";
    value: string;
};
export declare const parse: (tokens: Token[]) => Tree;
export declare const toString: (tree: Tree, indentationLevel: number) => string;
export declare const calculate: (tree: Tree) => number;
export {};
