const fs = require('fs');
const path = require('path');

console.log('=== Fixing syntax errors ===');

// Fix BlockSettingsForm.tsx
const blockFormPath = path.join(__dirname, 'src/components/editor/BlockSettingsForm.tsx');
console.log(`Reading ${blockFormPath}...`);
let blockContent = fs.readFileSync(blockFormPath, 'utf8');

// Replace the problematic line - use regex with exact pattern
const blockFixed = blockContent.replace(/"'": ''',/g, "'": ''',");
if (blockContent !== blockFixed) {
    fs.writeFileSync(blockFormPath, blockFixed);
    console.log('✓ BlockSettingsForm.tsx fixed');
} else {
    console.log('✗ No changes needed for BlockSettingsForm.tsx');
}

// Fix [...path].ts
const apiPath = path.join(__dirname, 'src/pages/api/[...path].ts');
console.log(`Reading ${apiPath}...`);
let apiContent = fs.readFileSync(apiPath, 'utf8');

// Replace the problematic line
const apiFixed = apiContent.replace(/"'": ''',/g, "'": ''',");
if (apiContent !== apiFixed) {
    fs.writeFileSync(apiPath, apiFixed);
    console.log('✓ API file fixed');
} else {
    console.log('✗ No changes needed for API file');
}

console.log('=== Done ===');