const fs = require('fs');
const path = 'src/components/scams/scam-alert-card.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import Image from \"next/image\"")) {
    code = `import Image from "next/image";\n` + code;
}
if (!code.includes("import OptimizedImage")) {
    code = `import OptimizedImage from "@/components/ui/OptimizedImage";\n` + code;
}

// 1. avatarUrl
code = code.replace(
    /<img alt="" src=\{alert\.user\.avatarUrl\}\s+className="w-full h-full object-cover"\s+\/>/s,
    `<Image src={alert.user.avatarUrl} alt="" fill sizes="40px" className="object-cover" />`
);
code = code.replace(
    /className="w-10 h-10 rounded-xl bg-white\/5 flex items-center justify-center text-white\/40 overflow-hidden hover:border-amber-400 border border-transparent transition-colors"/s,
    `className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/40 overflow-hidden hover:border-amber-400 border border-transparent transition-colors"`
);


// 2. imageVariants
code = code.replace(
    /<img\s+src=\{alert\.imageVariants\.display \|\| alert\.imageVariants\.thumbnail \|\| ''\}\s+alt=\{alert\.scamName \|\| 'Scam alert'\}\s+width=\{alert\.imageWidth\}\s+height=\{alert\.imageHeight\}\s+className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"\s+\/>/s,
    `<OptimizedImage variants={alert.imageVariants as any} alt={alert.scamName || 'Scam alert'} fill className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />`
);

// 3. editPreview
code = code.replace(
    /<img alt="" src=\{editPreview \|\| \(alert\.imageVariants\?\.display \|\| alert\.imageVariants\?\.thumbnail \|\| ''\)\}\s+className="w-full h-full object-cover group-hover:opacity-50"\s+\/>/s,
    `{editPreview ? (
                                    <img alt="" src={editPreview} className="w-full h-full object-cover group-hover:opacity-50" />
                                ) : (
                                    <OptimizedImage variants={alert.imageVariants as any} alt="" fill className="w-full h-full object-cover group-hover:opacity-50" />
                                )}`
);

fs.writeFileSync(path, code);
console.log('Done 4');
