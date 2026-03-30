const fs = require('fs');

const path = 'src/components/spots/tabs/gallery-tab.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import Image from \"next/image\"")) {
    code = `import Image from "next/image";\n` + code;
}

code = code.replace(
    /<img alt="" src=\{img\.user\.avatarUrl\} className="w-full h-full object-cover" \/>/s,
    `<Image src={img.user.avatarUrl} alt="" fill sizes="28px" className="object-cover" />`
);

code = code.replace(
    /className="w-7 h-7 rounded-lg bg-white\/5 flex items-center justify-center text-white\/40 overflow-hidden hover:border-amber-400 border border-transparent transition-colors shrink-0"/s,
    `className="relative w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 overflow-hidden hover:border-amber-400 border border-transparent transition-colors shrink-0"`
);

fs.writeFileSync(path, code);
console.log('Done 3');
