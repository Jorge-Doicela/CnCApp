
async function testRegistration() {
    const newUser = {
        ci: '0987654321',
        nombre: 'Usuario Prueba Registro',
        email: 'prueba_registro@test.com',
        password: 'Password123!',
        telefono: '0998877665'
    };

    try {
        console.log('Testing Registration...');
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        const data = await response.json();

        console.log('Status Code:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));

        if (response.status === 201 && data.success) {
            console.log('✅ Registration Successful!');
        } else if (response.status === 409) {
            console.log('⚠️ Registration Failed (Expected if user already exists):', data.message);
        } else {
            console.log('❌ Registration Failed');
        }
    } catch (error) {
        console.error('❌ Request Error:', error.message);
    }
}

testRegistration();
