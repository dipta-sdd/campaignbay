import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const Dashboard = () => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiFetch({ path: '/campaignbay/v1/dashboard?period=7days' });
                console.log(response);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);
    return (
        <div className='wpab-cb-page'>
            <h1 className='wpab-cb-page-header'>{__('Dashboard' , 'wpab-cb-bay-boilerplate')}</h1>
            <p>Welcome to the wpab-cb Bay Boilerplate Dashboard.</p>
        </div>
    );
};

export default Dashboard;