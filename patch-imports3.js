const fs = require('fs');
const files = [
  'src/app/(main)/spots/[citySlug]/[spotSlug]/tips/page.tsx',
];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/import \{ CommunityTipsControllerFindBySpotType \} from "@\/api\/generated\/model\/communityTipsControllerFindBySpotType";\n/, "");
  code = code.replace(/import \{ CommunityTipsControllerFindBySpotSort \} from "@\/api\/generated\/model\/communityTipsControllerFindBySpotSort";\n/, "");
  
  code = code.replace(/CommunityTipsControllerFindBySpotType\.TRY/g, '"TRY"');
  code = code.replace(/CommunityTipsControllerFindBySpotType\.AVOID/g, '"AVOID"');
  code = code.replace(/CommunityTipsControllerFindBySpotSort\.popular/g, '"popular"');
  code = code.replace(/CommunityTipsControllerFindBySpotSort\.newest/g, '"newest"');
  
  fs.writeFileSync(file, code);
});
