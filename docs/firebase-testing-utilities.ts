// Firebase Testing Utilities
// Use these utilities to test and debug your Firebase Realtime Database

import { ref, get, set, push, update, remove, query, orderByChild, equalTo, onValue, off } from 'firebase/database';
import { database, auth } from '../src/lib/firebase';

// 1. Connection Test Utilities
export const testFirebaseConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing Firebase connection...');
    
    // Test basic connectivity
    const connectedRef = ref(database, '.info/connected');
    const snapshot = await get(connectedRef);
    const isConnected = snapshot.val();
    
    console.log(isConnected ? '✅ Firebase connected' : '❌ Firebase disconnected');
    return isConnected;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

export const monitorConnection = (): () => void => {
  console.log('🔄 Starting connection monitor...');
  
  const connectedRef = ref(database, '.info/connected');
  const unsubscribe = onValue(connectedRef, (snapshot) => {
    const isConnected = snapshot.val();
    console.log(`🔗 Connection status: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
    console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  });

  return () => {
    console.log('🔄 Stopping connection monitor...');
    off(connectedRef, 'value', unsubscribe);
  };
};

// 2. Authentication Test Utilities
export const testAuthentication = (): void => {
  console.log('🔄 Testing authentication...');
  
  const user = auth.currentUser;
  if (user) {
    console.log('✅ User authenticated:');
    console.log('  - UID:', user.uid);
    console.log('  - Email:', user.email);
    console.log('  - Display Name:', user.displayName);
  } else {
    console.log('❌ No authenticated user');
  }
};

export const waitForAuth = (): Promise<any> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// 3. Database Rules Test Utilities
export const testDatabaseRules = async (): Promise<void> => {
  console.log('🔄 Testing database rules...');
  
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('❌ Cannot test rules: No authenticated user');
      return;
    }

    const testRef = ref(database, `test/${user.uid}`);
    const testData = {
      message: 'Rule test',
      timestamp: Date.now(),
      userId: user.uid
    };

    // Test write permission
    await set(testRef, testData);
    console.log('✅ Write permission granted');

    // Test read permission
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log('✅ Read permission granted');
      console.log('📄 Test data:', snapshot.val());
    }

    // Clean up
    await remove(testRef);
    console.log('🧹 Test data cleaned up');

  } catch (error) {
    console.error('❌ Database rules test failed:', error);
    console.error('💡 Possible issues:');
    console.error('   - User not authenticated');
    console.error('   - Database rules too restrictive');
    console.error('   - Network connectivity issues');
  }
};

// 4. CRUD Operation Test Utilities
export const testCRUDOperations = async (): Promise<void> => {
  console.log('🚀 Starting CRUD operations test...');
  
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Cannot test CRUD: No authenticated user');
    return;
  }

  let testClientId: string | null = null;

  try {
    // CREATE Test
    console.log('🧪 Testing CREATE operation...');
    const clientsRef = ref(database, 'clients');
    const testClient = {
      name: 'Test Client',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Company',
      category: 'Web Development',
      status: 'active',
      userId: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const createResult = await push(clientsRef, testClient);
    testClientId = createResult.key;
    console.log('✅ CREATE successful. ID:', testClientId);

    // READ Test (single)
    console.log('🧪 Testing READ operation (single)...');
    const clientRef = ref(database, `clients/${testClientId}`);
    const readSnapshot = await get(clientRef);
    
    if (readSnapshot.exists()) {
      console.log('✅ READ (single) successful:', readSnapshot.val());
    } else {
      console.log('❌ READ (single) failed: No data found');
    }

    // READ Test (query)
    console.log('🧪 Testing READ operation (query)...');
    const queryRef = query(clientsRef, orderByChild('userId'), equalTo(user.uid));
    const querySnapshot = await get(queryRef);
    
    if (querySnapshot.exists()) {
      console.log('✅ READ (query) successful. Count:', querySnapshot.size);
    } else {
      console.log('❌ READ (query) failed: No data found');
    }

    // UPDATE Test
    console.log('🧪 Testing UPDATE operation...');
    const updates = {
      name: 'Updated Test Client',
      updatedAt: new Date().toISOString()
    };
    
    await update(clientRef, updates);
    console.log('✅ UPDATE successful');

    // Verify update
    const verifySnapshot = await get(clientRef);
    if (verifySnapshot.exists()) {
      const data = verifySnapshot.val();
      console.log('✅ Update verified. New name:', data.name);
    }

    // DELETE Test
    console.log('🧪 Testing DELETE operation...');
    await remove(clientRef);
    console.log('✅ DELETE successful');

    // Verify deletion
    const deleteVerifySnapshot = await get(clientRef);
    if (!deleteVerifySnapshot.exists()) {
      console.log('✅ Deletion verified');
    } else {
      console.log('❌ Deletion verification failed');
    }

    console.log('🎉 All CRUD tests passed!');

  } catch (error) {
    console.error('💥 CRUD test failed:', error);
    
    // Clean up on error
    if (testClientId) {
      try {
        const cleanupRef = ref(database, `clients/${testClientId}`);
        await remove(cleanupRef);
        console.log('🧹 Cleaned up test data after error');
      } catch (cleanupError) {
        console.error('❌ Failed to clean up test data:', cleanupError);
      }
    }
  }
};

// 5. Performance Test Utilities
export const testDatabasePerformance = async (): Promise<void> => {
  console.log('⚡ Testing database performance...');
  
  const user = auth.currentUser;
  if (!user) {
    console.log('❌ Cannot test performance: No authenticated user');
    return;
  }

  try {
    const testRef = ref(database, `performance-test/${user.uid}`);
    const testData = { timestamp: Date.now(), data: 'performance test' };

    // Test write performance
    const writeStart = performance.now();
    await set(testRef, testData);
    const writeEnd = performance.now();
    console.log(`✅ Write operation: ${(writeEnd - writeStart).toFixed(2)}ms`);

    // Test read performance
    const readStart = performance.now();
    const snapshot = await get(testRef);
    const readEnd = performance.now();
    console.log(`✅ Read operation: ${(readEnd - readStart).toFixed(2)}ms`);

    // Clean up
    await remove(testRef);
    console.log('🧹 Performance test data cleaned up');

  } catch (error) {
    console.error('❌ Performance test failed:', error);
  }
};

// 6. Data Validation Utilities
export const validateDataStructure = async (collection: string): Promise<void> => {
  console.log(`🔍 Validating data structure for: ${collection}`);
  
  try {
    const collectionRef = ref(database, collection);
    const snapshot = await get(collectionRef);
    
    if (!snapshot.exists()) {
      console.log(`ℹ️ No data found in ${collection}`);
      return;
    }

    const data = snapshot.val();
    const entries = Object.entries(data);
    
    console.log(`📊 ${collection} collection stats:`);
    console.log(`  - Total entries: ${entries.length}`);
    
    // Validate structure of first few entries
    const sampleSize = Math.min(3, entries.length);
    for (let i = 0; i < sampleSize; i++) {
      const [key, value] = entries[i];
      console.log(`  - Entry ${i + 1} (${key}):`, Object.keys(value as object));
    }

    // Check for required fields based on collection
    const requiredFields = getRequiredFields(collection);
    const missingFields = entries.filter(([key, value]) => {
      const obj = value as any;
      return requiredFields.some(field => !(field in obj));
    });

    if (missingFields.length > 0) {
      console.log(`⚠️ Entries with missing required fields: ${missingFields.length}`);
    } else {
      console.log(`✅ All entries have required fields`);
    }

  } catch (error) {
    console.error(`❌ Data validation failed for ${collection}:`, error);
  }
};

const getRequiredFields = (collection: string): string[] => {
  const fieldMap: { [key: string]: string[] } = {
    clients: ['name', 'email', 'phone', 'company', 'category', 'status', 'userId'],
    projects: ['title', 'description', 'clientId', 'status', 'priority', 'startDate', 'endDate', 'budget', 'progress', 'userId'],
    meetings: ['title', 'description', 'clientId', 'date', 'duration', 'status', 'userId']
  };
  
  return fieldMap[collection] || [];
};

// 7. Comprehensive Test Suite
export const runFullTestSuite = async (): Promise<void> => {
  console.log('🚀 Starting comprehensive Firebase test suite...');
  console.log('=' .repeat(50));
  
  try {
    // 1. Connection Test
    console.log('\n1️⃣ Testing Connection...');
    const isConnected = await testFirebaseConnection();
    if (!isConnected) {
      console.log('❌ Stopping tests: No database connection');
      return;
    }

    // 2. Authentication Test
    console.log('\n2️⃣ Testing Authentication...');
    testAuthentication();
    
    const user = await waitForAuth();
    if (!user) {
      console.log('❌ Stopping tests: No authenticated user');
      return;
    }

    // 3. Database Rules Test
    console.log('\n3️⃣ Testing Database Rules...');
    await testDatabaseRules();

    // 4. CRUD Operations Test
    console.log('\n4️⃣ Testing CRUD Operations...');
    await testCRUDOperations();

    // 5. Performance Test
    console.log('\n5️⃣ Testing Performance...');
    await testDatabasePerformance();

    // 6. Data Validation
    console.log('\n6️⃣ Validating Data Structure...');
    await validateDataStructure('clients');
    await validateDataStructure('projects');
    await validateDataStructure('meetings');

    console.log('\n🎉 All tests completed successfully!');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n💥 Test suite failed:', error);
    console.log('=' .repeat(50));
  }
};

// 8. Quick Debug Functions (for browser console)
export const quickDebug = {
  // Check current state
  status: () => {
    console.log('🔍 Firebase Status Check:');
    console.log('  - App:', database.app.name);
    console.log('  - Database URL:', database.app.options.databaseURL);
    console.log('  - Auth User:', auth.currentUser?.email || 'Not authenticated');
    console.log('  - Online:', navigator.onLine);
  },

  // Test basic operations
  testWrite: async () => {
    const testRef = ref(database, 'debug-test');
    await set(testRef, { test: true, timestamp: Date.now() });
    console.log('✅ Write test successful');
  },

  testRead: async () => {
    const testRef = ref(database, 'debug-test');
    const snapshot = await get(testRef);
    console.log('📖 Read test result:', snapshot.val());
  },

  cleanup: async () => {
    const testRef = ref(database, 'debug-test');
    await remove(testRef);
    console.log('🧹 Debug data cleaned up');
  }
};

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).firebaseDebug = {
    testConnection: testFirebaseConnection,
    testAuth: testAuthentication,
    testRules: testDatabaseRules,
    testCRUD: testCRUDOperations,
    testPerformance: testDatabasePerformance,
    validateData: validateDataStructure,
    runFullSuite: runFullTestSuite,
    quick: quickDebug
  };
  
  console.log('🛠️ Firebase debug utilities loaded. Use window.firebaseDebug to access them.');
}