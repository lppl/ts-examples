export const once = <Fn extends (...args: any[]) => any>(fn: Fn): Fn => {
    let virgin = true;
    let value: ReturnType<Fn>;
    return ((...args: Parameters<Fn>) => {
        if (virgin) {
            virgin = false;
            value = fn(...args);
        }
        return value;
    }) as Fn;
};


let count = 0;
let fn = once((val: string) => {
    count += 1;
    return `${val}:${count}`;
}); 

const afterOne = fn('one'); 
const afterTwo = fn('two');


console.assert(afterOne === 'one:1', afterOne);
console.assert(afterTwo === 'one:1', afterTwo);
