const fs = require('fs');
const path = 'src/components/tips/tip-card.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import Image from \"next/image\"")) {
    code = `import Image from "next/image";\n` + code;
}

code = code.replace(
    /<img\s+src=\{tip\.user\.avatarUrl\}\s+alt=\{tip\.user\.name\}\s+className="w-full h-full object-cover"\s+\/>/s,
    `<Image src={tip.user.avatarUrl} alt={tip.user.name} fill sizes="48px" className="object-cover" />`
);

code = code.replace(
    /className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white\/5 border border-border shrink-0 overflow-hidden hover:border-amber-400 transition-colors"/s,
    `className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-border shrink-0 overflow-hidden hover:border-amber-400 transition-colors"`
);

fs.writeFileSync(path, code);
console.log('Done 7');
