import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, PlusCircle, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();

  const links = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Add Application', path: '/add', icon: PlusCircle },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Navigation
        </p>
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                  ${isActive
                    ? 'bg-gradient-to-r from-brand-primary/15 to-brand-accent/5 text-brand-primary border-l-2 border-brand-primary'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-brand-border/30 border-l-2 border-transparent'}
                `}
                aria-label={link.name}
              >
                <Icon size={18} className="text-gray-400 group-hover:text-gray-300" />
                {link.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-brand-border/60 pt-4 px-2 space-y-1.5">
        <NavLink
          to="/profile"
          onClick={onClose}
          className={({ isActive }) => `
            flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
            ${isActive
              ? 'bg-gradient-to-r from-brand-primary/15 to-brand-accent/5 text-brand-primary border-l-2 border-brand-primary'
              : 'text-gray-400 hover:text-gray-200 hover:bg-brand-border/30 border-l-2 border-transparent'}
          `}
        >
          <User size={18} className="text-gray-400 group-hover:text-gray-300" />
          Profile
        </NavLink>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile drawer backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-brand-dark/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Desktop Sidebar */}
      <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 border-r border-brand-border bg-brand-dark/50 hidden md:block">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-brand-border bg-brand-dark shadow-2xl transition-transform duration-300 md:hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-brand-border px-6">
          <span className="font-sans font-bold text-lg text-white">Navigation</span>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white text-sm"
          >
            Close
          </button>
        </div>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
