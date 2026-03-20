const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\ismae\\.gemini\\antigravity\\brain\\2627186e-143a-4877-8fb2-336d71d4e09c';
const destDir = 'c:\\Users\\ismae\\Desktop\\practicas\\CnCApp\\frontend\\src\\assets\\avatars';

const files = {
    'avatar_robot_tech_1773969774398.png': 'avatar1.png',
    'avatar_pro_male_1773969792236.png': 'avatar2.png',
    'avatar_pro_female_1773969802795.png': 'avatar3.png',
    'avatar_tech_icon_1773969817109.png': 'avatar4.png',
    'avatar_cat_robot_1773969828816.png': 'avatar5.png',
    'avatar_leaf_tech_1773969842937.png': 'avatar6.png'
};

if (!fs.existsSync(destDir)){
    fs.mkdirSync(destDir, { recursive: true });
}

Object.entries(files).forEach(([srcName, destName]) => {
    try {
        const srcPath = path.join(srcDir, srcName);
        const destPath = path.join(destDir, destName);
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${srcName} to ${destName}`);
    } catch (err) {
        console.error(`Error copying ${srcName}: ${err.message}`);
    }
});
