
const API_URL = 'http://localhost:3000/api';
const ADMIN_CI = '1234567890';
const ADMIN_PASS = 'CncSecure2025!';
const CONF_CI = '0987654321'; // Dr. Carlos Mendoza
const CONF_PASS = 'CncSecure2025!';

// Test Data
// Generate exactly 8 digits: 10000000 to 99999999
const uniqueId = Math.floor(10000000 + Math.random() * 90000000).toString();
const TEST_CITIZEN = {
    ci: `99${uniqueId}`, // 99 + 8 digits = 10 digits
    nombre: 'Test System Citizen',
    email: `test_citizen_${uniqueId}@system.com`,
    password: 'TestPassword123!',
    telefono: '0999999999',
    tipoParticipante: 2 // Ciudadano
};

const TEST_TRAINING = {
    nombre: `SYSTEM TEST TRAINING ${Date.now()}`,
    descripcion: 'Automated test training to verify system flow',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    lugar: 'Test Virtual Room',
    cuposDisponibles: 10,
    modalidad: 'Virtual',
    estado: 'Activa'
};

// Colors for console
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

// Helper for Fetch
async function api(path, method = 'GET', body, token) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const opts = { method, headers };
        if (body) opts.body = JSON.stringify(body);

        const res = await fetch(`${API_URL}${path}`, opts);
        const data = await res.json();

        return { status: res.status, data };
    } catch (error) {
        console.error(`${RED}❌ Network Error: ${error}${RESET}`);
        process.exit(1);
    }
}

async function step(name, fn) {
    process.stdout.write(`🔹 ${CYAN}${name}...${RESET} `);
    try {
        await fn();
        console.log(`${GREEN}✅ OK${RESET}`);
    } catch (e) {
        console.log(`${RED}❌ FAILED${RESET}`);
        console.error(`${RED}   Error: ${e.message}${RESET}`);
        process.exit(1);
    }
}

