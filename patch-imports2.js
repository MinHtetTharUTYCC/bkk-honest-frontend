const fs = require('fs');
const file = 'src/hooks/use-api.ts';
let code = fs.readFileSync(file, 'utf8');

// remove those imports because they don't exist in string types in openapi spec for this endpoint
code = code.replace("import { CommunityTipsControllerFindBySpotType } from '@/api/generated/model/communityTipsControllerFindBySpotType';", "");
code = code.replace("import { CommunityTipsControllerFindBySpotSort } from '@/api/generated/model/communityTipsControllerFindBySpotSort';", "");

code = code.replace(/CommunityTipsControllerFindBySpotType\.TRY/g, "'TRY'");
code = code.replace(/CommunityTipsControllerFindBySpotType\.AVOID/g, "'AVOID'");
code = code.replace(/CommunityTipsControllerFindBySpotSort\.popular/g, "'popular'");
code = code.replace(/CommunityTipsControllerFindBySpotSort\.newest/g, "'newest'");

fs.writeFileSync(file, code);
