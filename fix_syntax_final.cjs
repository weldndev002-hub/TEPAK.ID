const fs = require('fs');
const path = require('path');

// Fix BlockSettingsForm.tsx
const blockFormPath = path.join(__dirname, 'src/components/editor/BlockSettingsForm.tsx');
console.log('Reading BlockSettingsForm.tsx...');
let blockFormContent = fs.readFileSync(blockFormPath, 'utf8');

// Replace the problematic line - using exact string match
const oldLine = `                "'": ''',`;
const newLine = `                "'": ''',`;
console.log('Looking for:', oldLine);
console.log('Found:', blockFormContent.includes(oldLine));

blockFormContent = blockFormContent.replace(oldLine, newLine);
fs.writeFileSync(blockFormPath, blockFormContent);
console.log('BlockSettingsForm.tsx fixed.');

// Fix [...path].ts
const apiPath = path.join(__dirname, 'src/pages/api/[...path].ts');
console.log('Reading API file...');
let apiContent = fs.readFileSync(apiPath, 'utf8');

// Replace the problematic line
const oldLine2 = `          "'": ''',`;
const newLine2 = `          "'": ''',`;
console.log('Looking for:', oldLine2);
console.log('Found:', apiContent.includes(oldLine2));

apiContent = apiContent.replace(oldLine2, newLine2);
fs.writeFileSync(apiPath, apiContent);
console.log('API file fixed.');

console.log('Done.');