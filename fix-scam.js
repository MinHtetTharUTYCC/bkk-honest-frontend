const fs = require('fs');
const file = 'src/app/(main)/scam-alerts/[citySlug]/[alertSlug]/scam-alert-client.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/await toggleVote\(localAlert as LocalAlert\)/, 'await toggleVote(localAlert as any)');
fs.writeFileSync(file, content);
