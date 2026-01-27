const registerUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
            }),
        });
        const data = await response.json();
        console.log('Register Response:', response.status, data);
        return data;
    } catch (error) {
        console.error('Register Error:', error);
    }
};

const loginUser = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123',
            }),
        });
        const data = await response.json();
        console.log('Login Response:', response.status, data);
    } catch (error) {
        console.error('Login Error:', error);
    }
};

const runTests = async () => {
    console.log('--- Starting Auth Tests ---');
    await registerUser();
    await loginUser();
    console.log('--- Tests Completed ---');
};

runTests();
