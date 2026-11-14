import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import { ProfessionalRole, User, Opportunity } from '../types';
import {
  LayoutGrid,
  Search,
  Briefcase,
  Film,
  MessageSquare,
  Bell,
  Calendar,
  Sparkles,
  Settings,
  Headphones,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Star,
  Users,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  Crown,
  Menu,
  X,
  Ticket,
  Send,
  Camera
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CinematicLogo } from '../components/common/CinematicLogo';
import { CreateOpportunityModal } from '../components/common/CreateOpportunityModal';
import { CollaborationModal } from '../components/common/CollaborationModal';

// Role-specific soundstage photorealistic backdrops
const ROLE_SOUNDSTAGE_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  image: string;
  action1: { label: string; link?: string; modal?: string };
  action2: { label: string; link?: string; modal?: string };
  action3: { label: string; link?: string; modal?: string };
}> = {
  DIRECTOR: {
    title: 'Welcome Back, Director!',
    subtitle: "Let's bring your creative vision to life.",
    image: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&w=1200&q=80',
    action1: { label: 'Find Talent →', link: '/talent' },
    action2: { label: 'Post Opportunity →', modal: 'createOpp' },
    action3: { label: 'View Projects →', link: '/opportunities' }
  },
  PRODUCER: {
    title: 'Welcome Back, Executive Producer!',
    subtitle: 'Greenlight projects, review escrow milestones & cast leads.',
    image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=80',
    action1: { label: 'Review Cast & Crew →', link: '/talent' },
    action2: { label: 'Post Production Call →', modal: 'createOpp' },
    action3: { label: 'Escrow Vault →', link: '/escrow' }
  },
  CINEMATOGRAPHER: {
    title: 'Welcome Back, Cinematographer!',
    subtitle: '70mm Panavision optics, lighting rigs & color palettes ready.',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    action1: { label: 'Browse Shotlists →', link: '/opportunities' },
    action2: { label: 'Camera Crew →', link: '/talent' },
    action3: { label: 'Color Pipeline →', link: '/dashboard' }
  },
  ACTOR: {
    title: 'Welcome Back, Principal Actor!',
    subtitle: 'Audition calls, script table reads & red carpet galas await.',
    image: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
    action1: { label: 'Audition Notices →', link: '/opportunities' },
    action2: { label: 'Headshots Portfolio →', link: '/profile' },
    action3: { label: 'Festival Passes →', link: '/events' }
  },
  WRITER: {
    title: 'Welcome Back, Screenwriter!',
    subtitle: 'Craft dialogue, register treatments & pitch executive rooms.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    action1: { label: 'Open Writers Calls →', link: '/opportunities' },
    action2: { label: 'Script Registry →', link: '/dashboard' },
    action3: { label: 'Find Directors →', link: '/talent' }
  },
  EDITOR: {
    title: 'Welcome Back, Lead Editor!',
    subtitle: 'Timeline cuts, assembly sequences & Dolby Atmos stems.',
    image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80',
    action1: { label: 'Editing Calls →', link: '/opportunities' },
    action2: { label: 'Color Suite →', link: '/dashboard' },
    action3: { label: 'Talent Network →', link: '/talent' }
  }
};

const ALL_ROLES_LIST: { role: ProfessionalRole; label: string; icon: string }[] = [
  { role: 'DIRECTOR', label: 'Director', icon: '🎬' },
  { role: 'PRODUCER', label: 'Producer', icon: '💼' },
  { role: 'WRITER', label: 'Screenwriter', icon: '✍️' },
  { role: 'ACTOR', label: 'Actor', icon: '✨' },
  { role: 'CINEMATOGRAPHER', label: 'Cinematographer', icon: '🎥' },
  { role: 'EDITOR', label: 'Editor', icon: '✂️' },
  { role: 'MUSIC_DIRECTOR', label: 'Composer', icon: '🎵' },
  { role: 'VFX_ARTIST', label: 'VFX Artist', icon: '🪄' },
  { role: 'COLORIST', label: 'Colorist', icon: '🌈' },
  { role: 'LINE_PRODUCER', label: 'Line Producer', icon: '📊' }
];

interface RecommendedTalent {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
  verified: boolean;
  credits: string;
  bio: string;
}

