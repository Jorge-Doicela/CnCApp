const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3005/api/auth/login', {
      ci: '1234567897',
      password: 'AdminPassword123!',
      recaptchaToken: 'dummy' // Skip verification if possible or check if it's required
    });
    console.log('--- LOGIN RESPONSE ---');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('--- LOGIN ERROR ---');
    if (error.response) {
      console.log(error.response.status, error.response.data);
    } else {
      console.log(error.message);
    }
  }
}

testLogin();
