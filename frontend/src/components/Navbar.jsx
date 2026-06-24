import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, Bell, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b border-brand-border bg-brand-dark/80 backdrop-blur-md px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-brand-border md:hidden focus:outline-none"
            aria-label="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent text-white shadow-lg shadow-indigo-500/25">
            <Briefcase size={18} className="stroke-[2.5]" />
          </div>
          <span className="font-sans font-extrabold text-xl tracking-tight text-white bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Job<span className="text-brand-primary">Stack</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications Mock */}
        <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-brand-border/60 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-secondary"></span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-brand-border/60 border border-transparent hover:border-brand-border/40 transition-all duration-200 focus:outline-none"
          >
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-primary/20 to-brand-accent/20 border border-brand-primary/30 text-brand-primary flex items-center justify-center font-bold text-sm">
              {getInitials(user?.username)}
            </div>
            <span className="text-sm font-medium text-gray-300 hidden md:block select-none">
              {user?.username}
            </span>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setDropdownOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-brand-border bg-brand-card py-1.5 shadow-2xl z-20 animate-fade-in">
                <div className="px-4 py-2 border-b border-brand-border">
                  <p className="text-xs text-gray-500">Signed in as</p>
                  <p className="text-sm font-semibold text-gray-200 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-brand-border/40 transition-colors"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
