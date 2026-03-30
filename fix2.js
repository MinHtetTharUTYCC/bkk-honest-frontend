const fs = require('fs');

function fixSyntax(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(
        /\{editPreview \?\s*\(\s*<img[^>]+>\s*\)\s*:\s*\(\s*<OptimizedImage[^>]+>\s*\)\s*:\s*\(\s*<Camera[^>]+>\s*\)\}/,
        `{editPreview ? (
            <img alt="" src={editPreview} className="w-full h-full object-cover group-hover:opacity-50" />
        ) : alert.imageVariants && Object.values(alert.imageVariants).some(v => v) ? (
            <OptimizedImage variants={alert.imageVariants as Record<string, string>} alt="" fill className="w-full h-full object-cover group-hover:opacity-50" />
        ) : (
            <Camera size={20} className="text-white/20" />
        )}`
    );
    fs.writeFileSync(file, content);
}

fixSyntax('src/components/scams/scam-alert-card.tsx');
fixSyntax('src/components/scams/scam-edit-modal.tsx');
