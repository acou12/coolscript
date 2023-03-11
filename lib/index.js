"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var tokenizer_1 = require("./tokenizer");
var parser_1 = require("./parser");
fs.readFile("./src/index.cool").then(function (file) {
    var tokens = (0, tokenizer_1.tokenize)(file.toString()).filter(function (_a) {
        var type = _a.type;
        return !["space", "comment"].includes(type);
    });
    var tree = (0, parser_1.parse)(tokens);
    console.log((0, parser_1.toString)(tree, 0));
    console.log((0, parser_1.calculate)(tree));
});
