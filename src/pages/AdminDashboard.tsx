import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Shield, User as UserIcon, Calendar, Edit2 } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  role: string;
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const { user, role, loading } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [fetching, setFetching] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (role !== 'super_admin') return;

      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersList: UserData[] = [];
        querySnapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() } as UserData);
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setFetching(false);
      }
    };

    if (!loading) {
      fetchUsers();
    }
  }, [role, loading]);

  const handleRoleChange = async (userId: string, newRole: string) => {
      try {
          await updateDoc(doc(db, 'users', userId), { role: newRole });
          setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
          setEditingUserId(null);
      } catch (error) {
          console.error("Error updating role:", error);
      }
  };

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
     );
  }

  if (!user || role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Super Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage users and roles.</p>
        </header>

        {fetching ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-dark-panel rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined Date
                  </th>
                   <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-panel divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((userData) => (
                  <tr key={userData.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {userData.email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">ID: {userData.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       {editingUserId === userData.id && userData.email !== 'talelbenghorbel@gmail.com' ? (
                           <select
                             value={userData.role}
                             onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                             className="text-sm rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-dark focus:ring-primary focus:border-primary px-2 py-1"
                           >
                               <option value="user">User</option>
                               <option value="admin">Admin</option>
                               <option value="super_admin">Super Admin</option>
                           </select>
                       ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            userData.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                            userData.role === 'admin' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {userData.role}
                          </span>
                       )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                            <Calendar size={14} />
                            {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {userData.email !== 'talelbenghorbel@gmail.com' && (
                             <button
                                onClick={() => setEditingUserId(userData.id === editingUserId ? null : userData.id)}
                                className="text-primary hover:text-indigo-900 dark:hover:text-indigo-400 transition-colors"
                             >
                                <Edit2 size={16} />
                             </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
