"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var parser_1 = require("./parser");
var tokenizer_1 = require("./tokenizer");
fs.readFile("./src/index.cool").then(function (file) {
    var tokens = (0, tokenizer_1.tokenize)(file.toString()).filter(function (_a) {
        var type = _a.type;
        return !["space", "comment"].includes(type);
    });
    var conversion = {
        "+": "add",
        "-": "subtract",
        "*": "multiply",
        "/": "divide",
    };
    var toString = function (t) {
        if (t.type === "function_call") {
            return "".concat(conversion[t.function], "(").concat(t.parameters.map(toString).join(", "), ")");
        }
        else if (t.type === "number_literal") {
            return "".concat(t.value);
        }
        else if (t.type === "string_literal") {
            return "\"".concat(t.value, "\"");
        }
        throw new Error();
    };
    var tree = (0, parser_1.parseExpression)(tokens, 0);
    console.log(toString(tree.expression));
});
