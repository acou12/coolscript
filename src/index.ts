import * as fs from "fs/promises";
import { tokenize } from "./tokenizer";
import { calculate, parse, toString } from "./parser";

fs.readFile("./src/index.cool").then((file) => {
  const tokens = tokenize(file.toString()).filter(
    ({ type }) => !["space", "comment"].includes(type)
  );
  const tree = parse(tokens);
  console.log(toString(tree, 0));
  console.log(calculate(tree));
});
