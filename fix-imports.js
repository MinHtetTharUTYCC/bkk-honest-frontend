const fs = require('fs');

const files = [
    'src/app/(main)/map/page.tsx',
    'src/app/(main)/missions/page.tsx',
    'src/components/leaderboard-list.tsx',
    'src/components/scams/scam-alert-card.tsx',
    'src/components/scams/scam-edit-modal.tsx',
    'src/components/spots/tabs/gallery-tab.tsx',
    'src/components/tips/tip-card.tsx',
    'src/components/tips/tip-comments-modal.tsx',
    'src/components/ui/image-viewer.tsx'
];

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Fix imports
    if (content.startsWith('import Image')) {
        const lines = content.split('\n');
        const imgLine = lines.shift(); // remove first line
        
        let targetLine = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('"use client"') || lines[i].includes("'use client'")) {
                targetLine = i + 1;
                break;
            }
        }
        lines.splice(targetLine, 0, imgLine);
        content = lines.join('\n');
    }
    if (content.startsWith('import OptimizedImage')) {
        const lines = content.split('\n');
        const imgLine = lines.shift(); // remove first line
        
        let targetLine = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('"use client"') || lines[i].includes("'use client'")) {
                targetLine = i + 1;
                break;
            }
        }
        lines.splice(targetLine, 0, imgLine);
        content = lines.join('\n');
    }

    // Fix parsing error in scam-alert-card.tsx
    if (file.includes('scam-alert-card.tsx')) {
        content = content.replace(
            /\{\s*editPreview \|\| \(alert\.imageVariants && Object\.values\(alert\.imageVariants\)\.some\(v => v\)\)\s*\?\s*\(\s*\{\s*editPreview \?\s*\(/g,
            `{editPreview ? (`
        );
        content = content.replace(
            /<OptimizedImage variants=\{alert\.imageVariants as any\} alt="" fill className="w-full h-full object-cover group-hover:opacity-50" \/>\s*\)\}\s*\)\s*:\s*\(/g,
            `<OptimizedImage variants={alert.imageVariants as any} alt="" fill className="w-full h-full object-cover group-hover:opacity-50" />
                                ) : (`
        );
    }
    
    // Fix parsing error in scam-edit-modal.tsx
    if (file.includes('scam-edit-modal.tsx')) {
        content = content.replace(
            /\{\s*editPreview \|\| \(alert\.imageVariants && Object\.values\(alert\.imageVariants\)\.some\(v => v\)\)\s*\?\s*\(\s*\{\s*editPreview \?\s*\(/g,
            `{editPreview ? (`
        );
        content = content.replace(
            /<OptimizedImage variants=\{alert\.imageVariants as any\} alt="Scam alert" fill className="w-full h-full object-cover group-hover:opacity-50" \/>\s*\)\}\s*\)\s*:\s*\(/g,
            `<OptimizedImage variants={alert.imageVariants as any} alt="Scam alert" fill className="w-full h-full object-cover group-hover:opacity-50" />
                                        ) : (`
        );
    }

    // Fix strict any
    content = content.replace(/variants=\{selectedSpot\.imageVariants as any\}/g, `variants={selectedSpot.imageVariants as Record<string, string>}`);
    content = content.replace(/variants=\{mission\.spot\.imageVariants as any\}/g, `variants={mission.spot.imageVariants as Record<string, string>}`);
    content = content.replace(/variants=\{alert\.imageVariants as any\}/g, `variants={alert.imageVariants as Record<string, string>}`);

    fs.writeFileSync(file, content);
}
