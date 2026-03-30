const fs = require('fs');

const files = [
    'src/app/(main)/map/page.tsx',
    'src/app/(main)/missions/page.tsx',
    'src/components/scams/scam-alert-card.tsx',
    'src/components/scams/scam-edit-modal.tsx',
    'src/components/ui/OptimizedImage.tsx',
    'src/components/profile/user-spots-infinite-tab.tsx'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the bad cast: "variants={selectedSpot.imageVariants as Record<string, string>}" -> "variants={selectedSpot.imageVariants as unknown as ImageVariantsDto}"
    // or just let it infer if the types match, but ImageVariantsDto requires display/thumbnail and Record<string,string> doesn't.
    // The easiest fix is 'as unknown as ImageVariantsDto' or 'as ImageVariantsDto'. Since the component is already dealing with ImageVariantsDto.
    
    content = content.replace(/variants=\{([^}]+) as Record<string, string>\}/g, 'variants={$1 as any}'); // Wait, lint doesn't allow `as any`.
    
    // Instead, let's cast it to `ImageVariantsDto`.
    // Wait, if we use `ImageVariantsDto`, we need to import it.
    // Let's check if we can just cast to `{ thumbnail: string, display: string }`
    
    content = content.replace(/as Record<string, string>/g, 'as { thumbnail: string; display: string }');
    
    fs.writeFileSync(file, content);
}
