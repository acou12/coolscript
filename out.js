
const println = console.log;
const factorial=(((n)=>{return (((n <= 1))?(((()=>{return 1})())):(((()=>{return (n * factorial((n - 1)))})())))}));
const factTen=factorial(10);
println(factTen);
(((factTen > 1000000))?(((()=>{println("okay, good");const equalityIsSymmetric=(1 == 1);const equalityProperty=((equalityIsSymmetric)?(((()=>{return "symmetric"})())):(((()=>{return "asymmetric"})())));println(("equality is " + equalityProperty));return ((equalityIsSymmetric)?(((()=>{return println("that's what i thought...")})())):(()=>{}))})())):(((()=>{return println("math is broken??")})())));
const forLoop=(((left,right,f)=>{return (((left <= right))?(((()=>{f(left);return forLoop((left + 1),right,f)})())):(()=>{}))}));
println("Here are some factorials: ");
forLoop(1,10,(((x)=>{return println(((x + "! = ") + factorial(x)))})));
println();
println("Now for fizzes and buzzes: ");
forLoop(1,100,(((n)=>{return println(((()=>{const combined=(((((n % 3) == 0))?(((()=>{return "Fizz"})())):(((()=>{return ""})()))) + ((((n % 5) == 0))?(((()=>{return "Buzz"})())):(((()=>{return ""})()))));return (((combined == ""))?(((()=>{return n})())):(((()=>{return combined})())))})()))})))