
const println = console.log;
let fact=(x)=>{return (((x <= 1)) ? (1) : ((x * fact((x - 1)))))}
let forloop=(from,to,f)=>{return (((from <= to)) ? (()=>{f(from);return forloop((from + 1),to,f)}) : (()=>{}))()}
let main=()=>{return forloop(0,50,(x)=>{return println(((x + "! = ") + fact(x)))})}
main()