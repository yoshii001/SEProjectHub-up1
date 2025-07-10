# Firebase Realtime Database Mobile Implementation Guide

## React Native Setup

### 1. Installation

```bash
# Install Firebase for React Native
npm install @react-native-firebase/app @react-native-firebase/database @react-native-firebase/auth

# For iOS
cd ios && pod install
```

### 2. Configuration

#### Android Configuration
```javascript
// android/app/src/main/java/.../MainApplication.java
import io.invertase.firebase.database.ReactNativeFirebaseDatabasePackage;

@Override
protected List<ReactPackage> getPackages() {
  return Arrays.<ReactPackage>asList(
    new MainReactPackage(),
    new ReactNativeFirebaseDatabasePackage(),
    // ... other packages
  );
}
```

#### iOS Configuration
```javascript
// ios/Podfile
pod 'Firebase/Database'
```

### 3. Mobile-Specific Firebase Setup

```javascript
// src/lib/firebase.native.ts
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

// Test connection
const testMobileConnection = async () => {
  try {
    const connectedRef = database().ref('.info/connected');
    connectedRef.on('value', (snapshot) => {
      if (snapshot.val() === true) {
        console.log('✅ Connected to Firebase (Mobile)');
      } else {
        console.log('❌ Disconnected from Firebase (Mobile)');
      }
    });
  } catch (error) {
    console.error('❌ Mobile connection test failed:', error);
  }
};

export { database, auth, testMobileConnection };
```

### 4. Mobile CRUD Operations

```javascript
// src/hooks/useClientsMobile.ts
import { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

export const useClientsMobile = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('📱 Setting up mobile clients listener');
    
    const clientsRef = database().ref('clients');
    const query = clientsRef.orderByChild('userId').equalTo(user.uid);

    const onValueChange = query.on('value', (snapshot) => {
      console.log('📱 Mobile clients data received');
      const clientsData = [];
      
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          clientsData.push({
            id: childSnapshot.key,
            ...childSnapshot.val()
          });
        });
      }
      
      setClients(clientsData);
      setLoading(false);
    });

    // Cleanup
    return () => {
      console.log('📱 Cleaning up mobile clients listener');
      query.off('value', onValueChange);
    };
  }, []);

  const addClient = async (clientData) => {
    const user = auth().currentUser;
    if (!user) return;

    try {
      console.log('📱 Adding client (mobile):', clientData.name);
      
      const clientsRef = database().ref('clients');
      const newClientData = {
        ...clientData,
        userId: user.uid,
        createdAt: database.ServerValue.TIMESTAMP,
        updatedAt: database.ServerValue.TIMESTAMP
      };

      await clientsRef.push(newClientData);
      console.log('✅ Mobile client added successfully');
      
    } catch (error) {
      console.error('❌ Mobile add client error:', error);
      throw error;
    }
  };

  return { clients, loading, addClient };
};
```

### 5. Mobile-Specific Error Handling

```javascript
// src/utils/mobileErrorHandler.ts
import { Alert } from 'react-native';
import NetInfo from '@react-native-netinfo/netinfo';

export const handleMobileFirebaseError = (error) => {
  console.error('📱 Mobile Firebase Error:', error);
  
  switch (error.code) {
    case 'database/permission-denied':
      Alert.alert(
        'Permission Denied',
        'You do not have permission to access this data. Please check your authentication.',
        [{ text: 'OK' }]
      );
      break;
      
    case 'database/network-error':
      Alert.alert(
        'Network Error',
        'Unable to connect to the database. Please check your internet connection.',
        [
          { text: 'Cancel' },
          { text: 'Retry', onPress: () => checkNetworkAndRetry() }
        ]
      );
      break;
      
    case 'database/disconnected':
      Alert.alert(
        'Connection Lost',
        'Connection to the database was lost. The app will retry automatically.',
        [{ text: 'OK' }]
      );
      break;
      
    default:
      Alert.alert(
        'Database Error',
        error.message || 'An unexpected error occurred.',
        [{ text: 'OK' }]
      );
  }
};

const checkNetworkAndRetry = async () => {
  const netInfo = await NetInfo.fetch();
  
  if (netInfo.isConnected) {
    console.log('📱 Network available, retrying...');
    // Retry your operation here
  } else {
    Alert.alert(
      'No Internet',
      'Please check your internet connection and try again.',
      [{ text: 'OK' }]
    );
  }
};
```

### 6. Mobile Offline Support

