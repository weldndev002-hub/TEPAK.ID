const fs = require('fs');
const path = require('path');

// Fix BlockSettingsForm.tsx
const blockFormPath = path.join(__dirname, 'src/components/editor/BlockSettingsForm.tsx');
let blockFormContent = fs.readFileSync(blockFormPath, 'utf8');

// Replace "'": ''', with "'": ''',
const oldPattern = /"'": ''',/;
const newContent = "'": ''',";
console.log('BlockSettingsForm.tsx before:', blockFormContent.match(oldPattern)?.[0]);
blockFormContent = blockFormContent.replace(oldPattern, newContent);
console.log('BlockSettingsForm.tsx after:', blockFormContent.includes(newContent));
fs.writeFileSync(blockFormPath, blockFormContent);

// Fix [...path].ts  
const apiPath = path.join(__dirname, 'src/pages/api/[...path].ts');
let apiContent = fs.readFileSync(apiPath, 'utf8');

// Replace "'": ''', with "'": ''',
console.log('API file before:', apiContent.includes("'": ''',"));
apiContent = apiContent.replace(/'": ''',/g, "'": ''',");
console.log('API file after:', apiContent.includes("'": ''',"));
fs.writeFileSync(apiPath, apiContent);

console.log('Both files fixed.');