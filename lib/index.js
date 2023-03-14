"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var tokenizer_1 = require("./tokenizer");
fs.readFile("./src/index.cool").then(function (file) {
    var tokens = (0, tokenizer_1.tokenize)(file.toString()).filter(function (_a) {
        var type = _a.type;
        return !["space", "comment"].includes(type);
    });
    console.log(tokens);
    // console.log(parse(tokens));
});
