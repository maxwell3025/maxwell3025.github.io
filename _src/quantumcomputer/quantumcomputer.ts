import { QuantumState } from "./quantum";

let myQuantumState = new QuantumState(3, 1)
console.log(`${myQuantumState}`);
myQuantumState = myQuantumState.swap(0);
console.log(`${myQuantumState}`);