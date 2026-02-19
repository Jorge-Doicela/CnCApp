
async function testAdminFlow() {
    const baseURL = 'http://localhost:3000/api';

    try {
        // 1. Login
        console.log('Attempting login...');
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ci: '1234567890',
                password: 'CncSecure2025!'
            })
        });

        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error('LOGIN FAILED:', loginData.message);
            return;
        }

        const token = loginData.data?.accessToken;
        console.log('LOGIN SUCCESS');

        // 2. Get Roles
        console.log('\nAttempting to fetch roles...');
        const rolesRes = await fetch(`${baseURL}/rol`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (rolesRes.status === 200) {
            const rolesData = await rolesRes.json();
            console.log('ROLES COUNT:', rolesData.length);
            if (rolesData.length > 0) {
                console.log('FIRST ROLE:', JSON.stringify(rolesData[0]));
            }
        } else {
            console.error('FAILED TO FETCH ROLES:', await rolesRes.text());
        }

        // 3. Get Provincias
        console.log('\nAttempting to fetch provincias...');
        const provRes = await fetch(`${baseURL}/provincias`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (provRes.status === 200) {
            const provData = await provRes.json();
            console.log('PROVINCIAS COUNT:', provData.length);
            if (provData.length > 0) {
                console.log('FIRST PROVINCIA:', JSON.stringify(provData[0]));
            }
        } else {
            console.error('FAILED TO FETCH PROVINCIAS:', await provRes.text());
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testAdminFlow();
