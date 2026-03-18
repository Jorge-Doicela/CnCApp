const fs = require('fs');
const path = require('path');

const frontendRoutesPath = 'C:/Users/ismae/Desktop/practicas/CnCApp/frontend/src/app/features/admin/admin.routes.ts';
if (fs.existsSync(frontendRoutesPath)) {
    let content = fs.readFileSync(frontendRoutesPath, 'utf8');

    if (!content.includes('module.guard')) {
        content = content.replace("import { adminGuard } from '../../core/guards/admin.guard';", "import { adminGuard } from '../../core/guards/admin.guard';\nimport { moduleGuard } from '../../core/guards/module.guard';");
    }

    const moduleMapping = [
        { prefix: 'gestionar-usuarios', mod: 'Gestionar usuarios' },
        { prefix: 'gestionar-roles', mod: 'Gestionar roles' },
        { prefix: 'gestionar-entidades', mod: 'Gestionar entidades' },
        { prefix: 'gestionar-capacitaciones', mod: 'Gestionar capacitaciones' },
        { prefix: 'gestionar-provincias', mod: 'Gestionar provincias' },
        { prefix: 'gestionar-parroquias', mod: 'Gestionar parroquias' },
        { prefix: 'gestionar-cantones', mod: 'Gestionar cantones' },
        { prefix: 'gestionar-competencias', mod: 'Gestionar competencias' },
        { prefix: 'gestionar-instituciones', mod: 'Gestionar instituciones' }
    ];

    moduleMapping.forEach(mapping => {
        const regex = new RegExp(`(path:\\s*'(?:${mapping.prefix})[^']*',[\\s\\S]*?canActivate:\\s*\\[adminGuard\\])`, 'g');
        content = content.replace(regex, `$1,\n        data: { requiredModule: '${mapping.mod}' }`);
    });

    content = content.replace(/canActivate:\s*\[adminGuard\],\s*data:/g, 'canActivate: [adminGuard, moduleGuard],\n        data:');

    fs.writeFileSync(frontendRoutesPath, content);
    console.log('Frontend routes updated.');
}

// Backend updates
const backendRoutesDir = 'C:/Users/ismae/Desktop/practicas/CnCApp/backend/src/infrastructure/web/routes';
const backendMapping = [
    { file: 'rol.routes.ts', mod: 'Gestionar roles' },
    { file: 'entidad.routes.ts', mod: 'Gestionar entidades' },
    { file: 'capacitacion.routes.ts', mod: 'Gestionar capacitaciones' },
    { file: 'competencia.routes.ts', mod: 'Gestionar competencias' },
    { file: 'institucion.routes.ts', mod: 'Gestionar instituciones' }
];

backendMapping.forEach(mapping => {
    const p = path.join(backendRoutesDir, mapping.file);
    if (fs.existsSync(p)) {
        let routeContent = fs.readFileSync(p, 'utf8');
        
        // Add import
        if (!routeContent.includes('requireModule')) {
            routeContent = routeContent.replace(/import { authenticate, authorize } from '\.\.\/middleware\/auth\.middleware';/, "import { authenticate, authorize, requireModule } from '../middleware/auth.middleware';");
        }
        
        // Replace globally
        routeContent = routeContent.replace(/router\.use\(authorize\(\.\.\.ADMIN_ROLES\)\);/g, `router.use(requireModule('${mapping.mod}'));`);
        
        fs.writeFileSync(p, routeContent);
        console.log(`Backend route updated: ${mapping.file}`);
    } else {
        console.log(`Backend route NOT found: ${mapping.file}`);
    }
});
