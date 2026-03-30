const fs = require('fs');
const path = 'src/components/scams/scam-edit-modal.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import OptimizedImage")) {
    code = `import OptimizedImage from "@/components/ui/OptimizedImage";\n` + code;
}

code = code.replace(
    /<img alt="Scam alert" src=\{editPreview \|\| \(alert\.imageVariants\?\.display \|\| alert\.imageVariants\?\.thumbnail \|\| ''\)\}\s+className="w-full h-full object-cover group-hover:opacity-50"\s+\/>/s,
    `{editPreview ? (
                                        <img alt="Scam alert" src={editPreview} className="w-full h-full object-cover group-hover:opacity-50" />
                                    ) : (
                                        <OptimizedImage variants={alert.imageVariants as any} alt="Scam alert" fill className="w-full h-full object-cover group-hover:opacity-50" />
                                    )}`
);

fs.writeFileSync(path, code);
console.log('Done 5');
