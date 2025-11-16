/**
 * Dashboard Template - Admin Template
 * Complete admin dashboard demonstrating NexusG Lite v1.4.0 capabilities
 * 
 * Features demonstrated:
 * - Data visualization and charts
 * - User management interface
 * - Real-time metrics
 * - Responsive grid layout
 * 
 * @version 1.4.0
 * @created 2025-11-16
 * @author MiniMax Agent
 */

import React, { useState } from 'react';
import { cn } from '@/utils';

// Import NexusG Lite components
import HeaderBar from '@/components/organisms/HeaderBar';
import StatsCard from '@/components/molecules/StatsCard';
import Card from '@/components/molecules/Card';
import Table from '@/components/molecules/Table';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Avatar from '@/components/atoms/Avatar';
import Modal from '@/components/molecules/Modal';
import Toast from '@/components/molecules/Toast';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
  orders: number;
  conversion: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Inactive' | 'Pending';
  lastActive: string;
  avatar?: string;
}

interface DashboardProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  stats?: DashboardStats;
  className?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Administrator',
    avatar: '👨‍💼'
  },
  stats = {
    totalUsers: 12458,
    activeUsers: 8934,
    revenue: 125000,
    growth: 12.5,
    orders: 2341,
    conversion: 3.2
  },
  className 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const users: User[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'Editor',
      status: 'Active',
      lastActive: '2 hours ago',
      avatar: '👩‍💻'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'Viewer',
      status: 'Active',
      lastActive: '1 day ago',
      avatar: '👨‍🔬'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily@company.com',
      role: 'Admin',
      status: 'Inactive',
      lastActive: '3 days ago',
      avatar: '👩‍🎨'
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david@company.com',
      role: 'Editor',
      status: 'Pending',
      lastActive: 'Never',
      avatar: '👨‍💼'
    }
  ];

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    // Handle delete logic
    console.log(`Deleting user ${userId}`);
  };

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      <HeaderBar
        title="Dashboard"
        subtitle="Welcome back to your admin panel"
        user={user}
        variant="modern"
      />

      <div className="container mx-auto px-6 py-8">
        {/* Period Selector */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Overview</h2>
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period === '7d' ? 'Last 7 days' : period === '30d' ? 'Last 30 days' : 'Last 90 days'}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            change={+12.5}
            trend="up"
            icon="👥"
            variant="modern"
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            change={+8.2}
            trend="up"
            icon="⚡"
            variant="modern"
          />
          <StatsCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            change={stats.growth}
            trend="up"
            icon="💰"
            variant="modern"
          />
          <StatsCard
            title="Orders"
            value={stats.orders.toLocaleString()}
            change={+15.3}
            trend="up"
            icon="🛒"
            variant="modern"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Revenue Trends</h3>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
              
              {/* Placeholder for chart */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-muted-foreground">Interactive Chart Component</p>
                  <p className="text-sm text-muted-foreground">
                    Showing revenue trends for {selectedPeriod}
                  </p>
                </div>
              </div>

              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Revenue</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Orders</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Users</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { 
                    action: 'New user registered', 
                    user: 'Sarah Johnson', 
                    time: '2 minutes ago',
                    icon: '👤',
                    color: 'bg-blue-500'
                  },
                  { 
                    action: 'Order completed', 
                    user: 'Order #1234', 
                    time: '15 minutes ago',
                    icon: '🛒',
                    color: 'bg-green-500'
                  },
                  { 
                    action: 'Payment received', 
                    user: '$1,299.00', 
                    time: '1 hour ago',
                    icon: '💳',
                    color: 'bg-purple-500'
                  },
                  { 
                    action: 'Report generated', 
                    user: 'Monthly Analytics', 
                    time: '2 hours ago',
                    icon: '📊',
                    color: 'bg-orange-500'
                  },
                  { 
                    action: 'Settings updated', 
                    user: 'Admin Panel', 
                    time: '3 hours ago',
                    icon: '⚙️',
                    color: 'bg-gray-500'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${activity.color} rounded-full flex items-center justify-center text-white text-sm`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Users Management */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">User Management</h3>
            <Button size="sm">
              Add New User
            </Button>
          </div>

          <Table
            columns={[
              { 
                header: 'User', 
                accessor: (user: User) => (
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      size="sm"
                      fallback={user.name}
                    />
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                )
              },
              { 
                header: 'Role', 
                accessor: (user: User) => (
                  <Badge 
                    variant={
                      user.role === 'Admin' ? 'destructive' : 
                      user.role === 'Editor' ? 'warning' : 'default'
                    }
                  >
                    {user.role}
                  </Badge>
                )
              },
              { 
                header: 'Status', 
                accessor: (user: User) => (
                  <Badge 
                    variant={
                      user.status === 'Active' ? 'success' : 
                      user.status === 'Pending' ? 'warning' : 'default'
                    }
                  >
                    {user.status}
                  </Badge>
                )
              },
              { 
                header: 'Last Active', 
                accessor: (user: User) => user.lastActive 
              },
              { 
                header: 'Actions', 
                accessor: (user: User) => (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )
              }
            ]}
            data={users}
            variant="modern"
          />
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mt-8">
          <Button variant="outline" className="h-20 flex-col gap-2">
            <span className="text-2xl">📊</span>
            Generate Report
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <span className="text-2xl">👥</span>
            Manage Users
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <span className="text-2xl">💰</span>
            View Revenue
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2">
            <span className="text-2xl">⚙️</span>
            System Settings
          </Button>
        </div>
      </div>

      {/* User Edit Modal */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Edit User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg"
                value={selectedUser.name}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg"
                value={selectedUser.email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="Admin">Admin</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select className="w-full px-3 py-2 border rounded-lg">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setIsUserModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsUserModalOpen(false);
                  // Handle save logic
                }}
                className="flex-1"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;
