import * as fs from "fs/promises";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";

fs.readFile("./src/index.cool").then((file) => {
  const tokens = tokenize(file.toString()).filter(
    ({ type }) => !["space", "comment"].includes(type)
  );
  console.log(tokens);
  // console.log(parse(tokens));
});
