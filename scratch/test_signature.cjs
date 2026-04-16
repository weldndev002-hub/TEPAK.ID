const md5 = require('md5');

const merchantCode = 'DS29376';
const merchantKey = '61c51a77ea664c53be0e6e02ce6ddbbe';
const orderId = 'S-f1947a0b-1776318686581';
const amount = 50000;

console.log('--- Signature Test ---');
console.log('Input:', merchantCode + orderId + amount + merchantKey);
console.log('MD5:', md5(merchantCode + orderId + amount + merchantKey));
console.log('MD5 (Upper):', md5(merchantCode + orderId + amount + merchantKey).toUpperCase());

console.log('\n--- Alternative Signature (Amount first) ---');
console.log('Input:', merchantCode + amount + orderId + merchantKey);
console.log('MD5:', md5(merchantCode + amount + orderId + merchantKey));