async function main() {
    console.log(`${YELLOW}==============================================${RESET}`);
    console.log(`${YELLOW}🚀 STARTING FULL SYSTEM VERIFICATION (JS)${RESET}`);
    console.log(`${YELLOW}==============================================${RESET}\n`);

    // State variables
    let adminToken = '';
    let citizenToken = '';
    let confToken = '';
    let trainingId = 0;
    let userId = 0;
    let qrCode = '';
    let enrollmentId = 0;

    // 1. HEALTH CHECK
    await step('Checking System Health', async () => {
        // Health check is at root /health, not /api/health
        const healthUrl = API_URL.replace('/api', '/health');
        const res = await fetch(healthUrl);
        if (res.status !== 200) throw new Error(`Health check failed: ${res.status}`);
    });

    // 2. ADMIN FLOW
    await step('Admin Login', async () => {
        const res = await api('/auth/login', 'POST', { ci: ADMIN_CI, password: ADMIN_PASS });
        // The API returns { success: true, data: { accessToken: ... } }
        if (res.status !== 200 || !res.data.data?.accessToken) throw new Error('Admin login failed');
        adminToken = res.data.data.accessToken;
    });

    await step('Admin Create Certification (Test)', async () => {
        // First, get a valid template
        const tplRes = await api('/plantillas', 'GET', null, adminToken);
        if (tplRes.status !== 200) throw new Error('Cannot fetch templates');
        const templates = Array.isArray(tplRes.data) ? tplRes.data : (tplRes.data.data || []);
        if (templates.length === 0) throw new Error('No templates found in system for training creation');

        TEST_TRAINING.plantillaId = templates[0].id;
        console.log(`   (Using Template ID: ${TEST_TRAINING.plantillaId})`);

        const res = await api('/capacitaciones', 'POST', TEST_TRAINING, adminToken);
        if (res.status !== 201) throw new Error(`Create training failed: ${JSON.stringify(res.data)}`);
        trainingId = res.data.id || res.data.data?.id;
        if (!trainingId) throw new Error('Training ID not returned');
    });

    // 3. CITIZEN FLOW (Register & Login)
    await step('Citizen Registration', async () => {
        console.log(`   (CI: ${TEST_CITIZEN.ci})`);
        const res = await api('/auth/register', 'POST', TEST_CITIZEN);
        if (res.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    });

    await step('Citizen Login', async () => {
        const res = await api('/auth/login', 'POST', { ci: TEST_CITIZEN.ci, password: TEST_CITIZEN.password });
        if (res.status !== 200) throw new Error('Citizen login failed');
        citizenToken = res.data.data.accessToken;
        userId = res.data.data.user.id;
    });

    await step('Citizen Profile Check', async () => {
        const res = await api('/auth/profile', 'GET', null, citizenToken);
        if (res.status !== 200) throw new Error('Profile fetch failed');
        // Profile returns { success: true, data: user }
        if (res.data.data.email !== TEST_CITIZEN.email) throw new Error('Profile data mismatch');
    });

    await step('Citizen Fetch Provinces Catalog', async () => {
        const res = await api('/provincias', 'GET', null, citizenToken);
        if (res.status !== 200) throw new Error('Fetch provinces failed');
        const list = Array.isArray(res.data) ? res.data : res.data.data;
        if (!Array.isArray(list) || list.length === 0) throw new Error('No provinces found');
    });

    // 4. ENROLLMENT FLOW
    await step('Citizen Enrollment', async () => {
        const res = await api('/usuarios-capacitaciones', 'POST', {
            Id_Usuario: userId,
            Id_Capacitacion: trainingId
        }, citizenToken);
        if (res.status !== 201) throw new Error(`Enrollment failed: ${JSON.stringify(res.data)}`);
        enrollmentId = res.data.id || res.data.data?.id;
    });

    // 5. CONFERENCISTA FLOW (Check Access)
    await step('Conferencista Login', async () => {
        const res = await api('/auth/login', 'POST', { ci: CONF_CI, password: CONF_PASS });
        if (res.status !== 200) throw new Error('Speaker login failed (Check seed data for CONF_CI)');
        confToken = res.data.data.accessToken;
    });

    await step('Conferencista Dashboard Access', async () => {
        const res = await api('/capacitaciones', 'GET', null, confToken);
        if (res.status !== 200) throw new Error('Speaker cannot fetch trainings');
    });


    // 6. CERTIFICATE FLOW
    await step('Admin Verifies Enrollment', async () => {
        const res = await api(`/usuarios-capacitaciones/${trainingId}`, 'GET', null, adminToken);
        if (res.status !== 200) throw new Error('Admin cannot list enrollments');

        const enrollments = Array.isArray(res.data) ? res.data : (res.data.data || []);

        const enrollment = enrollments.find((e) => e.usuarioId === userId);
        if (!enrollment) throw new Error('Enrollment not found in Admin list');
        enrollmentId = enrollment.id; // Confirm ID
    });

    await step('Admin Marks Attendance & Finalizes', async () => {
        const res = await api(`/usuarios-capacitaciones/asistencia/${enrollmentId}`, 'PUT', {
            estadoInscripcion: 'Finalizada',
            asistio: true,
            nota: 10
        }, adminToken);

        if (res.status !== 200) throw new Error(`Update status failed: ${JSON.stringify(res.data)}`);
    });

    await step('Admin Generates Certificate', async () => {
        const res = await api('/certificados/generate', 'POST', {
            usuarioId: userId,
            capacitacionId: trainingId
        }, adminToken);

        if (res.status !== 201) throw new Error(`Certificate generation failed: ${JSON.stringify(res.data)}`);
        qrCode = res.data.codigoQR || res.data.data?.codigoQR;
    });

    await step('Citizen Sees Certificate', async () => {
        const res = await api('/certificados/my', 'GET', null, citizenToken);
        if (res.status !== 200) throw new Error('Cannot fetch my certificates');
        const list = Array.isArray(res.data) ? res.data : res.data.data;
        const cert = list.find((c) => c.capacitacionId === trainingId);
        if (!cert) throw new Error('Certificate not found in user profile');
    });

    // 7. CLEANUP
    await step('Cleanup (Delete Test Data)', async () => {
        const res1 = await api(`/capacitaciones/${trainingId}`, 'DELETE', null, adminToken);
        const res2 = await api(`/users/${userId}`, 'DELETE', null, adminToken);

        if (res1.status !== 200 || res2.status !== 200) console.warn(`${YELLOW}⚠️ Warning: Cleanup incomplete${RESET}`);
    });

    console.log(`\n${GREEN}✅ ALL SYSTEMS GO! The system is fully operational.${RESET}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
