import { NavLink, Outlet } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

const MainNavLink = ({ to, children }) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => (isActive ? 'nav-tab nav-tab-active' : 'nav-tab')}
        >
            {children}
        </NavLink>
    );
};

const AppLayout = () => {
    return (
        // Use the standard WordPress 'wrap' class for consistent spacing
        <div className="wrap">
            {/* Main Plugin Title */}
            bhhjgh
            <h1>{__('AutoPilot Discounts Pro', 'autopilot-discounts')}</h1>

            {/* Tabbed Navigation */}
            <nav className="nav-tab-wrapper">
                <MainNavLink to="/">{__('Dashboard', 'autopilot-discounts')}</MainNavLink>
                <MainNavLink to="/rules">{__('Discount Rules', 'autopilot-discounts')}</MainNavLink>
                <MainNavLink to="/analytics">{__('Analytics', 'autopilot-discounts')}</MainNavLink>
                <MainNavLink to="/settings">{__('Settings', 'autopilot-discounts')}</MainNavLink>
            </nav>

            <main className="autopilot-page-content" style={{ marginTop: '20px' }}>
                {/* The Outlet will render the currently active page component */}
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;