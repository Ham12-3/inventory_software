import React, { ReactNode } from 'react';
import { AppSidebar } from './Sidebar';
import Header from './Header';

type MainLayoutProps = {
  children: ReactNode;
  user?: {
    id: string;
    email: string;
  };
};

const MainLayout = ({ children, user }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AppSidebar user={user} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout; 