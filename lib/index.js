"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var process_1 = require("process");
var parser_1 = require("./parser");
var tokenizer_1 = require("./tokenizer");
fs.readFile("./src/index.cool").then(function (file) {
    try {
        var tokens = (0, tokenizer_1.tokenize)(file.toString()).filter(function (_a) {
            var type = _a.type;
            return !["space", "comment"].includes(type);
        });
        var out = prefix + (0, parser_1.parse)(tokens).map(js).join(";\n");
        fs.writeFile("out.js", out);
    }
    catch (e) {
        console.log(e.message);
        (0, process_1.exit)(1);
    }
});
var prefix = "\nconst println = console.log;\n";
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
