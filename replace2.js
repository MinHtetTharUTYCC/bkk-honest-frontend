const fs = require('fs');

const path = 'src/components/leaderboard-list.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import Image from \"next/image\"")) {
    code = `import Image from "next/image";\n` + code;
}

// 1
code = code.replace(
    /<img\s+src=\{c\.avatarUrl\}\s+alt=\{c\.name \|\| 'User avatar'\}\s+className="w-full h-full object-cover rounded-2xl"\s+\/>/s,
    `<Image src={c.avatarUrl} alt={c.name || 'User avatar'} fill sizes="40px" className="object-cover rounded-2xl" />`
);
// Make relative container
code = code.replace(
    /className=\{cn\(\n\s*'w-10 h-10 rounded-2xl flex items-center/,
    `className={cn(\n                                'relative w-10 h-10 rounded-2xl flex items-center`
);


// 2
code = code.replace(
    /<img src=\{c\.avatarUrl\} alt=\{c\.name \|\| 'User avatar'\} className="w-full h-full object-cover" \/>/s,
    `<Image src={c.avatarUrl} alt={c.name || 'User avatar'} fill sizes="40px" className="object-cover" />`
);
// Make relative container
code = code.replace(
    /'w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm overflow-hidden group-hover:scale-105 transition-transform'/,
    `'relative w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm overflow-hidden group-hover:scale-105 transition-transform'`
);


fs.writeFileSync(path, code);
console.log('Done 2');
