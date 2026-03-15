import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, ShieldCheck, Menu, X, FolderOpen, Moon, Sun } from 'lucide-react';
import { useTranslation } from '../lib/useTranslation';
import { useTheme } from '../lib/ThemeContext';

export default function Layout({ children }) {
  const [open, setOpen] = useState(true);
  const location = useLocation();
  const t = useTranslation();
  const { dark, toggle } = useTheme();

  const NAV = [
    { path: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { path: '/', icon: FileText, label: t.nav.norms },
    { path: '/documents', icon: FolderOpen, label: t.nav.documents },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={`${
          open ? 'w-56' : 'w-14'
        } glass-sidebar flex-shrink-0 flex flex-col transition-all duration-200 overflow-hidden`}
      >
        {/* Logo */}
        <div className={`flex items-center border-b border-brand-700/40 ${open ? 'px-4 py-4 justify-between' : 'px-0 py-4 justify-center'}`}>
          {open && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-azure-500 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-semibold text-brand-100 tracking-tight truncate block">
                Compliance Mgr
              </span>
            </div>
          )}
          {!open && (
            <div className="w-7 h-7 rounded-lg bg-azure-500 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
          )}
          {open && (
            <button
              onClick={() => setOpen(false)}
              className="text-brand-400 hover:text-brand-100 transition-colors flex-shrink-0"
              aria-label={t.nav.collapseAriaLabel}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 pt-3" aria-label={t.nav.mainNavAriaLabel}>
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={!open ? label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 relative ${
                  active
                    ? 'bg-white/12 text-white'
                    : 'text-brand-300 hover:bg-white/8 hover:text-brand-100'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-azure-400 rounded-full" />
                )}
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {open && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        {!open && (
          <div className="p-2 border-t border-brand-700/40">
            <button
              onClick={toggle}
              className="w-full flex justify-center py-2 text-brand-400 hover:text-brand-100 transition-colors rounded-lg hover:bg-white/8 mb-0.5"
              aria-label={dark ? 'Světlý režim' : 'Tmavý režim'}
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setOpen(true)}
              className="w-full flex justify-center py-2 text-brand-400 hover:text-brand-100 transition-colors rounded-lg hover:bg-white/8"
              aria-label={t.nav.expandAriaLabel}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        )}

        {open && (
          <div className="px-4 py-3 border-t border-brand-700/40 flex items-center justify-between">
            <p className="text-xs text-brand-500 font-medium tracking-wide">v1.0</p>
            <button
              onClick={toggle}
              className="text-brand-400 hover:text-brand-100 transition-colors"
              aria-label={dark ? 'Světlý režim' : 'Tmavý režim'}
            >
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
