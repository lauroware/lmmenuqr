const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
  try {
    // Test basic connection
    console.log('Testing API connection...');
    const response = await axios.get(`${API_URL.replace('/api', '')}`);
    console.log('✅ API is running:', response.data);

    // Test admin registration
    console.log('\nTesting admin registration...');
    const registerResponse = await axios.post(`${API_URL}/admin/register`, {
      name: 'Test Admin',
      email: 'test@example.com',
      password: 'password123',
      restaurantName: 'Test Restaurant',
      phone: '+1234567890'
    });
    console.log('✅ Admin registered:', registerResponse.data);

    // Test login
    console.log('\nTesting admin login...');
    const loginResponse = await axios.post(`${API_URL}/admin/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Admin logged in:', loginResponse.data);

    const token = loginResponse.data.token;

    // Test menu creation
    console.log('\nTesting menu creation...');
    const menuResponse = await axios.post(`${API_URL}/menu`, {
      restaurantName: 'Test Restaurant'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Menu created:', menuResponse.data);

    // Test menu item creation
    console.log('\nTesting menu item creation...');
    const menuItemResponse = await axios.post(`${API_URL}/menu/items`, {
      name: 'Test Item',
      description: 'Test description',
      price: 9.99,
      category: 'Main Course',
      tags: ['Test', 'Spicy'],
      available: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Menu item created:', menuItemResponse.data);

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message);
  }
}

testAPI();
