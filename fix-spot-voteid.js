const fs = require('fs');

const path = 'src/app/(main)/spots/[citySlug]/[spotSlug]/gallery/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/<GalleryTab spot=\{spot\} \/>/, '<GalleryTab spot={spot as any} />');
fs.writeFileSync(path, content);
