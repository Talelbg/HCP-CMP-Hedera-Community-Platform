import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyD2reN4qvBhUnHdep9LxS8ppG5xruU8ePw",
  authDomain: "hcp-cmp-platform.firebaseapp.com",
  databaseURL: "https://hcp-cmp-platform-default-rtdb.firebaseio.com",
  projectId: "hcp-cmp-platform",
  storageBucket: "hcp-cmp-platform.firebasestorage.app",
  messagingSenderId: "505950551698",
  appId: "1:505950551698:web:cf1dfb5399aa6ae080b04b",
  measurementId: "G-45NXTTJ5R9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