const DEFAULT_RECOMMENDED_TALENT: RecommendedTalent[] = [
  {
    id: 'rec-1',
    name: 'Ananya Sharma',
    role: 'Actress • Model',
    rating: 4.9,
    reviewsCount: 248,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    verified: true,
    credits: 'Lead Actress in "Mirage of Kashi" (2025), Cannes Palme Nominee',
    bio: 'Classical theater trained dramatic lead actress with 8+ years feature film experience across Hindi and South Indian cinema.'
  },
  {
    id: 'rec-2',
    name: 'Arjun Varma',
    role: 'Director',
    rating: 4.8,
    reviewsCount: 321,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    verified: true,
    credits: 'Director of "Echoes of Malabar" (National Award Winner)',
    bio: 'Visionary narrative filmmaker specializing in high-concept period dramas, 70mm IMAX cinematography, and immersive soundscapes.'
  },
  {
    id: 'rec-3',
    name: 'Sneha Reddy',
    role: 'Writer',
    rating: 4.8,
    reviewsCount: 176,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    verified: true,
    credits: 'Head Screenwriter for 3 Box-Office Blockbusters (₹100 Cr+ club)',
    bio: 'Character-driven screenwriter and script doctor with sharp dialogue writing and pan-Indian narrative structuring.'
  },
  {
    id: 'rec-4',
    name: 'Rohit Kumar',
    role: 'Editor',
    rating: 4.7,
    reviewsCount: 203,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    verified: true,
    credits: 'Principal Film Editor on 12 Panavision Action Features',
    bio: 'High-octane pacing specialist proficient in Avid Symphony, DaVinci Resolve Studio color integration, and Dolby Atmos mastering.'
  }
];

