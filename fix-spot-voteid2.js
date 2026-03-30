const fs = require('fs');

const files = [
    'src/app/(main)/spots/[citySlug]/[spotSlug]/prices/page.tsx',
    'src/app/(main)/spots/[citySlug]/[spotSlug]/tips/page.tsx',
    'src/app/(main)/spots/[citySlug]/[spotSlug]/vibes/page.tsx',
    'src/app/(main)/spots/[citySlug]/[spotSlug]/page.tsx'
];

for (const path of files) {
    if (!fs.existsSync(path)) continue;
    let content = fs.readFileSync(path, 'utf8');
    content = content.replace(/<PricesTab spot=\{spot\} \/>/, '<PricesTab spot={spot as any} />');
    content = content.replace(/<TipsTab spot=\{spot\} \/>/, '<TipsTab spot={spot as any} />');
    content = content.replace(/<VibesTab spot=\{spot\} \/>/, '<VibesTab spot={spot as any} />');
    content = content.replace(/<SpotDetailClient spot=\{spot\} \/>/, '<SpotDetailClient spot={spot as any} />');
    fs.writeFileSync(path, content);
}
