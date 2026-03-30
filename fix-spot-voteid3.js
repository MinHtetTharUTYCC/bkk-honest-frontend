const fs = require('fs');

const path = 'src/app/(main)/spots/[citySlug]/[spotSlug]/tips/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/searchParams: Promise<\{ type\?: string \}>;/, 'searchParams: Promise<{ type?: string; sort?: string }>;');
fs.writeFileSync(path, content);
