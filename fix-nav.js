const fs = require('fs');
const file = 'src/app/(main)/navigate/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /  useEffect\(\(\) => \{\n    checkGeolocationPermission\(\);\n    \/\/ Lock body scroll while navigation page is mounted\n    document\.body\.style\.overflow = "hidden";\n    return \(\) => \{\n      document\.body\.style\.overflow = "";\n    \};\n  \}, \[destLat, destLng, checkGeolocationPermission\]\);\n\n/;

const match = content.match(regex);
if (match) {
    content = content.replace(regex, '');
    const insertAfterRegex = /  \}, \[attemptGeolocation\]\);\n/;
    content = content.replace(insertAfterRegex, '  }, [attemptGeolocation];\n\n' + match[0]);
    fs.writeFileSync(file, content);
    console.log('Fixed successfully');
} else {
    console.log('Could not find match for useEffect');
}
