import React, { useState, useEffect } from 'react';
import { Settings, PiggyBank, BookOpen, Menu, ChevronLeft, User, LogOut, Palette, ArrowUpCircle, Coins, Home, Target, Wallet } from 'lucide-react';

const menuItems = [
    { name: 'Dashboard', icon: Home, href: '/overview' },
    { name: 'Goals', icon: Target, href: '/goals' },
    { name: 'Learning', icon: BookOpen, href: '/learning' },
    { name: 'Settings', icon: Settings, href: '/settings' },
    { name: 'Budget', icon: Wallet, href: '#' },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  userName = 'John Doe', 
  userEmail = 'john@example.com', 
  onLogout 
}) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeItem, setActiveItem] = useState('Dashboard');
    const [isMobile, setIsMobile] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Check for mobile screen size
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleMouseEnter = () => {
        if (!isMobile) {
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        if (!isMobile) {
            setIsHovered(false);
        }
    };

    // Only show expanded on desktop if hovered while collapsed
    const shouldShowExpanded = !isCollapsed || (!isMobile && isCollapsed && isHovered);

    // Mobile: show sidebar if not collapsed
    const mobileSidebarVisible = isMobile && !isCollapsed;

  return (
    <>
            {/* Mobile open sidebar button */}
            {isMobile && isCollapsed && (
      <button
                    className="fixed top-4 left-4 z-50 p-2 bg-black text-white rounded-full md:hidden shadow-lg"
                    onClick={() => setIsCollapsed(false)}
                    aria-label="Open sidebar"
                >
                    <Menu className="w-6 h-6" />
      </button>
            )}
            {/* Mobile overlay */}
            {mobileSidebarVisible && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsCollapsed(true)}
                />
            )}
            
            <aside 
                className={`sidebar${isCollapsed ? ' collapsed' : ''}${shouldShowExpanded ? ' expanded' : ''}${mobileSidebarVisible ? ' mobile-visible' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <header className="sidebar__header">
                    <a href="#" className="sidebar__logo">
                        <div className="sidebar__logo-icon">
                            <Coins className="w-6 h-6" />
                        </div>
                        <div className="sidebar__logo-texts">
                            <span className="sidebar__logo-goldplus">GoldPlus</span>
                            <span className="sidebar__logo-advisory">Advisory</span>
                        </div>
                    </a>
            <button
                        className="sidebar__toggle"
                        onClick={toggleSidebar}
                        aria-label="Toggle sidebar"
            >
                        <ChevronLeft className="w-5 h-5" />
            </button>
                </header>

                <nav className="sidebar__nav">
                    <ul className="sidebar__menu">
                        {menuItems.map((item) => {
                            const IconComponent = item.icon;
                            // Special handler for Budget
                            if (item.name === 'Budget') {
                                return (
                                    <li key={item.name} className="sidebar__menu-item">
                                        <a 
                                            href="#"
                                            className={`sidebar__menu-link ${activeItem === item.name ? 'active' : ''}`}
                                            onClick={e => {
                                                e.preventDefault();
                                                setActiveItem(item.name);
                                                window.dispatchEvent(new CustomEvent('open-adjust-budget'));
                                            }}
                                        >
                                            <div className="sidebar__menu-icon">
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <span className="sidebar__menu-text">{item.name}</span>
                                            {!shouldShowExpanded && (
                                                <div className="sidebar__tooltip">
                                                    {item.name}
                                                </div>
                                            )}
                                        </a>
                                    </li>
                                );
                            }
                            return (
                                <li key={item.name} className="sidebar__menu-item">
                                    <a 
                                        href={item.href} 
                                        className={`sidebar__menu-link ${activeItem === item.name ? 'active' : ''}`}
                                        onClick={() => setActiveItem(item.name)}
                                    >
                                        <div className="sidebar__menu-icon">
                                            <IconComponent className="w-5 h-5" />
                                        </div>
                                        <span className="sidebar__menu-text">{item.name}</span>
                                        {!shouldShowExpanded && (
                                            <div className="sidebar__tooltip">
                                                {item.name}
          </div>
        )}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="sidebar__footer">
                    <div className="sidebar__profile">
                        <img 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                            alt="User Avatar" 
                            className="sidebar__profile-avatar"
                            onError={(e) => { 
                                (e.currentTarget as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(userName) + '&background=333&color=fff&size=40'; 
                            }}
                        />
                        <div className="sidebar__profile-info">
                            <div className="sidebar__profile-name">{userName}</div>
                            <div className="sidebar__profile-email">{userEmail}</div>
                        </div>
                        {!shouldShowExpanded && (
                            <div className="sidebar__tooltip sidebar__tooltip--profile">
                                <div className="font-medium">{userName}</div>
                                <div className="text-sm opacity-75">{userEmail}</div>
                            </div>
                        )}
                    </div>
                    <button 
                        className="sidebar__logout" 
                        onClick={onLogout}
                        aria-label="Logout"
                    >
                        <div className="sidebar__logout-icon">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="sidebar__logout-text">Logout</span>
                        {!shouldShowExpanded && (
                            <div className="sidebar__tooltip">
                                Logout
                            </div>
                        )}
                    </button>
                </div>

                <style jsx>{`
                    .sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100vh;
                        width: 260px;
                        background-color: #000000;
                        padding: 1.5rem 1rem;
                        transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 50;
                        display: flex;
                        flex-direction: column;
                        border-right: 1px solid #1a1a1a;
                        overflow: hidden;
                    }

                    .sidebar.collapsed {
                        width: 80px;
                    }

                    .sidebar.collapsed.expanded {
                        width: 260px;
                    }

                    @media (max-width: 767px) {
                        .sidebar {
                            width: 260px;
                            transform: translateX(-100%);
                            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
                        }
                        .sidebar.mobile-visible {
                            transform: translateX(0);
                            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
                        }
                        .sidebar.collapsed.expanded {
                            width: 80px;
                        }
                    }

                    .sidebar__header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 2rem;
                        flex-shrink: 0;
                    }

                    .sidebar__logo {
                        display: flex;
                        align-items: center;
                        color: #ffffff;
                        text-decoration: none;
                        transition: all 0.3s ease;
                        padding: 0.5rem;
                        border-radius: 8px;
                        overflow: hidden;
                    }

                    .sidebar__logo:hover {
                        background-color: #1a1a1a;
                        transform: translateY(-1px);
                    }

                    .sidebar__logo-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 32px;
                        height: 32px;
                        background: linear-gradient(135deg, #ffd700, #ffed4a);
                        border-radius: 8px;
                        margin-right: 0.75rem;
                        flex-shrink: 0;
                        color: #000000;
                        transition: all 0.3s ease;
                    }

                    .sidebar__logo:hover .sidebar__logo-icon {
                        transform: rotate(5deg) scale(1.05);
                    }

                    .sidebar__logo-texts {
                        display: flex;
                        flex-direction: column;
                        line-height: 1.1;
                        min-width: 0;
                    }

                    .sidebar__logo-goldplus {
                        font-family: 'Inter', sans-serif;
                        font-size: 1.25rem;
                        font-weight: 700;
                        letter-spacing: -0.02em;
                        color: #ffffff;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .sidebar__logo-advisory {
                        font-family: 'Inter', sans-serif;
                        font-size: 0.75rem;
                        font-weight: 400;
                        font-style: italic;
                        color: #ffd700;
                        letter-spacing: 0.05em;
                        margin-top: -2px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .sidebar__toggle {
                        color: #666666;
                        background: none;
                        border: none;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        padding: 0.5rem;
                        border-radius: 6px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }

                    .sidebar__toggle:hover {
                        color: #ffffff;
                        background-color: #1a1a1a;
                        transform: scale(1.1);
                    }

                    .sidebar.collapsed .sidebar__toggle {
                        transform: rotate(180deg);
                    }

                    .sidebar.collapsed .sidebar__toggle:hover {
                        transform: rotate(180deg) scale(1.1);
                    }

                    .sidebar__nav {
                        flex-grow: 1;
                        overflow-y: auto;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }

                    .sidebar__nav::-webkit-scrollbar {
                        display: none;
                    }

                    .sidebar__menu {
                        list-style-type: none;
                        padding: 0;
                        margin: 0;
                    }
                    
                    .sidebar__menu-item {
                        margin-bottom: 0.25rem;
                        position: relative;
                    }

                    .sidebar__menu-link {
                        display: flex;
                        align-items: center;
                        padding: 0.875rem 1rem;
                        color: #888888;
                        text-decoration: none;
                        border-radius: 12px;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        white-space: nowrap;
                        position: relative;
                        overflow: hidden;
                        margin-bottom: 0.125rem;
                    }

                    .sidebar__menu-link::before {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        bottom: 0;
                        width: 0;
                        background: linear-gradient(135deg, #ffd700, #ffed4a);
                        transition: width 0.3s ease;
                        border-radius: 12px;
                    }

                    .sidebar__menu-link:hover::before {
                        width: 4px;
                    }

                    .sidebar__menu-link.active::before {
                        width: 4px;
                    }

                    .sidebar__menu-link:hover {
                        background-color: #1a1a1a;
                        color: #ffffff;
                        transform: translateX(4px);
                    }

                    .sidebar__menu-link.active {
                        background-color: #1a1a1a;
                        color: #ffffff;
                        transform: translateX(4px);
                    }

                    .sidebar__menu-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 1rem;
                        min-width: 24px;
                        transition: all 0.3s ease;
                        flex-shrink: 0;
                    }

                    .sidebar__menu-link:hover .sidebar__menu-icon {
                        transform: scale(1.1);
                    }

                    .sidebar__menu-link.active .sidebar__menu-icon {
                        color: #ffd700;
                        transform: scale(1.1);
                    }

                    .sidebar__menu-text {
                        font-weight: 500;
                        transition: all 0.3s ease;
                        min-width: 0;
                        opacity: 1;
                    }

                    .sidebar.collapsed:not(.expanded) .sidebar__menu-text,
                    .sidebar.collapsed:not(.expanded) .sidebar__logo-texts,
                    .sidebar.collapsed:not(.expanded) .sidebar__profile-info,
                    .sidebar.collapsed:not(.expanded) .sidebar__logout-text {
                        opacity: 0;
                        width: 0;
                        overflow: hidden;
                    }
                    .sidebar.collapsed.expanded .sidebar__menu-text,
                    .sidebar.collapsed.expanded .sidebar__logo-texts,
                    .sidebar.collapsed.expanded .sidebar__profile-info,
                    .sidebar.collapsed.expanded .sidebar__logout-text {
                        opacity: 1;
                        width: auto;
                        overflow: visible;
                    }

                    .sidebar__tooltip {
                        position: absolute;
                        left: calc(100% + 1rem);
                        top: 50%;
                        transform: translateY(-50%);
                        background-color: #1a1a1a;
                        color: #ffffff;
                        padding: 0.5rem 0.75rem;
                        border-radius: 8px;
                        font-size: 0.875rem;
                        font-weight: 500;
                        white-space: nowrap;
                        opacity: 0;
                        visibility: hidden;
                        transition: all 0.3s ease;
                        z-index: 1000;
                        border: 1px solid #333333;
                        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
                    }

                    .sidebar__tooltip::before {
                        content: '';
                        position: absolute;
                        right: 100%;
                        top: 50%;
                        transform: translateY(-50%);
                        border: 5px solid transparent;
                        border-right-color: #1a1a1a;
                    }

                    .sidebar__tooltip--profile {
                        left: calc(100% + 1rem);
                        top: 0;
                        transform: none;
                    }

                    .sidebar.collapsed .sidebar__menu-link:hover .sidebar__tooltip,
                    .sidebar.collapsed .sidebar__profile:hover .sidebar__tooltip,
                    .sidebar.collapsed .sidebar__logout:hover .sidebar__tooltip {
                        opacity: 1;
                        visibility: visible;
                        transform: translateY(-50%) translateX(0.5rem);
                    }

                    .sidebar.collapsed .sidebar__tooltip--profile:hover {
                        transform: translateX(0.5rem);
                    }

                    .sidebar__footer {
                        margin-top: auto;
                        flex-shrink: 0;
                        padding-top: 1rem;
                        border-top: 1px solid #1a1a1a;
                    }

                    .sidebar__profile {
                        display: flex;
                        align-items: center;
                        padding: 0.875rem 1rem;
                        background-color: #111111;
                        border-radius: 12px;
                        color: #ffffff;
                        overflow: hidden;
                        transition: all 0.3s ease;
                        position: relative;
                        margin-bottom: 0.5rem;
                    }

                    .sidebar__profile:hover {
                        background-color: #1a1a1a;
                        transform: translateY(-1px);
                    }

                    .sidebar__profile-avatar {
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        object-fit: cover;
                        margin-right: 0.875rem;
                        flex-shrink: 0;
                        border: 2px solid #ffd700;
                        transition: all 0.3s ease;
                    }

                    .sidebar__profile:hover .sidebar__profile-avatar {
                        transform: scale(1.05);
                        border-color: #ffed4a;
                    }

                    .sidebar__profile-info {
                        overflow: hidden;
                        white-space: nowrap;
                        transition: all 0.3s ease;
                        min-width: 0;
                    }
                    
                    .sidebar__profile-name {
                        font-weight: 600;
                        font-size: 0.875rem;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .sidebar__profile-email {
                        font-size: 0.75rem;
                        color: #888888;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .sidebar__logout {
                        display: flex;
                        align-items: center;
                        padding: 0.875rem 1rem;
                        color: #888888;
                        background: none;
                        border: none;
                        border-radius: 12px;
                        transition: all 0.3s ease;
                        white-space: nowrap;
                        width: 100%;
                        cursor: pointer;
                        position: relative;
                        overflow: hidden;
                    }
                    
                    .sidebar__logout:hover {
                        background-color: #1a1a1a;
                        color: #ff4444;
                        transform: translateX(4px);
                    }

                    .sidebar__logout-icon {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        margin-right: 1rem;
                        min-width: 24px;
                        transition: all 0.3s ease;
                        flex-shrink: 0;
                    }

                    .sidebar__logout:hover .sidebar__logout-icon {
                        transform: scale(1.1);
                    }

                    .sidebar__logout-text {
                        font-weight: 500;
                        transition: all 0.3s ease;
                        text-align: left;
                    }

                    @media (max-width: 767px) {
                        .sidebar__tooltip {
                            display: none;
                        }
                    }
                `}</style>
            </aside>
    </>
  );
};

export default Sidebar;