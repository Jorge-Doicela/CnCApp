const axios = require('axios');

async function testAdminFlow() {
    const baseURL = 'http://localhost:3000/api';

    try {
        // 1. Login
        console.log('Attempting login...');
        const loginResponse = await axios.post(`${baseURL}/auth/login`, {
            ci: '1234567890',
            password: 'CncSecure2025!'
        });

        console.log('Login Status:', loginResponse.status);
        console.log('Login Data:', JSON.stringify(loginResponse.data, null, 2));

        if (!loginResponse.data.success) {
            console.error('Login failed logic.');
            return;
        }

        const token = loginResponse.data.data.accessToken;
        const user = loginResponse.data.data.user;

        console.log('User Role:', user.rol);
        console.log('User Modules:', user.rol.modulos);

        // 2. Get Users
        console.log('\nAttempting to fetch users...');
        const usersResponse = await axios.get(`${baseURL}/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Get Users Status:', usersResponse.status);
        console.log('Users Count:', usersResponse.data.length);
        console.log('First User:', JSON.stringify(usersResponse.data[0], null, 2));

    } catch (error) {
        if (error.response) {
            console.error('Error Response:', error.response.status, error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAdminFlow();
