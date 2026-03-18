const fetch = require('node-fetch');

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ci: '1234567897',
        password: 'AdminPassword123!',
        recaptchaToken: 'dummy'
      })
    });
    const data = await response.json();
    console.log('--- LOGIN RESPONSE (HTTP ' + response.status + ') ---');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('--- LOGIN ERROR ---');
    console.log(error.message);
  }
}

testLogin();
