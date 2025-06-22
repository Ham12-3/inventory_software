import { GetServerSideProps } from 'next';
import MainLayout from '../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Plus,
  ArrowUpRight,
  Square,
  Pause
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ProductService, DashboardMetrics } from '../services/productService';
import { PurchaseOrderService, PurchaseOrderSummary, ReorderSuggestion } from '../services/purchaseOrderService';



interface DashboardProps {
  user: {
    id: string;
    email: string;
  };
}

const Dashboard = ({ user }: DashboardProps) => {
  const progressRef = useRef(null);
  const isInView = useInView(progressRef, { once: true });
  
  // Real inventory data state
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics | null>(null);
  const [purchaseOrderSummary, setPurchaseOrderSummary] = useState<PurchaseOrderSummary | null>(null);
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real inventory data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metrics, poSummary, suggestions] = await Promise.all([
          ProductService.getDashboardMetrics(),
          PurchaseOrderService.getPurchaseOrderSummary(),
          PurchaseOrderService.getReorderSuggestions(5)
        ]);
        
        setDashboardMetrics(metrics);
        setPurchaseOrderSummary(poSummary);
        setReorderSuggestions(suggestions.suggestions);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        // Fallback to mock data if API fails
        setDashboardMetrics({
          total_products: 8542,
          low_stock_count: 127,
          out_of_stock_count: 23,
          expiring_soon_count: 89,
          total_value: 125430.50
        });
        setPurchaseOrderSummary({
          total_orders: 25,
          pending_orders: 5,
          shipped_orders: 3,
          delivered_orders: 17,
          total_value: 45230.75,
          pending_value: 12450.30
        });
        setReorderSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


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



  const teamMembers = [
    { 
      name: 'Sarah Johnson', 
      task: 'Stock Audit - Dairy Section',
      status: 'Completed',
      avatar: '👩‍💼',
      statusColor: 'bg-green-100 text-green-800'
    },
    { 
      name: 'Michael Chen', 
      task: 'Receiving Fresh Produce Delivery',
      status: 'In Progress', 
      avatar: '👨‍💻',
      statusColor: 'bg-blue-100 text-blue-800'
    },
    { 
      name: 'Emma Rodriguez', 
      task: 'Expiry Date Monitoring - Bakery',
      status: 'Pending',
      avatar: '👩‍🔬',
      statusColor: 'bg-gray-100 text-gray-800'
    },
    { 
      name: 'James Wilson', 
      task: 'Restocking Frozen Foods Aisle',
      status: 'In Progress',
      avatar: '👨‍🎨',
      statusColor: 'bg-blue-100 text-blue-800'
    },
  ];

  const projectTasks = [
    { title: 'Restock Milk & Dairy', dueDate: 'Due: Nov 26, 2024', icon: '🥛' },
    { title: 'Quality Check Produce', dueDate: 'Due: Nov 19, 2024', icon: '🥬' },
    { title: 'Update Price Labels', dueDate: 'Due: Nov 28, 2024', icon: '🏷️' },
    { title: 'Inventory Count - Aisle 3', dueDate: 'Due: Nov 30, 2024', icon: '📊' },
    { title: 'Remove Expired Items', dueDate: 'Due: Dec 5, 2024', icon: '⚠️' },
  ];

  return (
    <MainLayout user={user}>
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Inventory Management Dashboard</h1>
              <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.email} - AI-powered inventory optimization</p>
            </div>
            {/* Header Actions */}
            <div className="flex gap-3">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.location.href = '/inventory'}
              >
                <Plus className="mr-2 h-4 w-4" />
                Manage Inventory
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/purchase-orders'}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Quick Order
              </Button>
              <Button variant="outline" className="text-gray-600 border-gray-300">
                Import Stock
              </Button>
            </div>
          </div>

          {/* Top Stats Cards - 4 inventory cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Products */}
            <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Total Products</p>
                    {loading ? (
                      <div className="animate-pulse bg-white/20 h-10 w-20 rounded mt-2"></div>
                    ) : (
                      <p className="text-4xl font-bold mt-2">{dashboardMetrics?.total_products?.toLocaleString() || '0'}</p>
                    )}
                    <div className="flex items-center mt-2 text-green-100 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Real-time data</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Alerts */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Low Stock Alerts</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-16 rounded mt-2"></div>
                    ) : (
                      <p className="text-4xl font-bold text-orange-600 mt-2">{dashboardMetrics?.low_stock_count || '0'}</p>
                    )}
                    <div className="flex items-center mt-2 text-gray-500 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Requires attention</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Out of Stock */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Out of Stock</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-12 rounded mt-2"></div>
                    ) : (
                      <p className="text-4xl font-bold text-red-600 mt-2">{dashboardMetrics?.out_of_stock_count || '0'}</p>
                    )}
                    <div className="flex items-center mt-2 text-gray-500 text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      <span>Critical items</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expiring Soon */}
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Expiring Soon</p>
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-10 w-12 rounded mt-2"></div>
                    ) : (
                      <p className="text-4xl font-bold text-yellow-600 mt-2">{dashboardMetrics?.expiring_soon_count || '0'}</p>
                    )}
                    <div className="flex items-center mt-2 text-gray-500 text-xs">
                      <span>Next 7 days</span>
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales Analytics */}
            <Card className="lg:col-span-5 bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Sales Analytics</CardTitle>
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
                      {projectData.map((entry, index) => {
                        // Color coding based on value: Red (low), Orange (medium), Green (high)
                        let barColor;
                        if (entry.value < 50) {
                          barColor = "#dc2626"; // Red for low values
                        } else if (entry.value < 80) {
                          barColor = "#ea580c"; // Orange for medium values
                        } else {
                          barColor = "#16a34a"; // Green for high values
                        }
                        
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={barColor}
                            stroke="none"
                            strokeWidth={0}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Purchase Order Insights */}
            <Card className="lg:col-span-3 bg-white shadow-sm border border-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Purchase Orders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Pending Orders</p>
                    <p className="text-xl font-bold text-blue-900">{purchaseOrderSummary?.pending_orders || 0}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-green-800">Delivered</p>
                    <p className="text-xl font-bold text-green-900">{purchaseOrderSummary?.delivered_orders || 0}</p>
                  </div>
                </div>
                
                {reorderSuggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Restock Recommendation</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {reorderSuggestions[0].product_name} - Stock: {reorderSuggestions[0].current_stock}
                    </p>
                    <Button 
                      className="mt-3 bg-green-600 hover:bg-green-700 text-white w-full"
                      onClick={() => window.location.href = '/purchase-orders'}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Order
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stock Level Indicator - Speedometer */}
            <motion.div
              ref={progressRef}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="lg:col-span-4"
            >
              <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 h-full group">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900">Stock Level Monitor</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-4 px-6 h-full min-h-[300px]">
                  <motion.div 
                    className="relative w-full max-w-sm h-40 mb-6 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  >
                    <svg width="100%" height="100%" viewBox="0 0 280 180" className="overflow-visible">
                      <defs>
                        {/* Enhanced green gradient for the progress arc */}
                        <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#059669" />
                          <stop offset="30%" stopColor="#10b981" />
                          <stop offset="70%" stopColor="#16a34a" />
                          <stop offset="100%" stopColor="#22c55e" />
                        </linearGradient>
                        
                        {/* Background gradient */}
                        <linearGradient id="backgroundGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f3f4f6" />
                          <stop offset="100%" stopColor="#e5e7eb" />
                        </linearGradient>
                        
                        {/* Enhanced glow effect */}
                        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        
                        {/* Shadow filter */}
                        <filter id="dropshadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
                        </filter>
                      </defs>
                      
                      {/* Background arc - perfectly aligned semicircle */}
                      <path
                        d="M 40 110 A 100 100 0 0 1 240 110"
                        fill="none"
                        stroke="url(#backgroundGradient)"
                        strokeWidth="16"
                        strokeLinecap="round"
                        filter="url(#dropshadow)"
                      />
                      
                      {/* Progress arc with color-coded levels - aligned */}
                      <motion.path
                        d="M 40 110 A 100 100 0 0 1 240 110"
                        fill="none"
                        stroke={(() => {
                          if (loading || !dashboardMetrics) return "#9ca3af"; // Gray while loading
                          const totalItems = dashboardMetrics.total_products;
                          const lowStockItems = dashboardMetrics.low_stock_count;
                          const outOfStockItems = dashboardMetrics.out_of_stock_count;
                          const healthyStock = totalItems - lowStockItems - outOfStockItems;
                          const progressPercent = totalItems > 0 ? (healthyStock / totalItems) * 100 : 0;
                          
                          if (progressPercent < 25) return "#dc2626"; // Red for low stock
                          if (progressPercent < 60) return "#eab308"; // Yellow for medium stock
                          return "#16a34a"; // Green for high stock
                        })()}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray="314"
                        initial={{ strokeDashoffset: 314 }}
                        animate={isInView ? { 
                          strokeDashoffset: (() => {
                            if (loading || !dashboardMetrics) return 314;
                            const totalItems = dashboardMetrics.total_products;
                            const lowStockItems = dashboardMetrics.low_stock_count;
                            const outOfStockItems = dashboardMetrics.out_of_stock_count;
                            const healthyStock = totalItems - lowStockItems - outOfStockItems;
                            const progressPercent = totalItems > 0 ? (healthyStock / totalItems) * 100 : 0;
                            return 314 - (progressPercent / 100) * 314;
                          })()
                        } : { strokeDashoffset: 314 }}
                        transition={{ duration: 2.5, delay: 0.5, ease: "easeOut" }}
                        filter="url(#glow)"
                      />
                      

                      
                      {/* Clean center circle */}
                      <motion.circle
                        cx="140"
                        cy="110"
                        r="10"
                        fill="#ffffff"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                        filter="url(#dropshadow)"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ delay: 1.8, duration: 0.4 }}
                      />
                    </svg>
                    

                  </motion.div>
                  
                  {/* Color-coded legend */}
                  <motion.div 
                    className="flex items-center justify-center space-x-8 text-xs w-full mt-4"
                    initial={{ opacity: 0, y: 15 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                    transition={{ duration: 0.6, delay: 2.8 }}
                  >
                    <motion.div 
                      className="flex items-center group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-red-600 rounded-full mr-2 shadow-md"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.4, delay: 2.9 }}
                        whileHover={{ scale: 1.3 }}
                      />
                      <span className="text-gray-700 font-semibold">
                        Low Stock (&lt;25%)
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-yellow-500 rounded-full mr-2 shadow-md"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.4, delay: 3 }}
                        whileHover={{ scale: 1.3 }}
                      />
                      <span className="text-gray-700 font-semibold">
                        Medium (25-60%)
                      </span>
                    </motion.div>
                    <motion.div 
                      className="flex items-center group"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <motion.div 
                        className="w-3 h-3 bg-green-600 rounded-full mr-2 shadow-md"
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.4, delay: 3.1 }}
                        whileHover={{ scale: 1.3 }}
                      />
                      <span className="text-gray-700 font-semibold">
                        High Stock (&gt;60%)
                      </span>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Inventory Team */}
            <Card className="lg:col-span-6 bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Inventory Team</CardTitle>
                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Staff
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

            {/* Critical Tasks */}
            <Card className="lg:col-span-3 bg-white shadow-sm border border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Critical Tasks</CardTitle>
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

            {/* Shift Timer */}
            <Card className="lg:col-span-3 bg-gradient-to-br from-green-600 to-green-700 text-white border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-white">Shift Timer</CardTitle>
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
  const token = req.cookies['access_token'];

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
    // Verify token with backend (use container name for server-side requests)
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://backend:8000/api/auth/me'  // Container-to-container communication
      : 'http://localhost:8000/api/auth/me'; // Fallback
      
    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.log('Token verification failed, redirecting to login');
      // Clear the invalid token
      context.res.setHeader('Set-Cookie', [
        'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      ]);
      
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }

    const user = await response.json();
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