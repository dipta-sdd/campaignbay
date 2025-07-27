import { NavLink, Outlet } from 'react-router-dom';


const AppLayout = () => {
    return (
        <div className='wpab-cb-container radius-large'>
            <Outlet />
        </div>
    );
};

export default AppLayout;