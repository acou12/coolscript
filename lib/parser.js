"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculate = exports.toString = exports.parse = void 0;
var parse = function (tokens) {
    var index = 0;
    var currentTree = {
        type: "expression",
        children: [],
    };
    while (index < tokens.length) {
        var currentToken = tokens[index];
        if (currentToken.type === "parenthesis") {
            if (currentToken.value === ")") {
                throw new Error("closed parenthesis found before open");
            }
            else {
                var endingIndex = index + 1;
                var opens = 0;
                while (!(tokens[endingIndex].type === "parenthesis" &&
                    tokens[endingIndex].value === ")" &&
                    opens === 0)) {
                    if (tokens[endingIndex].type === "parenthesis") {
                        if (tokens[endingIndex].value === "(") {
                            opens++;
                        }
                        else {
                            opens--;
                        }
                    }
                    endingIndex++;
                    if (endingIndex >= tokens.length) {
                        throw new Error("parenthesis were not closed :/");
                    }
                }
                var subTree = (0, exports.parse)(tokens.slice(index + 1, endingIndex));
                currentTree.children.push(subTree);
                index = endingIndex;
            }
        }
        else {
            currentTree.children.push({
                type: "value",
                value: currentToken.value,
            });
        }
        index++;
    }
    if (currentTree.children.length === 1) {
        return currentTree.children[0];
    }
    else {
        return currentTree;
    }
};
exports.parse = parse;
var toString = function (tree, indentationLevel) {
    var indentation = "  ".repeat(indentationLevel);
    if (tree.type === "value") {
        return "".concat(indentation, "value(").concat(tree.value, ")");
    }
    else {
        return "".concat(indentation, "expression(\n").concat(tree.children
            .map(function (child) { return (0, exports.toString)(child, indentationLevel + 1); })
            .join("\n"), "\n").concat(indentation, ")");
    }
};
exports.toString = toString;
var calculate = function (tree) {
    if (tree.type === "value") {
        return parseInt(tree.value);
    }
    else {
        var operator = tree.children[0];
        if (operator.type !== "value") {
            throw new Error("you can't start an expression with another expression!");
        }
        var f = {
            "+": function (x, y) { return x + y; },
            "-": function (x, y) { return x - y; },
            "/": function (x, y) { return x / y; },
            "*": function (x, y) { return x * y; },
        }[operator.value];
        return tree.children.slice(1).map(exports.calculate).reduce(f);
    }
};
exports.calculate = calculate;
