const native = eval;const say=native("console.log");const quine=(()=>(say("quine();")));const at=native("(i) => (a) => a.at(i)");const concat=native("(b) => (a) => a.concat(b)");const slice=((from)=>((to)=>((array)=>((((from < to))?((()=>(concat(slice((from + 1))(to)(array))([at(from)(array)])))()):((()=>([]))()))))));const length=native("a => a.length");const forEach=((f)=>((array)=>((((length(array) != 0))?((()=>(f(at(0)(array)),forEach(f)(slice(1)(length(array))(array))))()):(()=>{})))));const range=((from)=>((to)=>((((from <= to))?((()=>(concat(range((from + 1))(to))([from])))()):((()=>([]))())))));const map=((f)=>((arr)=>((((length(arr) == 0))?((()=>([]))()):((()=>(concat(map(f)(slice(1)(length(arr))(arr)))([f(at(0)(arr))])))())))));const random=native("Math.random");const floor=native("Math.floor");const randomInt=((low)=>((high)=>((floor((random() * (high - low))) + low))));const reverse=((arr)=>((((length(arr) == 0))?((()=>([]))()):((()=>(concat(at(0)(arr))(reverse(slice(1)(length(arr))(arr)))))()))));const arr=map((()=>(randomInt(0)(100))))(range(1)(10));say(arr);say(reverse(arr));