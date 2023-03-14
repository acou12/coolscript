
const println = console.log;
let fact=(x)=>{return (((x <= 1)) ? (1) : ((x * fact((x - 1)))))}
let main=()=>{return println((fact(150) - fact(150)))}
main()