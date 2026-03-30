const fs = require('fs');
const file = 'src/app/(main)/navigate/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/  \}, \[attemptGeolocation\];\n\n/, '  }, [attemptGeolocation]);\n\n');
fs.writeFileSync(file, content);
