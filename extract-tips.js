const fs = require('fs');
const content = fs.readFileSync('bkk-honest-frontend/src/app/(main)/spots/[citySlug]/[spotSlug]/spot-detail-client.tsx', 'utf-8');

const match = content.match(/<TabsContent[^>]*value=["']tips["'][^>]*>/);
if (!match) {
    console.error("TabsContent for tips not found");
    process.exit(1);
}

const tipsStart = match.index;
const tipsEnd = content.indexOf('</TabsContent>', tipsStart) + '</TabsContent>'.length;

const tipsCode = content.substring(tipsStart, tipsEnd);

console.log(tipsCode.substring(0, 500));
console.log("---");
console.log(tipsCode.substring(tipsCode.length - 500));

fs.writeFileSync('bkk-honest-frontend/tips-code.txt', tipsCode);
