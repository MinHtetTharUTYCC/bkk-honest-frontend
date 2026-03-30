const fs = require('fs');
const path = 'src/app/(main)/missions/page.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import OptimizedImage")) {
    code = `import OptimizedImage from "@/components/ui/OptimizedImage";\n` + code;
}

code = code.replace(
    /<img\s+src=\{mission\.spot\.imageVariants\.display \|\| mission\.spot\.imageVariants\.thumbnail \|\| ''\}\s+alt=\{mission\.spot\?\.name\}\s+className="w-full h-full object-cover"\s+\/>/s,
    `<OptimizedImage variants={mission.spot.imageVariants as any} alt={mission.spot?.name || ''} fill className="object-cover" />`
);

fs.writeFileSync(path, code);
console.log('Done 8');
