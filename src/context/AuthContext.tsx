import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

interface AuthContextType {
  user: User | null;
  role: 'user' | 'admin' | 'super_admin' | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (currentUser.email === 'talelbenghorbel@gmail.com') {
            // GOD MODE: Force super_admin
            setRole('super_admin');
            if (!userDoc.exists() || userDoc.data()?.role !== 'super_admin') {
              await setDoc(userDocRef, {
                 email: currentUser.email,
                 role: 'super_admin',
                 createdAt: userDoc.exists() ? userDoc.data()?.createdAt : new Date().toISOString(),
                 lastLogin: new Date().toISOString()
              }, { merge: true });
            }
          } else {
            // Normal User
            if (userDoc.exists()) {
              setRole(userDoc.data().role as 'user' | 'admin' | 'super_admin');
            } else {
               // Create new user with default role
               const newUser = {
                 email: currentUser.email,
                 role: 'user',
                 createdAt: new Date().toISOString(),
                 lastLogin: new Date().toISOString()
               };
               await setDoc(userDocRef, newUser);
               setRole('user');
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