```javascript
// src/hooks/useOfflineSupport.ts
import { useState, useEffect } from 'react';
import database from '@react-native-firebase/database';
import NetInfo from '@react-native-netinfo/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingOperations, setPendingOperations] = useState([]);

  useEffect(() => {
    // Enable offline persistence
    database().setPersistenceEnabled(true);
    
    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('📱 Network state changed:', state.isConnected);
      setIsOnline(state.isConnected);
      
      if (state.isConnected) {
        processPendingOperations();
      }
    });

    // Load pending operations from storage
    loadPendingOperations();

    return () => unsubscribe();
  }, []);

  const addPendingOperation = async (operation) => {
    const operations = [...pendingOperations, operation];
    setPendingOperations(operations);
    await AsyncStorage.setItem('pendingOperations', JSON.stringify(operations));
  };

  const loadPendingOperations = async () => {
    try {
      const stored = await AsyncStorage.getItem('pendingOperations');
      if (stored) {
        setPendingOperations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('📱 Failed to load pending operations:', error);
    }
  };

  const processPendingOperations = async () => {
    if (pendingOperations.length === 0) return;

    console.log('📱 Processing pending operations:', pendingOperations.length);
    
    for (const operation of pendingOperations) {
      try {
        await executeOperation(operation);
        console.log('✅ Pending operation completed:', operation.type);
      } catch (error) {
        console.error('❌ Pending operation failed:', error);
      }
    }

    setPendingOperations([]);
    await AsyncStorage.removeItem('pendingOperations');
  };

  const executeOperation = async (operation) => {
    const { type, path, data } = operation;
    const ref = database().ref(path);

    switch (type) {
      case 'set':
        await ref.set(data);
        break;
      case 'update':
        await ref.update(data);
        break;
      case 'push':
        await ref.push(data);
        break;
      case 'remove':
        await ref.remove();
        break;
    }
  };

  return {
    isOnline,
    addPendingOperation,
    pendingOperationsCount: pendingOperations.length
  };
};
```

## Flutter Setup

### 1. Installation

```yaml
# pubspec.yaml
dependencies:
  firebase_core: ^2.15.1
  firebase_database: ^10.2.5
  firebase_auth: ^4.7.3
```

### 2. Configuration

```dart
// lib/services/firebase_service.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_auth/firebase_auth.dart';

class FirebaseService {
  static FirebaseDatabase? _database;
  static FirebaseAuth? _auth;

  static Future<void> initialize() async {
    await Firebase.initializeApp();
    _database = FirebaseDatabase.instance;
    _auth = FirebaseAuth.instance;
    
    // Enable offline persistence
    _database!.setPersistenceEnabled(true);
    
    print('✅ Firebase initialized (Flutter)');
  }

  static FirebaseDatabase get database => _database!;
  static FirebaseAuth get auth => _auth!;
}
```

### 3. Flutter CRUD Operations

```dart
// lib/services/client_service.dart
import 'package:firebase_database/firebase_database.dart';
import 'firebase_service.dart';

class ClientService {
  final DatabaseReference _clientsRef = FirebaseService.database.ref('clients');

  Stream<List<Client>> getClients(String userId) {
    print('📱 Setting up Flutter clients stream');
    
    return _clientsRef
        .orderByChild('userId')
        .equalTo(userId)
        .onValue
        .map((event) {
      final data = event.snapshot.value as Map<dynamic, dynamic>?;
      
      if (data == null) {
        print('📱 No clients data found');
        return <Client>[];
      }

      print('📱 Flutter clients data received: ${data.length}');
      
      return data.entries.map((entry) {
        return Client.fromMap(entry.key, entry.value);
      }).toList();
    });
  }

  Future<void> addClient(Client client) async {
    try {
      print('📱 Adding client (Flutter): ${client.name}');
      
      final clientData = client.toMap();
      clientData['createdAt'] = ServerValue.timestamp;
      clientData['updatedAt'] = ServerValue.timestamp;
      
      await _clientsRef.push().set(clientData);
      print('✅ Flutter client added successfully');
      
    } catch (error) {
      print('❌ Flutter add client error: $error');
      rethrow;
    }
  }

  Future<void> updateClient(String clientId, Map<String, dynamic> updates) async {
    try {
      print('📱 Updating client (Flutter): $clientId');
      
      updates['updatedAt'] = ServerValue.timestamp;
      await _clientsRef.child(clientId).update(updates);
      
      print('✅ Flutter client updated successfully');
    } catch (error) {
      print('❌ Flutter update client error: $error');
      rethrow;
    }
  }

  Future<void> deleteClient(String clientId) async {
    try {
      print('📱 Deleting client (Flutter): $clientId');
      await _clientsRef.child(clientId).remove();
      print('✅ Flutter client deleted successfully');
    } catch (error) {
      print('❌ Flutter delete client error: $error');
      rethrow;
    }
  }
}
```

### 4. Flutter Error Handling

