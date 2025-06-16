"use client"

import React from 'react';
import { Search, Mail, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Donezo Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">Donezo</span>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search task"
              className="pl-10 pr-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-green-400 focus:ring-green-200"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium text-gray-400 opacity-100 hidden sm:inline-flex">
              ⌘F
            </kbd>
          </div>
        </div>

        {/* Right Section - Actions and User Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Icons */}
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
            <Mail className="h-4 w-4" />
            <span className="sr-only">Messages</span>
          </Button>
          
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-700">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Totok Michael</p>
              <p className="text-xs text-gray-500">tmichael20@gmail.com</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-sm font-medium">
              TM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 