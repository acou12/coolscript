"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var process_1 = require("process");
var emitter_1 = require("./emitter");
var parser_1 = require("./parser");
var tokenizer_1 = require("./tokenizer");
fs.readFile("./src/index.cool").then(function (file) {
    try {
        var tokens = (0, tokenizer_1.tokenize)(file.toString()).filter(function (_a) {
            var type = _a.type;
            return !["space", "comment"].includes(type);
        });
        var tree = (0, parser_1.parse)(tokens);
        var emitted = (0, emitter_1.emit)(tree);
        fs.writeFile("out.js", emitted);
    }
    catch (e) {
        console.log(e.message);
        (0, process_1.exit)(1);
    }
});
