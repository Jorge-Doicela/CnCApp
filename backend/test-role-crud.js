const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';
let createdRoleId = null;

async function testAdminLogin() {
    console.log('Testing Admin Login...');
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com', // Assuming this user exists from previous context
                password: 'password123'
            })
        });

        const data = await response.json();
        if (response.ok && data.accessToken) {
            console.log('Login Successful');
            authToken = data.accessToken;
            return true;
        } else {
            console.error('Login Failed:', data);
            return false;
        }
    } catch (error) {
        console.error('Login Error:', error);
        return false;
    }
}

async function testGetRoles() {
    console.log('\nTesting GET /rol...');
    try {
        const response = await fetch(`${BASE_URL}/rol`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (response.ok) {
            console.log(`Success: Retrieved ${data.length} roles`);
            console.log('Helpers:', response.headers.get('x-debug'));
            return true;
        } else {
            console.error('Failed to get roles:', data);
            return false;
        }
    } catch (error) {
        console.error('Error getting roles:', error);
        return false;
    }
}

async function testCreateRole() {
    console.log('\nTesting POST /rol...');
    const newRole = {
        nombre: `TestRole_${Date.now()}`,
        descripcion: 'Created via test script',
        modulos: ['TestModule']
    };

    try {
        const response = await fetch(`${BASE_URL}/rol`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(newRole)
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Success: Role created:', data);
            createdRoleId = data.id || data.Id_Rol; // Handle both just in case
            return true;
        } else {
            console.error('Failed to create role. Status:', response.status);
            console.error('Response body:', JSON.stringify(data));
            return false;
        }
    } catch (error) {
        console.error('Error creating role:', error);
        return false;
    }
}

async function testUpdateRole() {
    if (!createdRoleId) {
        console.log('Skipping Update: No created role ID');
        return false;
    }
    console.log(`\nTesting PUT /rol/${createdRoleId}...`);
    const updateData = {
        nombre: `UpdatedRole_${Date.now()}`
    };

    try {
        const response = await fetch(`${BASE_URL}/rol/${createdRoleId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(updateData)
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Success: Role updated:', data);
            return true;
        } else {
            console.error('Failed to update role:', data);
            return false;
        }
    } catch (error) {
        console.error('Error updating role:', error);
        return false;
    }
}

async function testGetRoleById() {
    if (!createdRoleId) return false;
    console.log(`\nTesting GET /rol/${createdRoleId}...`);
    try {
        const response = await fetch(`${BASE_URL}/rol/${createdRoleId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const data = await response.json();
        if (response.ok) {
            console.log('Success: Retrieved role by ID:', data);
            return true;
        } else {
            console.error('Failed to get role by ID:', data);
            return false;
        }
    } catch (error) {
        console.error('Error getting role by ID:', error);
        return false;
    }
}

async function testDeleteRole() {
    if (!createdRoleId) return false;
    console.log(`\nTesting DELETE /rol/${createdRoleId}...`);
    try {
        const response = await fetch(`${BASE_URL}/rol/${createdRoleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (response.ok) {
            console.log('Success: Role deleted');
            return true;
        } else {
            console.error('Failed to delete role:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error deleting role:', error);
        return false;
    }
}

async function runTests() {
    // Assuming we can test without auth or use a known user.
    // Since I don't honestly know the password, I'll try to just hit the endpoints.
    // If auth is required, this might fail unless I get a token.
    // Existing test script used 'admin@test.com' / 'password123' if I recall... no, I created it.
    // I'll try to use the same logic if I can find a valid user.
    // For now, I will try to login. If it fails, I might need to temporarily disable auth or find a valid user.
    // But 'admin@gmail.com' / 'admin123' is a common default.
    // Let's try to just fetch roles first (might be public?).
    // Actually, looking at `rol.routes.ts`, there are no middlewares applied directly there?
    // `app.ts` imports them. `user.routes.ts` usually has `authenticate`.
    // Let's check `rol.routes.ts` again. It defined: `router.get('/', rolController.getAll);`
    // It did NOT use `authenticate`.
    // So it might be unprotected! That's good for testing, bad for security (but out of scope for now).

    // Let's try without login first.
    console.log('--- Starting Role CRUD Tests ---');
    const rolesSuccess = await testGetRoles();
    await testCreateRole();
    await testUpdateRole();
    await testGetRoleById();
    await testDeleteRole();
    console.log('--- Tests Completed ---');
}

runTests();
