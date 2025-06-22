"use client"

import {
  BarChart3,
  LogOut,
  Home,
  Download,
  ShoppingCart,
  Truck
} from "lucide-react"
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from "@/components/ui/button"

// Core menu items that exist in the application
const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: BarChart3,
  },
  {
    title: "Purchase Orders",
    url: "/purchase-orders",
    icon: ShoppingCart,
  },
  {
    title: "Deliveries",
    url: "/deliveries",
    icon: Truck,
  },
]

const generalItems = [
  {
    title: "Logout",
    url: "#",
    icon: LogOut,
    isButton: true,
  },
]

interface AppSidebarProps {
  user?: {
    id: string;
    email: string;
  };
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    // Clear authentication token from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
    
    // Redirect to login
    router.push('/login')
  }

  const isActive = (path: string) => router.pathname === path

  return (
    <div className="flex h-screen w-64 bg-gray-50 border-r border-gray-300 shadow-sm">
      {/* Left green indicator bar - darker green */}
      <div className="w-1 bg-green-600 flex-shrink-0"></div>
      
      {/* Main sidebar content */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* User Profile Section */}
        {user && (
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Menu Section */}
        <div className="flex-1 px-4 py-6">
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-3">
              MENU
            </h3>
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative
                    ${isActive(item.url) 
                      ? 'bg-green-600 text-white font-medium shadow-md border border-green-700' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm font-normal border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-4 w-4 transition-colors ${isActive(item.url) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    <span className="transition-colors">{item.title}</span>
                  </div>

                  {/* Focus ring for accessibility */}
                  <div className={`absolute inset-0 rounded-lg ring-2 ring-green-500 ring-opacity-0 transition-all ${isActive(item.url) ? '' : 'group-focus-visible:ring-opacity-50'}`}></div>
                </Link>
              ))}
            </nav>
          </div>

          {/* General Section */}
          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 px-3">
              GENERAL
            </h3>
            <nav className="space-y-1">
              {generalItems.map((item) => (
                item.isButton ? (
                  <button
                    key={item.title}
                    onClick={handleLogout}
                    className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-normal text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm transition-all duration-200 border border-transparent relative focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-opacity-50"
                  >
                    <item.icon className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors" />
                    <span className="transition-colors">{item.title}</span>
                  </button>
                ) : (
                  <Link
                    key={item.title}
                    href={item.url}
                    className={`
                      group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 relative
                      ${isActive(item.url) 
                        ? 'bg-green-600 text-white font-medium shadow-md border border-green-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-sm font-normal border border-transparent'
                      }
                    `}
                  >
                    <item.icon className={`h-4 w-4 transition-colors ${isActive(item.url) ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                    <span className="transition-colors">{item.title}</span>
                    {/* Focus ring for accessibility */}
                    <div className={`absolute inset-0 rounded-lg ring-2 ring-green-500 ring-opacity-0 transition-all ${isActive(item.url) ? '' : 'group-focus-visible:ring-opacity-50'}`}></div>
                  </Link>
                )
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile App Download Section */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-white relative overflow-hidden border border-gray-700 shadow-lg">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent"></div>
            
            <div className="relative">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-base">📱</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold mb-1 text-white">Download our Mobile App</h3>
                  <p className="text-xs text-gray-300 mb-3 leading-relaxed">Get easy access to your account</p>
                  <Button 
                    size="sm"
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 font-medium rounded-lg shadow-sm transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 