const fs = require('fs');
const path = 'src/components/ui/image-viewer.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes("import OptimizedImage")) {
    code = `import OptimizedImage from "@/components/ui/OptimizedImage";\n` + code;
}

code = code.replace(
    /<img\s+src=\{imageUrl\}\s+alt=\{alt\}\s+className="max-w-\[90vw\] max-h-\[90vh\] object-contain"\s+onClick=\{\(e\) => e\.stopPropagation\(\)\}\s+\/>/s,
    `<div className="relative w-[90vw] h-[90vh]" onClick={(e) => e.stopPropagation()}>
          <OptimizedImage
            variants={imageVariants}
            alt={alt}
            fill
            objectFit="contain"
          />
        </div>`
);

fs.writeFileSync(path, code);
console.log('Done 10');