```dart
// lib/utils/error_handler.dart
import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';

class FirebaseErrorHandler {
  static void handleError(BuildContext context, dynamic error) {
    print('📱 Flutter Firebase Error: $error');
    
    String title = 'Error';
    String message = 'An unexpected error occurred.';
    
    if (error is FirebaseException) {
      switch (error.code) {
        case 'permission-denied':
          title = 'Permission Denied';
          message = 'You do not have permission to access this data.';
          break;
        case 'network-error':
          title = 'Network Error';
          message = 'Unable to connect to the database. Please check your internet connection.';
          break;
        case 'disconnected':
          title = 'Connection Lost';
          message = 'Connection to the database was lost. The app will retry automatically.';
          break;
        default:
          message = error.message ?? 'An unexpected error occurred.';
      }
    }
    
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('OK'),
            ),
          ],
        );
      },
    );
  }
}
```

## Mobile Testing Utilities

### React Native Testing

```javascript
// __tests__/firebase.mobile.test.js
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

describe('Firebase Mobile Tests', () => {
  beforeAll(async () => {
    // Setup test user
    await auth().signInAnonymously();
  });

  afterAll(async () => {
    // Cleanup
    await auth().signOut();
  });

  test('should connect to database', async () => {
    const connectedRef = database().ref('.info/connected');
    const snapshot = await connectedRef.once('value');
    expect(snapshot.val()).toBe(true);
  });

  test('should perform CRUD operations', async () => {
    const testRef = database().ref('test');
    const testData = { message: 'test', timestamp: Date.now() };

    // Create
    await testRef.set(testData);
    
    // Read
    const snapshot = await testRef.once('value');
    expect(snapshot.val()).toEqual(testData);
    
    // Update
    await testRef.update({ message: 'updated' });
    const updatedSnapshot = await testRef.once('value');
    expect(updatedSnapshot.val().message).toBe('updated');
    
    // Delete
    await testRef.remove();
    const deletedSnapshot = await testRef.once('value');
    expect(deletedSnapshot.val()).toBeNull();
  });
});
```

### Flutter Testing

```dart
// test/firebase_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:firebase_auth/firebase_auth.dart';

void main() {
  group('Firebase Mobile Tests', () {
    setUpAll(() async {
      // Initialize Firebase for testing
      await Firebase.initializeApp();
      await FirebaseAuth.instance.signInAnonymously();
    });

    tearDownAll(() async {
      await FirebaseAuth.instance.signOut();
    });

    test('should connect to database', () async {
      final connectedRef = FirebaseDatabase.instance.ref('.info/connected');
      final snapshot = await connectedRef.get();
      expect(snapshot.value, isTrue);
    });

    test('should perform CRUD operations', () async {
      final testRef = FirebaseDatabase.instance.ref('test');
      final testData = {'message': 'test', 'timestamp': DateTime.now().millisecondsSinceEpoch};

      // Create
      await testRef.set(testData);
      
      // Read
      final snapshot = await testRef.get();
      expect(snapshot.value, equals(testData));
      
      // Update
      await testRef.update({'message': 'updated'});
      final updatedSnapshot = await testRef.get();
      expect((updatedSnapshot.value as Map)['message'], equals('updated'));
      
      // Delete
      await testRef.remove();
      final deletedSnapshot = await testRef.get();
      expect(deletedSnapshot.value, isNull);
    });
  });
}
```

## Mobile-Specific Troubleshooting

### Common Mobile Issues

1. **Android Build Issues**
   ```bash
   # Clear cache and rebuild
   cd android && ./gradlew clean
   cd .. && npx react-native run-android
   ```

2. **iOS Build Issues**
   ```bash
   # Clean and rebuild
   cd ios && rm -rf Pods Podfile.lock
   pod install
   cd .. && npx react-native run-ios
   ```

3. **Network Security (Android)**
   ```xml
   <!-- android/app/src/main/res/xml/network_security_config.xml -->
   <?xml version="1.0" encoding="utf-8"?>
   <network-security-config>
       <domain-config cleartextTrafficPermitted="true">
           <domain includeSubdomains="true">10.0.2.2</domain>
           <domain includeSubdomains="true">localhost</domain>
       </domain-config>
   </network-security-config>
   ```

### Mobile Debug Commands

```javascript
// React Native debug commands (in Metro console)
// Test connection
database().ref('.info/connected').on('value', (snap) => console.log('Connected:', snap.val()));

// Test auth
console.log('User:', auth().currentUser);

// Test write
database().ref('test').set({test: true, timestamp: Date.now()});

// Test read
database().ref('test').once('value').then(snap => console.log('Data:', snap.val()));
```

This mobile guide provides comprehensive setup and troubleshooting for both React Native and Flutter implementations of Firebase Realtime Database.