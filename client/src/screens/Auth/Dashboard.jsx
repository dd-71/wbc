import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthProvider";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// --- Demo Data ---
const enrollmentData = [
  { month: "Jan", students: 120 },
  { month: "Feb", students: 185 },
  { month: "Mar", students: 210 },
  { month: "Apr", students: 178 },
  { month: "May", students: 260 },
  { month: "Jun", students: 310 },
  { month: "Jul", students: 295 },
];

const revenueData = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 6800 },
  { month: "Mar", revenue: 7500 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 9200 },
  { month: "Jun", revenue: 11000 },
  { month: "Jul", revenue: 10400 },
];

const courseDistribution = [
  { name: "Web Dev", value: 38 },
  { name: "Design", value: 24 },
  { name: "Data Science", value: 20 },
  { name: "Marketing", value: 18 },
];

const PIE_COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe"];

const recentActivity = [
  { user: "Priya Sharma", action: "Enrolled in React Masterclass", time: "2m ago" },
  { user: "Arjun Mehta", action: "Completed Python Basics", time: "15m ago" },
  { user: "Sneha Rao", action: "Submitted UI Design Project", time: "1h ago" },
  { user: "Kiran Das", action: "Started Data Science course", time: "2h ago" },
  { user: "Ritika Nair", action: "Enrolled in Digital Marketing", time: "3h ago" },
];

// --- Stat Card ---
const StatCard = ({ label, value, change, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4"
  >
    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-xl">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className={`text-xs mt-0.5 ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
        {change >= 0 ? "▲" : "▼"} {Math.abs(change)}% vs last month
      </p>
    </div>
  </motion.div>
);

// --- Dashboard ---
const Dashboard = () => {
  const { permissions, role } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 w-full pb-10"
    >
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Students" value="1,284" change={12} icon="🎓" delay={0.1} />
        <StatCard label="Active Courses" value="38" change={5} icon="📚" delay={0.15} />
        <StatCard label="Monthly Revenue" value="$10,400" change={-3} icon="💰" delay={0.2} />
        <StatCard label="Completion Rate" value="74%" change={8} icon="✅" delay={0.25} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Enrollment Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Student Enrollments</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={enrollmentData}>
              <defs>
                <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="students"
                stroke="#7c3aed"
                strokeWidth={2}
                fill="url(#enrollGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white rounded-xl shadow-sm p-5"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Course Categories</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={courseDistribution}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {courseDistribution.map((entry, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {courseDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: PIE_COLORS[i] }}
                  />
                  {item.name}
                </div>
                <span className="font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Revenue Bar Chart + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-5 lg:col-span-2"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Monthly Revenue ($)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(val) => `$${val.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          className="bg-white rounded-xl shadow-sm p-5"
        >
          <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700 flex-shrink-0">
                  {item.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.user}</p>
                  <p className="text-xs text-gray-500">{item.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Dashboard;