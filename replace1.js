const fs = require('fs');

const path = 'src/app/(main)/scam-alerts/[citySlug]/[alertSlug]/scam-alert-client.tsx';
let code = fs.readFileSync(path, 'utf8');

// Ensure import Image from 'next/image' is present
if (!code.includes("import Image from \"next/image\"")) {
    code = code.replace(/import {([^}]+)} from "lucide-react";/, "import Image from \"next/image\";\nimport { $1 } from \"lucide-react\";");
}

code = code.replace(
    /<img\s+src=\{localAlert\.user\.avatarUrl\}\s+alt=\{localAlert\.user\?\.name \|\| "User Avatar"\}\s+className="w-full h-full object-cover"\s+\/>/,
    `<Image src={localAlert.user.avatarUrl} alt={localAlert.user?.name || "User Avatar"} fill sizes="40px" className="object-cover" />`
);

code = code.replace(
    /<img\s+src=\{comment\.user\.avatarUrl\}\s+alt=\{comment\.user\?\.name \|\| "User Avatar"\}\s+className="w-full h-full object-cover"\s+\/>/,
    `<Image src={comment.user.avatarUrl} alt={comment.user?.name || "User Avatar"} fill sizes="32px" className="object-cover" />`
);

// We must ensure the containers of `fill` have `relative` positioning.
code = code.replace(/w-10 h-10 bg-white\/10 rounded-xl flex items-center/, 'relative w-10 h-10 bg-white/10 rounded-xl flex items-center');
code = code.replace(/w-8 h-8 bg-white\/10 rounded-lg flex items-center/, 'relative w-8 h-8 bg-white/10 rounded-lg flex items-center');

fs.writeFileSync(path, code);
console.log('Done 1');
