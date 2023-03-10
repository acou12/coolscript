"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs/promises");
var tetrate = function (x, y) {
    return y === 0 ? 1 : Math.pow(x, tetrate(x, y - 1));
};
var tokenize = function (s) {
    var tokens = [];
    var parens = 0;
    var currentSubexpression = "";
    var currentToken = "";
    for (var i = 0; i < s.length; i++) {
        if (parens === 0) {
            if (s[i] === "(") {
                parens++;
            }
            else if (s[i] === " ") {
                if (currentToken !== "") {
                    tokens.push(currentToken);
                }
                currentToken = "";
            }
            else {
                currentToken += s[i];
            }
        }
        else {
            if (s[i] === ")") {
                parens--;
                if (parens === 0) {
                    tokens.push(tokenize(currentSubexpression));
                    currentSubexpression = "";
                }
                else {
                    currentSubexpression += s[i];
                }
            }
            else {
                currentSubexpression += s[i];
                if (s[i] === "(")
                    parens++;
            }
        }
    }
    if (currentToken !== "") {
        tokens.push(currentToken);
    }
    return tokens;
};
var operators = {
    "*": function (x, y) {
        return x * y;
    },
    "+": function (x, y) {
        return x + y;
    },
    "-": function (x, y) {
        return x - y;
    },
    "/": function (x, y) {
        return x / y;
    },
    "%": function (x, y) {
        return x % y;
    },
    "^": function (x, y) {
        return Math.pow(x, y);
    },
    "^^": function (x, y) {
        return tetrate(x, y);
    },
    logbase: function (x, y) {
        return Math.log(x) / Math.log(y);
    },
};
var evaluate = function (tokens) {
    if (tokens.length === 1)
        return Array.isArray(tokens[0]) ? evaluate(tokens[0]) : parseInt(tokens[0]);
    var x = evaluate(tokens.slice(0, tokens.length - 2));
    var op = tokens[tokens.length - 2];
    var y = tokens[tokens.length - 1];
    var yVal = Array.isArray(y) ? evaluate(y) : parseInt(y);
    return operators[op](x, yVal);
};
fs.readFile("./src/index.cool").then(function (file) {
    var stringSource = file.toString().toLowerCase();
    var tokens = tokenize(stringSource);
    console.log(evaluate(tokens));
});
