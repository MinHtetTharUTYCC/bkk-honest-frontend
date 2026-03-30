const fs = require('fs');
const path = 'src/components/tips/tip-comments-modal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import Image from \"next/image\"")) {
    code = `import Image from "next/image";\n` + code;
}

code = code.replace(
    /<img alt="" src=\{comment\.user\.avatarUrl\} className="w-full h-full object-cover" \/>/s,
    `<Image src={comment.user.avatarUrl} alt="" fill sizes="32px" className="object-cover" />`
);

code = code.replace(
    /className="w-8 h-8 rounded-lg bg-white\/5 flex items-center justify-center text-white\/40 overflow-hidden shrink-0 group-hover:border-amber-400 border border-transparent transition-colors"/s,
    `className="relative w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 overflow-hidden shrink-0 group-hover:border-amber-400 border border-transparent transition-colors"`
);

fs.writeFileSync(path, code);
console.log('Done 6');
