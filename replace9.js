const fs = require('fs');
const path = 'src/app/(main)/map/page.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import OptimizedImage")) {
    code = `import OptimizedImage from "@/components/ui/OptimizedImage";\n` + code;
}

code = code.replace(
    /<img\s+src=\{selectedSpot\.imageVariants\.display \|\| selectedSpot\.imageVariants\.thumbnail \|\| ''\}\s+alt=\{selectedSpot\.name\}\s+className="w-full h-full object-cover"\s+\/>/s,
    `<OptimizedImage variants={selectedSpot.imageVariants as any} alt={selectedSpot.name} fill className="object-cover" />`
);

code = code.replace(
    /className="w-full h-40 rounded-2xl overflow-hidden mb-4 bg-white\/5"/s,
    `className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 bg-white/5"`
);

fs.writeFileSync(path, code);
console.log('Done 9');
