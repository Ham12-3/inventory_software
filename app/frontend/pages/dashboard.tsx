import { GetServerSideProps } from 'next';
import { supabase } from '../utils/supabaseClient';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Calendar,
  Square,
  Pause
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';



const Dashboard = () => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: true });
  const [animatedValue, setAnimatedValue] = useState(0);

  // Animate the percentage value
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setAnimatedValue(41);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  // Sample data for project analytics with monthly data
  const projectData = [
    { month: 'Jan', value: 45, isActive: false },    // Inactive month
    { month: 'Feb', value: 85, isActive: true },     // Active month
    { month: 'Mar', value: 35, isActive: false },    // Inactive month
    { month: 'Apr', value: 95, isActive: true },     // Active month
    { month: 'May', value: 25, isActive: false },    // Inactive month
    { month: 'Jun', value: 65, isActive: false },    // Inactive month
    { month: 'Jul', value: 50, isActive: false },    // Inactive month
    { month: 'Aug', value: 75, isActive: true },     // Active month
    { month: 'Sep', value: 40, isActive: false },    // Inactive month
    { month: 'Oct', value: 55, isActive: false },    // Inactive month
    { month: 'Nov', value: 90, isActive: true },     // Active month
    { month: 'Dec', value: 30, isActive: false },    // Inactive month
  ];

  const progressData = [
    { name: 'Completed', value: 41, fill: '#16a34a' },
    { name: 'Remaining', value: 59, fill: 'url(#progressHatch)' },
  ];

  const teamMembers = [
    { 
      name: 'Alexandra Deff', 
      task: 'Working on GitHub Project Repository',
      status: 'Completed',
      avatar: '👩‍💼',
      statusColor: 'bg-green-100 text-green-800'
    },
    { 
      name: 'Edwin Adenika', 
      task: 'Working on Integrate User Authentication System',
      status: 'In Progress', 
      avatar: '👨‍💻',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    { 
      name: 'Isaac Oluwatemilorun', 
      task: 'Working on Develop Web Filter Functionality',
      status: 'Pending',
      avatar: '👨‍🔬',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    { 
      name: 'David Oshodi', 
      task: 'Working on Responsive Layout for Homepage',
      status: 'In Progress',
      avatar: '👨‍🎨',
      statusColor: 'bg-blue-100 text-blue-800'
    },
  ];

  const projectTasks = [
    { title: 'Develop API Endpoints', dueDate: 'Due date: Nov 26, 2024', icon: '🔵' },
    { title: 'Onboarding Flow', dueDate: 'Due date: Nov 19, 2024', icon: '🟢' },
    { title: 'Build Dashboard', dueDate: 'Due date: Nov 28, 2024', icon: '🟡' },
    { title: 'Optimize Page Load', dueDate: 'Due date: Nov 30, 2024', icon: '🟠' },
    { title: 'Cross-Browser Testing', dueDate: 'Due date: Dec 5, 2024', icon: '🔴' },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Plan, prioritize, and accomplish your tasks with ease.</p>
            </div>
            {/* Header Actions */}
            <div className="flex gap-3">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Project
              </Button>
              <Button variant="outline" className="text-gray-600 border-gray-300">
                Import Data
              </Button>
            </div>
          </div>

          {/* Top Stats Cards - 4 project cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Projects */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Projects</p>
                    <p className="text-4xl font-bold mt-2">24</p>
                    <div className="flex items-center mt-2 text-green-100 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Increased from last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ended Projects */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Ended Projects</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">10</p>
                    <div className="flex items-center mt-2 text-gray-500 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Increased from last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-gray-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Running Projects */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Running Projects</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">12</p>
                    <div className="flex items-center mt-2 text-gray-500 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Decreased from last month</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Projects */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending Project</p>
                    <p className="text-4xl font-bold text-gray-900 mt-2">2</p>
                    <div className="flex items-center mt-2 text-gray-500 text-xs">
                      <span>On Previous</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Project Analytics */}
            <Card className="lg:col-span-5 bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Project Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart 
                    data={projectData} 
                    barCategoryGap="20%" 
                    barGap={4}
                    margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                  >
                    <defs>
                      <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                        <rect width="4" height="8" fill="#e5e7eb" />
                        <rect x="4" width="4" height="8" fill="transparent" />
                      </pattern>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                    />
                    <YAxis hide />
                    <Bar 
                      dataKey="value" 
                      maxBarSize={28}
                      radius={[6, 6, 6, 6]}
                    >
                      {projectData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isActive ? "#16a34a" : "url(#diagonalHatch)"}
                          stroke={entry.isActive ? "none" : "#d1d5db"}
                          strokeWidth={entry.isActive ? 0 : 1}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Reminders */}
            <Card className="lg:col-span-3 bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Reminders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900">Meeting with Arc Company</h4>
                  <p className="text-sm text-gray-500 mt-1">Time: 2:00 pm - 4:00 pm</p>
                  <Button className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    Start Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Project Progress */}
            <motion.div
              ref={progressRef}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Card className="lg:col-span-4 bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Project Progress</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <motion.div 
                    className="relative w-48 h-24 mb-6"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <pattern id="progressHatch" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                            <rect width="4" height="8" fill="#e5e7eb" />
                            <rect x="4" width="4" height="8" fill="transparent" />
                          </pattern>
                        </defs>
                        <Pie
                          data={progressData}
                          cx="50%"
                          cy="100%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          startAngle={180}
                          endAngle={0}
                          stroke="none"
                          cornerRadius={8}
                          animationBegin={isInView ? 300 : 0}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {progressData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.fill}
                              stroke={entry.name === 'Remaining' ? '#d1d5db' : 'none'}
                              strokeWidth={entry.name === 'Remaining' ? 1 : 0}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-end justify-center pb-2">
                      <motion.span 
                        className="text-3xl font-bold text-gray-900"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5, delay: 1.2 }}
                      >
                        <motion.span
                          initial={{ textShadow: "0 0 0 transparent" }}
                          animate={isInView ? { 
                            textShadow: "0 0 8px rgba(34, 197, 94, 0.3)"
                          } : {}}
                          transition={{ duration: 0.3, delay: 1.5 }}
                        >
                          {animatedValue}%
                        </motion.span>
                      </motion.span>
                    </div>
                  </motion.div>
                  
                  <motion.p 
                    className="text-sm text-gray-600 mb-4"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.5, delay: 1.4 }}
                  >
                    Project Ended
                  </motion.p>
                  
                  <motion.div 
                    className="flex items-center space-x-6 text-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                  >
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-green-600 rounded-full mr-2"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.3, delay: 1.7 }}
                      />
                      <span className="text-gray-600">Completed</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-gray-300 rounded-full mr-2"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.3, delay: 1.8 }}
                      />
                      <span className="text-gray-600">In Progress</span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-gray-200 rounded-full mr-2"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.3, delay: 1.9 }}
                      />
                      <span className="text-gray-600">Pending</span>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Team Collaboration */}
            <Card className="lg:col-span-6 bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Team Collaboration</CardTitle>
                                    <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="text-2xl">{member.avatar}</div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <Badge 
                            variant="secondary"
                            className={member.statusColor}
                          >
                            {member.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{member.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Tasks */}
            <Card className="lg:col-span-3 bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Project</CardTitle>
                                    <Button size="sm" variant="ghost" className="text-green-600">
                  <Plus className="h-4 w-4 mr-1" />
                  New
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectTasks.map((task, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <span className="text-lg mt-0.5">{task.icon}</span>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-gray-900">{task.title}</p>
                      <p className="text-xs text-gray-500">{task.dueDate}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Time Tracker */}
            <Card className="lg:col-span-3 bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white">Time Tracker</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="text-4xl font-mono font-bold">01:24:08</div>
                <div className="flex justify-center space-x-3">
                  <Button size="sm" className="bg-white/20 hover:bg-white/30 border-white/30 text-white">
                    <Pause className="h-4 w-4" />
                  </Button>
                  <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  const token = req.cookies['sb-access-token'];

  console.log('Dashboard auth check - Token present:', !!token);

  if (!token) {
    console.log('No access token found, redirecting to login');
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    console.log('Supabase auth result - User:', !!user, 'Error:', !!error);

    if (error) {
      console.error('Supabase auth error:', error.message);
      // Clear the invalid token
      context.res.setHeader('Set-Cookie', [
        'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      ]);
      
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    if (!user) {
      console.log('No user found, redirecting to login');
      return {
        redirect: {
          destination: '/login',
        permanent: false,
        },
      };
    }

    console.log('Authentication successful for user:', user.email);
    return {
      props: {
        user,
      },
    };
  } catch (err) {
    console.error('Dashboard auth error:', err);
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
};

export default Dashboard;