import * as fs from "fs/promises";
import { exit } from "process";
import { emit } from "./emitter";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";

fs.readFile("./src/index.cool").then((file) => {
  try {
    const tokens = tokenize(file.toString()).filter(
      ({ type }) => !["space", "comment"].includes(type)
    );
    const tree = parse(tokens);
    const emitted = emit(tree);
    fs.writeFile("out.js", emitted);
  } catch (e: any) {
    console.log(e.message);
    exit(1);
  }
});
