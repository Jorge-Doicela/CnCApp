
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking user 1234567890...');
    const user = await prisma.usuario.findUnique({ where: { ci: '1234567890' } });

    if (!user) {
        console.log('❌ User NOT found in DB.');
    } else {
        console.log('✅ User FOUND in DB.');
        console.log('ID:', user.id);
        console.log('CI:', user.ci);
        console.log('Hash:', user.password);

        // Verify Check
        const valid = await bcrypt.compare('CncSecure2025!', user.password);
        console.log('Password verification result:', valid ? '✅ VALID' : '❌ INVALID');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
