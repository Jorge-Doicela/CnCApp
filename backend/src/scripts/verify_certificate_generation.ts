
async function verify() {
    console.log('--- SCRIPT START ---');
    const fs = await import('fs');
    try {
        fs.writeFileSync('GHOST_FILE.txt', 'I was here at ' + new Date().toISOString());
        console.log('GHOST_FILE.txt written');
        await import('reflect-metadata');
        console.log('reflect-metadata loaded');

        const { container } = await import('tsyringe');
        console.log('tsyringe loaded');

        await import('../config/di.container');
        console.log('di.container loaded');

        const { GenerateCertificadoUseCase } = await import('../application/certificado/use-cases/generate-certificado.use-case');
        console.log('UseCase loaded');

        const { default: prisma } = await import('../config/database');
        console.log('Prisma loaded');

        console.log('Starting Certificate Generation Verification...');

        // 1. Find a valid Usuario and Capacitacion with Plantilla
        const capacitacion = await prisma.capacitacion.findFirst({
            where: { plantillaId: { not: null } },
            include: { plantilla: true }
        });

        if (!capacitacion) {
            console.error('No capacitacion found with a template assigned.');

            const plantilla = await prisma.plantilla.findFirst();
            const cap = await prisma.capacitacion.findFirst();

            if (plantilla && cap) {
                console.log('Assigning plantilla to capacitacion for test...');
                await prisma.capacitacion.update({
                    where: { id: cap.id },
                    data: { plantillaId: plantilla.id }
                });
                console.log('Assigned. Restarting test...');
                return verify();
            } else {
                console.error('Cannot set up test data. Missing plantilla or capacitacion.');
                return;
            }
        }
        console.log(`Found Capacitacion: ${capacitacion.nombre} (ID: ${capacitacion.id})`);

        const usuario = await prisma.usuario.findFirst();
        if (!usuario) {
            console.error('No usuario found.');
            return;
        }
        console.log(`Found Usuario: ${usuario.nombre} (ID: ${usuario.id})`);

        // 2. Resolve Use Case
        const generateUseCase = container.resolve(GenerateCertificadoUseCase);

        // 3. Execute
        console.log('Generating certificate...');
        const certificado = await generateUseCase.execute(usuario.id, capacitacion.id);

        console.log('Certificate generated successfully!');
        console.log('PDF URL:', certificado.pdfUrl);
        console.log('QR Code:', certificado.codigoQR);

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verify();
