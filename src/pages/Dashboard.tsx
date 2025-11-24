import React from 'react';
import Navbar from '../components/Navbar';
import { Award, TrendingUp, Users, Clock, CheckCircle, ExternalLink } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  // Simulated data
  const stats = [
    { name: 'Total Certifications', value: '1,234', icon: <Award className="h-6 w-6 text-primary" />, change: '+12%', changeType: 'increase' },
    { name: 'Active Users', value: '856', icon: <Users className="h-6 w-6 text-secondary" />, change: '+5%', changeType: 'increase' },
    { name: 'Avg. Completion Time', value: '4.2h', icon: <Clock className="h-6 w-6 text-accent" />, change: '-8%', changeType: 'decrease' }, // decrease is good here
    { name: 'Pass Rate', value: '92%', icon: <CheckCircle className="h-6 w-6 text-green-500" />, change: '+2%', changeType: 'increase' },
  ];

  const chartData = [
    { name: 'Jan', certs: 65 },
    { name: 'Feb', certs: 78 },
    { name: 'Mar', certs: 90 },
    { name: 'Apr', certs: 105 },
    { name: 'May', certs: 125 },
    { name: 'Jun', certs: 150 },
  ];

  const certifications = [
    { id: 1, name: 'Hedera Fundamentals', status: 'Completed', date: '2023-10-15', score: '98%' },
    { id: 2, name: 'Smart Contracts on Hedera', status: 'In Progress', date: '2023-10-28', score: '-' },
    { id: 3, name: 'Token Service (HTS) Deep Dive', status: 'Not Started', date: '-', score: '-' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark text-slate-900 dark:text-slate-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of your Hedera certification progress.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((item) => (
            <div key={item.name} className="glass-panel rounded-xl p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-md p-3">
                  {item.icon}
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900 dark:text-white">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-4">
                  <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.changeType === 'increase' || (item.name.includes('Time') && item.changeType === 'decrease') // logic for color
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                      {item.changeType === 'increase' ? <TrendingUp size={12} className="mr-1" /> : <TrendingUp size={12} className="mr-1 transform rotate-180" />}
                      {item.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2 glass-panel rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Certification Trends</h3>
                </div>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                            <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                            <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af'}} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1c1b22', border: '1px solid #374151', color: '#f3f4f6' }}
                                itemStyle={{ color: '#f3f4f6' }}
                            />
                            <Line type="monotone" dataKey="certs" stroke="#2a00ff" strokeWidth={3} dot={{ r: 4, fill: '#2a00ff', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Certs */}
             <div className="glass-panel rounded-xl p-6">
                 <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Your Certifications</h3>
                 <div className="flow-root">
                     <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                         {certifications.map((cert) => (
                             <li key={cert.id} className="py-4">
                                 <div className="flex items-center space-x-4">
                                     <div className="flex-1 min-w-0">
                                         <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                             {cert.name}
                                         </p>
                                         <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                             {cert.status} • {cert.date}
                                         </p>
                                     </div>
                                     <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                        {cert.score !== '-' ? (
                                            <span className="text-green-500">{cert.score}</span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">--</span>
                                        )}
                                     </div>
                                 </div>
                             </li>
                         ))}
                     </ul>
                 </div>
                 <div className="mt-6">
                    <button className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-panel hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        View All Certifications <ExternalLink size={16} className="ml-2" />
                    </button>
                 </div>
             </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
