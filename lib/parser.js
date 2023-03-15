"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = void 0;
var PRECEDENCE = {
    "=": 1,
    "||": 2,
    "&&": 3,
    "<": 4,
    ">": 4,
    "<=": 4,
    ">=": 4,
    "==": 4,
    "!=": 4,
    "+": 5,
    "-": 5,
    "*": 6,
    "/": 6,
    "%": 6,
};
var parse = function (input) {
    var index = 0;
    var done = function () { return index >= input.length; };
    var currentToken = function () { return input[index]; };
    var accepts = function (type, value) {
        return input[index].type === type && input[index].value === value;
    };
    var expects = function (type, value) {
        if (!accepts(type, value)) {
            throw new Error("expected ".concat(type, " \"").concat(value, "\", found ").concat(input[index].type, " \"").concat(input[index].value, "\" at ").concat(index));
        }
    };
    var next = function () {
        index++;
    };
    var skip = function (type, value) {
        expects(type, value);
        next();
    };
    var maybeCall = function (expr) {
        var evaluated = expr();
        return !done() && accepts("punctuation", "(")
            ? parseCall(evaluated)
            : evaluated;
    };
    var parseCall = function (func) {
        return {
            type: "call",
            func: func,
            parameters: delimited("(", ")", ",", parseExpression),
        };
    };
    var maybeBinary = function (left, precedence) {
        if (!done() && input[index].type === "operator") {
            var token = input[index];
            var otherPrecedence = PRECEDENCE[token.value];
            if (otherPrecedence > precedence) {
                next();
                var right = maybeBinary(parseAtom(), otherPrecedence);
                return maybeBinary({
                    type: "call",
                    func: {
                        type: "id",
                        value: token.value,
                    },
                    parameters: [left, right],
                }, precedence);
            }
        }
        return left;
    };
    var delimited = function (start, stop, seperator, parser) {
        var asts = [];
        var first = true;
        skip("punctuation", start);
        while (!done()) {
            if (accepts("punctuation", stop))
                break;
            if (first) {
                first = false;
            }
            else {
                skip("punctuation", seperator);
            }
            if (accepts("punctuation", stop))
                break;
            asts.push(parser());
        }
        skip("punctuation", stop);
        return asts;
    };
    var parseId = function () {
        return input[index++];
    };
    /*
    valid:
      { a -> f() }
      { a, b -> f() }
      { -> f() }
      { a, b -> }
    */
    var parseAssignment = function () {
        var assignType = currentToken().value;
        next();
        var mutable = assignType === "var";
        return {
            type: "assign",
            operator: "=",
            left: parseId(),
            right: (skip("assign", "="), parseExpression()),
            mutable: mutable,
        };
    };
    var parseLambda = function () {
        if (accepts("punctuation", "!")) {
            next();
            return {
                type: "function",
                params: [],
                body: delimited("{", "}", ";", parseExpression),
                autoRun: true,
            };
        }
        skip("punctuation", "{");
        var params = [];
        while (!done() && currentToken().type === "id") {
            params.push(parseId());
            if (accepts("punctuation", ",")) {
                next();
            }
            else {
                break;
            }
        }
        skip("operator", "->");
        var body = [];
        while (!done() && !accepts("punctuation", "}")) {
            body.push(parseExpression());
            if (accepts("punctuation", ";")) {
                next();
            }
            else {
                break;
            }
        }
        skip("punctuation", "}");
        return {
            type: "function",
            params: params,
            body: body,
            autoRun: false,
        };
    };
    var parseIf = function () {
        skip("keyword", "if");
        var condition = parseExpression();
        var ifBranch = {
            type: "function",
            params: [],
            body: accepts("punctuation", "{")
                ? delimited("{", "}", ";", parseExpression)
                : [parseExpression()],
            autoRun: true,
        };
        var elseBranch = accepts("keyword", "else")
            ? (next(),
                {
                    type: "function",
                    params: [],
                    body: accepts("punctuation", "{")
                        ? delimited("{", "}", ";", parseExpression)
                        : [parseExpression()],
                    autoRun: true,
                })
            : undefined;
        return {
            type: "if",
            condition: condition,
            ifBranch: ifBranch,
            elseBranch: elseBranch,
        };
    };
    var parseAtom = function () {
        return maybeCall(function () {
            if (accepts("punctuation", "(")) {
                next();
                var expression = parseExpression();
                skip("punctuation", ")");
                return expression;
            }
            if (accepts("keyword", "val") || accepts("keyword", "var"))
                return parseAssignment();
            if (accepts("punctuation", "!") && input[index + 1].value === "{")
                return parseLambda();
            if (accepts("punctuation", "{"))
                return parseLambda();
            if (accepts("keyword", "if"))
                return parseIf();
            var token = input[index];
            if (token.type === "id" ||
                token.type === "number" ||
                token.type === "string") {
                next();
                return {
                    type: token.type,
                    value: token.value,
                };
            }
            throw new Error("syntax error: ".concat(token.type, " \"").concat(token.value, "\" at ").concat(index));
        });
    };
    var parseExpression = function () {
        return maybeCall(function () { return maybeBinary(parseAtom(), 0); });
    };
    var parseTopLevel = function () {
        var program = [];
        while (!done()) {
            program.push(parseExpression());
            if (!done()) {
                skip("punctuation", ";");
            }
        }
        return program;
    };
    return parseTopLevel();
};
exports.parse = parse;