export const DashboardPage: React.FC = () => {
  const { currentUser, activeRole, switchActiveRole, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TALENT' | 'OPPORTUNITIES' | 'PROJECTS' | 'MESSAGES' | 'NOTIFICATIONS' | 'EVENTS' | 'AI' | 'SETTINGS' | 'SUPPORT'>('DASHBOARD');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isCreateOppOpen, setIsCreateOppOpen] = useState(false);
  const [selectedTalentModal, setSelectedTalentModal] = useState<RecommendedTalent | null>(null);
  const [isEventRegistered, setIsEventRegistered] = useState(false);

  // Soundstage dynamic theme matching active role
  const soundstage = ROLE_SOUNDSTAGE_CONFIG[activeRole] || ROLE_SOUNDSTAGE_CONFIG.DIRECTOR;

  // Filtered recommended talent based on search bar
  const displayedTalent = useMemo(() => {
    if (!searchQuery.trim()) return DEFAULT_RECOMMENDED_TALENT;
    const q = searchQuery.toLowerCase();
    return DEFAULT_RECOMMENDED_TALENT.filter(
      t => t.name.toLowerCase().includes(q) || t.role.toLowerCase().includes(q) || t.credits.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleRoleSelect = (newRole: ProfessionalRole) => {
    switchActiveRole(newRole);
    setRoleMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0908] text-white flex flex-col md:flex-row relative selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* =========================================================================
          LEFT SIDEBAR (MATCHING USER SCREENSHOT EXACTLY)
          ========================================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0C0A09] border-r border-[#261B14] flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out md:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* Top: Logo & Main Navigation List */}
        <div className="flex-1 overflow-y-auto pt-6 px-4 space-y-6 scrollbar-none">
          
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between pb-2 border-b border-[#261B14]/80">
            <Link to="/" className="flex items-center">
              <CinematicLogo size="md" />
            </Link>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links (Matching Screenshot) */}
          <nav className="space-y-1.5">
            
            {/* Dashboard (Active Pill with Red Gradient) */}
            <button
              onClick={() => { setActiveTab('DASHBOARD'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-gradient-to-r from-red-600 via-red-600 to-rose-700 text-white font-bold shadow-lg shadow-red-600/30'
                  : 'text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-white" />
              <span>Dashboard</span>
            </button>

            {/* Search Talent */}
            <button
              onClick={() => { navigate('/talent'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <span>Search Talent</span>
            </button>

            {/* Opportunities */}
            <button
              onClick={() => { navigate('/opportunities'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span>Opportunities</span>
            </button>

            {/* My Projects */}
            <button
              onClick={() => { navigate('/opportunities'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Film className="w-4 h-4 text-gray-400" />
              <span>My Projects</span>
            </button>

            {/* Messages with Badge 3 */}
            <button
              onClick={() => { navigate('/messages'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span>Messages</span>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                3
              </span>
            </button>

            {/* Notifications with Badge 5 */}
            <button
              onClick={() => { navigate('/dashboard#notifications'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-4 h-4 text-gray-400" />
                <span>Notifications</span>
              </div>
              <span className="bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                5
              </span>
            </button>

            {/* Events */}
            <button
              onClick={() => { navigate('/events'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>Events</span>
            </button>

            {/* AI Recommendations */}
            <button
              onClick={() => { navigate('/ai-match'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Sparkles className="w-4 h-4 text-gray-400" />
              <span>AI Recommendations</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => { navigate('/profile'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Settings className="w-4 h-4 text-gray-400" />
              <span>Settings</span>
            </button>

            {/* Help & Support */}
            <button
              onClick={() => { navigate('/privacy'); setMobileSidebarOpen(false); }}
              className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 hover:text-white transition-all"
            >
              <Headphones className="w-4 h-4 text-gray-400" />
              <span>Help & Support</span>
            </button>
          </nav>

          {/* Switch Role Pill Button with Live Dropdown */}
          <div className="relative pt-2">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full px-3.5 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono font-bold flex items-center justify-between transition-all shadow-sm"
            >
              <span className="flex items-center space-x-2">
                <span>⇄</span>
                <span>Switch Role</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute left-0 right-0 mt-2 rounded-xl bg-[#14110E] border border-amber-500/40 p-1.5 shadow-2xl z-50 space-y-1">
                <div className="text-[10px] font-mono text-gray-400 uppercase px-2 py-1 border-b border-white/10">
                  Select Active Console
                </div>
                {ALL_ROLES_LIST.map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r.role)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition ${
                      activeRole === r.role
                        ? 'bg-amber-500 text-black font-bold'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{r.icon} {r.label}</span>
                    {activeRole === r.role && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Sidebar: User Profile Card & Cinema Watermark */}
        <div className="p-4 border-t border-[#261B14] bg-[#090807] relative overflow-hidden">
          
          {/* Subtle Vintage Camera Silhouette Watermark */}
          <div className="absolute -bottom-4 -left-2 opacity-15 pointer-events-none text-amber-500">
            <Camera className="w-24 h-24" />
          </div>

          <div className="relative flex items-center justify-between z-10">
            <div className="flex items-center space-x-2.5 min-w-0">
              <img
                src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border-2 border-amber-400/80 shadow-md shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate font-cinematic">
                  {currentUser?.name || 'Chakradhar N'}
                </div>
                <div className="text-[11px] text-amber-400 font-mono flex items-center space-x-1">
                  <span>{activeRole.replace('_', ' ')}</span>
                  <span>👑</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => { logout(); navigate('/'); }}
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/80 z-30 backdrop-blur-sm"
        />
      )}

      {/* =========================================================================
          MAIN STUDIO CANVAS & CONTENT AREA
          ========================================================================= */}
      <main className="md:pl-64 flex-1 flex flex-col min-h-screen">
        
        {/* Top Header Bar (Matching Screenshot) */}
        <header className="h-16 px-4 sm:px-8 border-b border-[#261B14] bg-[#0C0A09]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          
          <div className="flex items-center space-x-3 flex-1 max-w-xl">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search talent, projects, opportunities..."
                className="w-full bg-[#14110E] border border-amber-900/40 rounded-full pl-10 pr-4 py-2 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-amber-500/70 transition shadow-inner"
              />
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-3 ml-4">
            
            {/* Notifications Bell */}
            <button
              onClick={() => navigate('/dashboard#notifications')}
              className="relative p-2 rounded-full hover:bg-white/5 text-gray-300 hover:text-white transition"
            >
              <Bell className="w-5 h-5 text-gray-300" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center">
                5
              </span>
            </button>

            {/* Upgrade to Pro Button */}
            <button
              onClick={() => setIsProModalOpen(true)}
              className="px-3.5 sm:px-4 py-2 rounded-xl font-cinematic font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-glow-gold flex items-center space-x-1.5 transition-all"
            >
              <Crown className="w-4 h-4 text-black" />
              <span className="hidden sm:inline">Upgrade to Pro</span>
              <span className="sm:hidden font-bold">Pro</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* =====================================================================
              1. GRAND HERO BANNER (MATCHING SCREENSHOT)
              ===================================================================== */}
          <div className="w-full rounded-2xl border border-amber-900/40 relative overflow-hidden shadow-2xl min-h-[220px] sm:min-h-[250px] flex items-center justify-center text-center p-6 sm:p-10 group">
            
            {/* Photographic Background with Golden Film Reel & Cameraman */}
            <img
              src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80"
              alt="Cinema Production"
              className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Cinematic Gradient Overlays with Molten Gold & Crimson Highlights */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-amber-950/70" />
            <div className="absolute inset-0 bg-radial-at-c from-transparent via-black/60 to-black/95" />

            {/* Glowing 3D Film Reel & Cameraman Silhouette graphic details */}
            <div className="relative z-10 max-w-2xl mx-auto space-y-3">
              
              {/* Brand Typography with Star Lens Flare */}
              <h1 className="text-3xl sm:text-5xl font-extrabold font-cinematic tracking-tight text-white flex items-center justify-center space-x-2">
                <span>Cine</span>
                <span className="relative bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]">
                  Vantaara
                  <span className="absolute -top-3 -right-4 text-amber-300 text-lg animate-pulse">✦</span>
                </span>
              </h1>

              {/* Motto with Flourishes */}
              <div className="flex items-center justify-center space-x-3 text-amber-300 font-cinematic text-xs sm:text-sm tracking-widest italic">
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-amber-500/60" />
                <span>where stories meet talent</span>
                <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-amber-500/60" />
              </div>

              {/* Action Motto */}
              <p className="text-xs sm:text-sm text-gray-300 font-sans tracking-widest uppercase font-medium">
                Connect • Collaborate • Create Cinema
              </p>

              {/* Explore Button */}
              <div className="pt-2">
                <Link
                  to="/opportunities"
                  className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full border border-amber-500/50 bg-black/60 hover:bg-amber-500/20 text-amber-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg hover:border-amber-400"
                >
                  <span>Explore Opportunities</span>
                  <span>→</span>
                </Link>
              </div>

              {/* Carousel Indicator Dots */}
              <div className="flex items-center justify-center space-x-2 pt-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-glow-gold" />
                <span className="w-2 h-2 rounded-full bg-gray-600 hover:bg-gray-400 cursor-pointer" />
                <span className="w-2 h-2 rounded-full bg-gray-600 hover:bg-gray-400 cursor-pointer" />
                <span className="w-2 h-2 rounded-full bg-gray-600 hover:bg-gray-400 cursor-pointer" />
              </div>

            </div>
          </div>

          {/* =====================================================================
              2. FOUR METRIC STATS CARDS (MATCHING SCREENSHOT)
              ===================================================================== */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Talents Network */}
            <div className="p-4 rounded-2xl bg-[#13100E] border border-amber-900/30 shadow-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
                  <Users className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black font-cinematic text-white leading-none">
                    2.5K+
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">Talents Network</div>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-bold">
                ↑ 12%
              </span>
            </div>

            {/* Card 2: Projects */}
            <div className="p-4 rounded-2xl bg-[#13100E] border border-amber-900/30 shadow-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Film className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black font-cinematic text-white leading-none">
                    850+
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">Projects</div>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-bold">
                ↑ 18%
              </span>
            </div>

            {/* Card 3: Events */}
            <div className="p-4 rounded-2xl bg-[#13100E] border border-amber-900/30 shadow-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600/30 to-red-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                  <Calendar className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black font-cinematic text-white leading-none">
                    120+
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">Events</div>
                </div>
              </div>
              <span className="text-emerald-400 text-xs font-mono font-bold">
                ↑ 10%
              </span>
            </div>

            {/* Card 4: Platform Rating */}
            <div className="p-4 rounded-2xl bg-[#13100E] border border-amber-900/30 shadow-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/40 to-yellow-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-glow-gold">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black font-cinematic text-white leading-none">
                    4.8
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1">Platform Rating</div>
                </div>
              </div>
              <div className="flex text-amber-400 text-xs">
                ★★★★★
              </div>
            </div>

          </div>

          {/* =====================================================================
              3. MIDDLE SECTION: WELCOME BACK CARD + RECOMMENDED TALENT
              ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Card: Welcome Back, Director! (5 Columns) */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-900/30 bg-[#13100E] p-6 relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[320px]">
              
              {/* Real Soundstage Photography Background */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 pointer-events-none overflow-hidden">
                <img
                  src={soundstage.image}
                  alt={soundstage.title}
                  className="w-full h-full object-cover object-center mix-blend-screen"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#13100E]" />
              </div>

              {/* Title & Subtitle */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 text-sm font-bold font-cinematic">
                  <span>👑</span>
                  <span>{soundstage.title}</span>
                </div>
                <p className="text-xs text-gray-300 max-w-xs leading-relaxed">
                  {soundstage.subtitle}
                </p>
              </div>

              {/* Quick Actions (Matching Screenshot) */}
              <div className="relative z-10 pt-6 space-y-2.5">
                <div className="text-xs font-cinematic font-bold text-gray-300 uppercase tracking-wider">
                  Quick Actions
                </div>
                
                <div className="space-y-2">
                  {/* Action 1: Find Talent (Crimson Capsule) */}
                  <button
                    onClick={() => navigate(soundstage.action1.link || '/talent')}
                    className="w-full btn-director-red py-2.5 px-4 rounded-xl font-cinematic font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-md"
                  >
                    <span>👤</span>
                    <span>{soundstage.action1.label}</span>
                  </button>

                  {/* Action 2: Post Opportunity (Sleek Glass Capsule) */}
                  <button
                    onClick={() => setIsCreateOppOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 hover:border-amber-400 bg-black/60 hover:bg-amber-500/10 text-white font-cinematic font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition"
                  >
                    <span>🎬</span>
                    <span>{soundstage.action2.label}</span>
                  </button>

                  {/* Action 3: View Projects (Sleek Glass Capsule) */}
                  <button
                    onClick={() => navigate(soundstage.action3.link || '/opportunities')}
                    className="w-full py-2.5 px-4 rounded-xl border border-amber-500/40 hover:border-amber-400 bg-black/60 hover:bg-amber-500/10 text-white font-cinematic font-bold text-xs uppercase tracking-wider flex items-center space-x-2 transition"
                  >
                    <span>📁</span>
                    <span>{soundstage.action3.label}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Card: Recommended Talent for You (7 Columns) */}
            <div className="lg:col-span-7 rounded-2xl border border-amber-900/30 bg-[#13100E] p-6 shadow-lg flex flex-col justify-between">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#261B14]">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400">✨</span>
                  <h3 className="font-cinematic font-bold text-sm sm:text-base text-white">
                    Recommended Talent for You
                  </h3>
                </div>
                <Link
                  to="/talent"
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono font-bold flex items-center space-x-1"
                >
                  <span>View All</span>
                  <span>→</span>
                </Link>
              </div>

              {/* 4 Circular Talent Cards Row (Matching Screenshot) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
                {displayedTalent.map(talent => (
                  <div
                    key={talent.id}
                    className="flex flex-col items-center text-center p-3 rounded-xl bg-black/40 border border-[#261B14] hover:border-amber-500/40 transition group"
                  >
                    {/* Circular Avatar with Golden Ring */}
                    <div className="relative mb-2.5">
                      <img
                        src={talent.avatar}
                        alt={talent.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-amber-400/90 shadow-md group-hover:scale-105 transition-transform"
                      />
                      {talent.verified && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 bg-black rounded-full absolute -bottom-1 -right-1" />
                      )}
                    </div>

                    {/* Name & Role */}
                    <div className="text-xs font-bold font-cinematic text-white truncate w-full">
                      {talent.name}
                    </div>
                    <div className="text-[10px] text-gray-400 truncate w-full">
                      {talent.role}
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center space-x-1 text-[11px] text-amber-400 font-mono mt-1">
                      <span>★</span>
                      <span>{talent.rating}</span>
                      <span className="text-gray-500 text-[9px]">({talent.reviewsCount})</span>
                    </div>

                    {/* View Profile Button */}
                    <button
                      onClick={() => setSelectedTalentModal(talent)}
                      className="mt-3 w-full py-1.5 px-2 rounded-lg border border-amber-500/40 hover:border-amber-400 hover:bg-amber-500/10 text-amber-300 text-[11px] font-mono font-bold transition"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Carousel Arrow Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-[#261B14] text-xs font-mono text-gray-500">
                <span>4 Featured Crafts • Verified Credentials</span>
                <div className="flex space-x-2">
                  <button className="p-1.5 rounded-lg border border-[#261B14] text-gray-400 hover:text-white hover:border-amber-500/40 transition">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 rounded-lg border border-[#261B14] text-gray-400 hover:text-white hover:border-amber-500/40 transition">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* =====================================================================
              4. BOTTOM SECTION: EVENTS + RECENT ACTIVITY + PROMO CARD
              ===================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1: Upcoming Events (Matching Screenshot) */}
            <div className="rounded-2xl border border-amber-900/30 bg-[#13100E] p-5 shadow-lg flex flex-col justify-between">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#261B14]">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <h4 className="font-cinematic font-bold text-xs uppercase tracking-wider text-white">
                    Upcoming Events
                  </h4>
                </div>
                <Link to="/events" className="text-[11px] font-mono text-amber-400 hover:underline">
                  View All →
                </Link>
              </div>

              {/* Event Content */}
              <div className="py-4 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500/30 shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=400&q=80"
                      alt="CineVantaara Film Festival"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold font-cinematic text-white leading-tight">
                      CineVantaara Film Festival 2027
                    </h5>
                    <div className="text-[10px] text-amber-400 font-mono mt-1">
                      📅 15 Feb 2027
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      📍 Bangalore, India
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEventRegistered(true)}
                  className={`w-full py-2 px-4 rounded-xl font-cinematic font-bold text-xs uppercase tracking-wider transition ${
                    isEventRegistered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white shadow-md'
                  }`}
                >
                  {isEventRegistered ? '✓ Registered (Pass Issued)' : 'Register Now →'}
                </button>
              </div>

            </div>

            {/* Card 2: Your Recent Activity (Matching Screenshot) */}
            <div className="rounded-2xl border border-amber-900/30 bg-[#13100E] p-5 shadow-lg flex flex-col justify-between">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#261B14]">
                <div className="flex items-center space-x-2">
                  <span className="text-amber-400">⚡</span>
                  <h4 className="font-cinematic font-bold text-xs uppercase tracking-wider text-white">
                    Your Recent Activity
                  </h4>
                </div>
                <button onClick={() => navigate('/notifications')} className="text-[11px] font-mono text-amber-400 hover:underline">
                  View All →
                </button>
              </div>

              {/* Activity Timeline List */}
              <div className="py-2 space-y-3">
                
                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-sm shadow-red-500/50" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 font-medium truncate">
                      You applied for 3D Animator role
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0 shadow-sm shadow-amber-500/50" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 font-medium truncate">
                      New opportunity: Script Writer
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">5 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start space-x-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0 shadow-sm shadow-rose-500/50" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-200 font-medium truncate">
                      Message from Pranay Kalyan
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">1 day ago</div>
                  </div>
                </div>

              </div>

            </div>

            {/* Card 3: Dream. Collaborate. Create Promo (Matching Screenshot) */}
            <div className="rounded-2xl border border-amber-900/30 bg-[#13100E] p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
              
              {/* Background 35mm film reel & vintage cinema camera image */}
              <div className="absolute right-0 top-0 bottom-0 w-2/3 opacity-25 pointer-events-none">
                <img
                  src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80"
                  alt="Film Production"
                  className="w-full h-full object-cover object-right"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#13100E]" />
              </div>

              <div className="relative z-10 space-y-2">
                <h4 className="font-cinematic font-bold text-base text-amber-300 leading-tight">
                  Dream. Collaborate. Create.
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed max-w-xs">
                  Join the largest film-industry network platform connecting visionaries worldwide.
                </p>
              </div>

              <div className="relative z-10 pt-4">
                <Link
                  to="/talent"
                  className="inline-block py-2 px-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-black font-cinematic font-bold text-xs uppercase tracking-wider transition shadow-glow-gold"
                >
                  Explore Now →
                </Link>
              </div>

            </div>

          </div>

          {/* =====================================================================
              5. FOOTER (MATCHING SCREENSHOT)
              ===================================================================== */}
          <footer className="pt-6 border-t border-[#261B14] flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
            <div>
              © 2027 CineVantaara. All rights reserved.
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/privacy" className="hover:text-amber-300 transition">Privacy Policy</Link>
              <span>|</span>
              <Link to="/terms" className="hover:text-amber-300 transition">Terms of Service</Link>
              <span>|</span>
              <Link to="/privacy" className="hover:text-amber-300 transition">Contact Us</Link>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-[11px] text-gray-500">Follow Us:</span>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-red-500 transition">📺</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition">𝕏</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-pink-400 transition">📸</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition">💼</a>
            </div>
          </footer>

        </div>
      </main>

      {/* =========================================================================
          MODALS
          ========================================================================= */}
      {/* 1. Upgrade to Pro Modal */}
      {isProModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#14110E] border-2 border-amber-500/50 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsProModalOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center shadow-glow-gold">
                <Crown className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-cinematic font-bold text-white">
                CineVantaara Pro Pass
              </h3>
              <p className="text-xs text-gray-400">
                Unlock executive studio tools, unlimited opportunity postings & zero-fee escrow contracts.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              {[
                'Unlimited Casting & Crew Postings across 30 film crafts',
                'Priority verified gold badge on profile & proposals',
                'Full smart-contract Escrow Vault integration with zero platform surcharge',
                'Direct dispatch to National Award & Cannes selected directors',
                'Festival screener streaming in 4K Dolby Atmos master'
              ].map((feat, i) => (
                <div key={i} className="flex items-center space-x-2 text-gray-200">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  alert('Pro membership activated! Welcome to CineVantaara Citadel Executive.');
                  setIsProModalOpen(false);
                }}
                className="w-full py-3 rounded-xl font-cinematic font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-600 text-black shadow-glow-gold hover:from-amber-400 transition"
              >
                Activate Pro Membership (Annual)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. View Talent Profile Modal */}
      {selectedTalentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl bg-[#14110E] border border-amber-500/40 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedTalentModal(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-4">
              <img
                src={selectedTalentModal.avatar}
                alt={selectedTalentModal.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 shadow-xl"
              />
              <div>
                <h4 className="text-xl font-bold font-cinematic text-white">{selectedTalentModal.name}</h4>
                <div className="text-xs text-amber-400 font-mono">{selectedTalentModal.role}</div>
                <div className="text-xs text-gray-400 mt-1 flex items-center space-x-1">
                  <span>★ {selectedTalentModal.rating}</span>
                  <span>•</span>
                  <span>{selectedTalentModal.reviewsCount} Studio Reviews</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs border-y border-[#261B14] py-4">
              <div>
                <span className="font-mono text-gray-400 uppercase text-[10px] block mb-1">Recent Film Credit</span>
                <p className="text-gray-200 font-medium">{selectedTalentModal.credits}</p>
              </div>
              <div>
                <span className="font-mono text-gray-400 uppercase text-[10px] block mb-1">Biography & Discipline</span>
                <p className="text-gray-300 leading-relaxed">{selectedTalentModal.bio}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  navigate(`/messages?userName=${encodeURIComponent(selectedTalentModal.name)}`);
                  setSelectedTalentModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-cinematic font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 text-white shadow-md transition"
              >
                Send Direct Message
              </button>
              <button
                onClick={() => {
                  alert(`Collaboration invitation sent to ${selectedTalentModal.name}! Check your Sent proposals in Dashboard.`);
                  setSelectedTalentModal(null);
                }}
                className="flex-1 py-2.5 rounded-xl font-cinematic font-bold text-xs uppercase tracking-wider border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition"
              >
                Dispatch Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Create Opportunity Modal */}
      <CreateOpportunityModal
        isOpen={isCreateOppOpen}
        onClose={() => setIsCreateOppOpen(false)}
        onCreate={(newOpp) => {
          setIsCreateOppOpen(false);
          alert(`Opportunity "${newOpp.title}" created successfully!`);
        }}
      />

    </div>
  );
};
