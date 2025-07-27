import { __ } from '@wordpress/i18n';

const Dashboard = () => {
    return (
        <div className='wpab-cb-page'>
            <h1 className='wpab-cb-page-header'>{__('Dashboard' , 'wpab-cb-bay-boilerplate')}</h1>
            <p>Welcome to the wpab-cb Bay Boilerplate Dashboard.</p>
        </div>
    );
};

export default Dashboard;