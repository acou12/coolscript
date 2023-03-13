"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.tokenTypes = void 0;
exports.tokenTypes = [
    "name",
    "string",
    "number",
    "parenthesis",
    "operator",
    "space",
    "comment",
    "terminator",
];
var tokenizeCharacter = function (type, value) {
    return function (index, source) {
        return source[index] === value
            ? { consumed: 1, token: { type: type, value: value } }
            : undefined;
    };
};
var tokenizeOpenParens = tokenizeCharacter("parenthesis", "(");
var tokenizeClosedParens = tokenizeCharacter("parenthesis", ")");
var tokenizeSemi = tokenizeCharacter("terminator", ";");
var operators = "+-*/";
var tokenizeOperators = __spreadArray([], __read(operators), false).map(function (operator) {
    return tokenizeCharacter("operator", operator);
});
var tokenizePattern = function (type, pattern) {
    return function (index, source) {
        var string = "";
        while (index < source.length && pattern.test(source[index])) {
            string += source[index];
            index++;
        }
        return string === ""
            ? undefined
            : {
                consumed: string.length,
                token: {
                    type: type,
                    value: string,
                },
            };
    };
};
var tokenizeNumber = tokenizePattern("number", /[0-9]/);
var tokenizeName = tokenizePattern("name", /[a-zA-Z]/);
var tokenizeSpace = tokenizePattern("space", /\s/);
// todo: generalize
var tokenizeString = function (index, source) {
    if (source[index] === '"') {
        var string = "";
        index++;
        while (source[index] !== '"') {
            if (index >= source.length) {
                throw new Error("string wasn't terminated!");
            }
            string += source[index];
            index++;
        }
        return {
            consumed: string.length + 2,
            token: {
                type: "string",
                value: string,
            },
        };
    }
    else
        return undefined;
};
var tokenizeComment = function (index, source) {
    if (source.slice(index, index + 2) === "/*") {
        var string = "";
        index += 2;
        while (source.slice(index, index + 2) !== "*/") {
            if (index >= source.length) {
                throw new Error("comment wasn't terminated!");
            }
            string += source[index];
            index++;
        }
        return {
            consumed: string.length + 4,
            token: {
                type: "comment",
                value: string,
            },
        };
    }
    else
        return undefined;
};
var tokenizers = __spreadArray(__spreadArray([
    tokenizeComment,
    tokenizeString
], __read(tokenizeOperators), false), [
    tokenizeSpace,
    tokenizeClosedParens,
    tokenizeOpenParens,
    tokenizeSemi,
    tokenizeName,
    tokenizeNumber,
], false);
var tokenize = function (source) {
    var e_1, _a;
    var index = 0;
    var tokens = [];
    while (index < source.length) {
        var tokenizerFound = false;
        try {
            for (var tokenizers_1 = (e_1 = void 0, __values(tokenizers)), tokenizers_1_1 = tokenizers_1.next(); !tokenizers_1_1.done; tokenizers_1_1 = tokenizers_1.next()) {
                var tokenizer = tokenizers_1_1.value;
                var tokenizeResult = tokenizer(index, source);
                if (tokenizeResult !== undefined) {
                    var consumed = tokenizeResult.consumed, token = tokenizeResult.token;
                    index += consumed;
                    tokens.push(token);
                    tokenizerFound = true;
                    break;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (tokenizers_1_1 && !tokenizers_1_1.done && (_a = tokenizers_1.return)) _a.call(tokenizers_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        if (!tokenizerFound) {
            throw new Error("that's not a thing! (at \"".concat(source[index], "\", index ").concat(index, ")"));
        }
    }
    return tokens;
};
exports.tokenize = tokenize;