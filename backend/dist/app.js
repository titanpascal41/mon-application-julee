"use strict";
const justine = {
    name: 'Justine',
    age: 23,
};
function isAdult(user) {
    return user.age >= 18;
}
console.log(`${justine.name} is an adult: ${isAdult(justine)}`);
