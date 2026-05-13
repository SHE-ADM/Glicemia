import { useState } from 'react';
import type { ReactNode } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';

const roleLabel: Record<string, string> = {
  admin:    'Administrador',
  user:     'Usuária',
  readonly: 'Somente leitura',
};

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function IconHome() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function IconHistory() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

// ── NavItem ───────────────────────────────────────────────────────────────────

interface NavItemProps {
  label:    string;
  icon:     ReactNode;
  active?:  boolean;
  disabled?: boolean;
}

function NavItem({ label, icon, active, disabled }: NavItemProps) {
  const base = 'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-sans transition-colors duration-150';

  if (disabled) {
    return (
      <div className={`${base} text-ink-faint cursor-not-allowed select-none`}>
        <span className="opacity-40">{icon}</span>
        <span className="opacity-40">{label}</span>
        <span className="ml-auto text-[10px] font-sans text-ink-faint opacity-40 tracking-wide">em breve</span>
      </div>
    );
  }

  if (active) {
    return (
      <div className={`${base} bg-violet-500/10 text-violet-300 border-l-2 border-violet-500 -ml-px pl-[11px]`}>
        <span className="text-violet-400">{icon}</span>
        <span className="font-medium">{label}</span>
      </div>
    );
  }

  return (
    <div className={`${base} text-ink-secondary hover:text-ink-primary hover:bg-surface-raised cursor-pointer`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

// ── DashboardLayout ───────────────────────────────────────────────────────────

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : '?';

  return (
    <div className="min-h-screen bg-gradient-page flex">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={[
        'fixed top-0 left-0 h-full w-60 bg-surface-card border-r border-edge-default z-30',
        'flex flex-col transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:translate-x-0 lg:static lg:flex',
      ].join(' ')}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-edge-default flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-white text-xs font-bold font-mono">G</span>
            </div>
            <span className="font-sans text-sm font-semibold text-ink-primary tracking-wide">
              she-glicemia
            </span>
          </div>
          <button
            className="lg:hidden text-ink-muted hover:text-ink-primary p-1"
            onClick={() => setSidebarOpen(false)}
          >
            <IconX />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          <p className="font-sans text-[10px] tracking-ultra uppercase text-ink-faint px-3 mb-3">
            Menu
          </p>
          <NavItem label="Dashboard"      icon={<IconHome />}     active />
          <NavItem label="Histórico"      icon={<IconHistory />}  disabled />
          <NavItem label="Configurações"  icon={<IconSettings />} disabled />
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-edge-default flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center flex-shrink-0">
              <span className="font-sans text-xs font-bold text-violet-300">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm font-medium text-ink-primary truncate">
                {profile?.full_name ?? 'Usuário'}
              </p>
              <p className="font-sans text-xs text-ink-muted">
                {profile?.role ? roleLabel[profile.role] : ''}
              </p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-btn text-xs font-sans text-ink-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150"
          >
            <IconLogout />
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Mobile topbar */}
        <header className="h-14 lg:hidden bg-surface-card border-b border-edge-default flex items-center px-4 gap-3 sticky top-0 z-10 flex-shrink-0">
          <button
            className="text-ink-muted hover:text-ink-primary p-1 -ml-1"
            onClick={() => setSidebarOpen(true)}
          >
            <IconMenu />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gradient-primary flex items-center justify-center">
              <span className="text-white text-[9px] font-bold font-mono">G</span>
            </div>
            <span className="font-sans text-sm font-semibold text-ink-primary">Medidor de Glicemia</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
