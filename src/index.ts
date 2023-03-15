import * as fs from "fs/promises";
import { emit, prefix } from "./emitter";
import { parse } from "./parser";
import { tokenize } from "./tokenizer";

const main = async () => {
  const stdlib = await transpile("./src/stdlib.cool");
  const index = await transpile("./src/index.cool");
  fs.writeFile("out.js", prefix + stdlib + index);
};

const transpile = async (file: string): Promise<string> => {
  return await fs.readFile(file).then((file) => {
    const tokens = tokenize(file.toString()).filter(
      ({ type }) => !["space", "comment"].includes(type)
    );
    const tree = parse(tokens);
    const emitted = emit(tree);
    return emitted;
  });
};

main();
