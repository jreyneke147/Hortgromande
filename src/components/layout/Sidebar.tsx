import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  BarChart3,
  ClipboardList,
  GraduationCap,
  Map,
  FileText,
  Shield,
  Users,
  Settings,
  Leaf,
  ChevronLeft,
  Award,
  FolderOpen,
  PieChart,
  Globe,
  TrendingUp,
  AlertTriangle,
  HeartPulse,
  Bell,
  Ship,
  Upload,
  Package,
  Wallet,
} from 'lucide-react';

interface NavSection {
  title?: string;
  items: { to: string; label: string; icon: typeof LayoutDashboard }[];
}

const navSections: NavSection[] = [
  {
    items: [
      { to: '/', label: 'Overview', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Dashboards',
    items: [
      { to: '/dashboard/programme', label: 'Programme', icon: PieChart },
      { to: '/dashboard/sector', label: 'Sector', icon: Globe },
      { to: '/dashboard/entity', label: 'Entity', icon: Building2 },
    ],
  },
  {
    title: 'Data',
    items: [
      { to: '/programmes', label: 'Programmes', icon: FolderKanban },
      { to: '/projects', label: 'Projects / Entities', icon: Building2 },
      { to: '/indicators', label: 'Indicators', icon: BarChart3 },
      { to: '/data-collection', label: 'Data Collection', icon: ClipboardList },
    ],
  },
  {
    title: 'Commercial / Export',
    items: [
      { to: '/commercial/imports', label: 'Imports', icon: Upload },
      { to: '/commercial/consignments', label: 'Consignments', icon: Package },
      { to: '/commercial/trends', label: 'Performance', icon: Ship },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { to: '/forecasting', label: 'Forecasting (KPI)', icon: TrendingUp },
      { to: '/forecasting/mistico', label: 'Mistico Forecast', icon: TrendingUp },
      { to: '/financial-recon', label: 'Financial Recon', icon: Wallet },
      { to: '/benchmarking', label: 'Benchmarking', icon: Award },
      { to: '/risk-register', label: 'Risk Register', icon: AlertTriangle },
      { to: '/health', label: 'Health Scores', icon: HeartPulse },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/training', label: 'Training', icon: GraduationCap },
      { to: '/gis-map', label: 'GIS Map', icon: Map },
      { to: '/reports', label: 'Reports', icon: FileText },
      { to: '/documents', label: 'Documents', icon: FolderOpen },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/governance', label: 'Governance', icon: Shield },
      { to: '/notifications', label: 'Notifications', icon: Bell },
      { to: '/users', label: 'Users', icon: Users },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-brand-950 text-white transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-60'}`}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
          <Leaf size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-sm font-bold tracking-wide whitespace-nowrap">Hortgro M&E</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-3' : ''}>
            {section.title && !collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                {section.title}
              </p>
            )}
            {collapsed && si > 0 && <div className="mx-3 my-2 border-t border-white/10" />}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/8'
                    } ${collapsed ? 'justify-center' : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-2 pb-4">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/8 transition-colors text-sm"
        >
          <ChevronLeft size={18} className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
