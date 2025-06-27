const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing Smart Task Management Backend...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: User Registration
    console.log('2. Testing User Registration...');
    const registerData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    };

    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
      console.log('✅ User Registration:', registerResponse.data.message);
      const token = registerResponse.data.token;
      console.log('');

      // Test 3: User Login
      console.log('3. Testing User Login...');
      const loginData = {
        identifier: 'testuser',
        password: 'password123'
      };

      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
      console.log('✅ User Login:', loginResponse.data.message);
      console.log('');

      // Test 4: Get Current User
      console.log('4. Testing Get Current User...');
      const userResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Current User:', userResponse.data.user.username);
      console.log('');

      // Test 5: Create Task
      console.log('5. Testing Task Creation...');
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        category: 'Testing',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'medium'
      };

      const taskResponse = await axios.post(`${BASE_URL}/tasks`, taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Task Created:', taskResponse.data.data.title);
      const taskId = taskResponse.data.data._id;
      console.log('');

      // Test 6: Get Tasks
      console.log('6. Testing Get Tasks...');
      const tasksResponse = await axios.get(`${BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Tasks Retrieved:', tasksResponse.data.data.length, 'tasks');
      console.log('');

      // Test 7: Get Dashboard Data
      console.log('7. Testing Dashboard Data...');
      const dashboardResponse = await axios.get(`${BASE_URL}/tasks/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Dashboard Data Retrieved');
      console.log('   - Tasks Due Today:', dashboardResponse.data.data.tasksDueToday.length);
      console.log('   - Overdue Tasks:', dashboardResponse.data.data.overdueTasks.length);
      console.log('   - Upcoming Tasks:', dashboardResponse.data.data.upcomingTasks.length);
      console.log('');

      // Test 8: Update Task
      console.log('8. Testing Task Update...');
      const updateData = {
        title: 'Updated Test Task',
        status: 'in-progress'
      };

      const updateResponse = await axios.put(`${BASE_URL}/tasks/${taskId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Task Updated:', updateResponse.data.data.title);
      console.log('');

      // Test 9: Complete Task
      console.log('9. Testing Task Completion...');
      const completeResponse = await axios.post(`${BASE_URL}/tasks/${taskId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Task Completed:', completeResponse.data.message);
      console.log('');

      // Test 10: Delete Task
      console.log('10. Testing Task Deletion...');
      const deleteResponse = await axios.delete(`${BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Task Deleted:', deleteResponse.data.message);
      console.log('');

      console.log('🎉 All Backend Tests Passed Successfully!');
      console.log('\n📋 Test Summary:');
      console.log('   ✅ Health Check');
      console.log('   ✅ User Registration');
      console.log('   ✅ User Login');
      console.log('   ✅ Get Current User');
      console.log('   ✅ Task Creation');
      console.log('   ✅ Get Tasks');
      console.log('   ✅ Dashboard Data');
      console.log('   ✅ Task Update');
      console.log('   ✅ Task Completion');
      console.log('   ✅ Task Deletion');

    } catch (error) {
      console.log('❌ Test Failed:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.log('❌ Backend Connection Failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   1. MongoDB is running on localhost:27017');
    console.log('   2. Backend server is running on port 5000');
    console.log('   3. All dependencies are installed (npm install)');
  }
}

// Run the test
testBackend(); 