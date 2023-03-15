"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emit = void 0;
var tokenizer_1 = require("./tokenizer");
var prefix = "\n    const println = console.log;\n    const native = eval;\n";
var js = function (tree) {
    switch (tree.type) {
        case "assign":
            return "".concat(tree.mutable ? "let" : "const", " ").concat(js(tree.left), "=").concat(js(tree.right));
        case "call":
            if (tree.func.type === "id" && tokenizer_1.operators.includes(tree.func.value)) {
                return "(".concat(js(tree.parameters[0]), " ").concat(tree.func.value, " ").concat(js(tree.parameters[1]), ")");
            }
            else {
                return "".concat(js(tree.func), "(").concat(tree.parameters.map(js).join(","), ")");
            }
        case "function":
            return "(((".concat(tree.params.map(js).join(","), ")=>{").concat(tree.body
                .map(js)
                .map(function (x, i) { return (i === tree.body.length - 1 ? "return ".concat(x) : x); })
                .join(";"), "})").concat(tree.autoRun ? "()" : "", ")");
        case "id":
            return tree.value;
        case "number":
            return tree.value;
        case "string":
            return "\"".concat(tree.value, "\"");
        case "if":
            return "((".concat(js(tree.condition), ")?(").concat(js(tree.ifBranch), "):").concat(tree.elseBranch !== undefined ? "(".concat(js(tree.elseBranch), ")") : "(()=>{})", ")");
    }
};
var emit = function (tree) { return prefix + tree.map(js).join(";\n"); };
exports.emit = emit;
