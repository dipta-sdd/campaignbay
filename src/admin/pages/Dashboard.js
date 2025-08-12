import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from "@wordpress/url";

const Dashboard = () => {
    useEffect(() => {
        const fetchData = async () => {
            try {
                const params = {
                    period: 'custom',
                    start_date: '2025-01-01',
                    end_date: '2025-01-31',
                };
                const response = await apiFetch({ path: addQueryArgs('/campaignbay/v1/dashboard', params) });
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