import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDbhj29ls_Qq--iT-yEiEUPs53v3pSPBlU",
  authDomain: "seprojecthub.firebaseapp.com",
  databaseURL: "https://seprojecthub-default-rtdb.firebaseio.com",
  projectId: "seprojecthub",
  storageBucket: "seprojecthub.firebasestorage.app",
  messagingSenderId: "223540711918",
  appId: "1:223540711918:web:71c59bbb9ded09741cfeff",
  measurementId: "G-2X0RMN0S00"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

// Test database connection
database.app.options.databaseURL && console.log('✅ Firebase Realtime Database connected:', database.app.options.databaseURL);

export default app;