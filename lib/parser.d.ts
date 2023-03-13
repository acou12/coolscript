import { Token } from "./tokenizer";
type Expression = {
    type: "function_call";
    function: string;
    parameters: Expression[];
} | {
    type: "number_literal";
    value: string;
} | {
    type: "string_literal";
    value: string;
};
type ParseResult = {
    consumed: number;
    expression: Expression;
};
type Parser = (tokens: Token[], index: number) => ParseResult;
export declare const parseExpression: Parser;
export {};
