import { DataViews, FOLDER_ICON } from '@wordpress/dataviews/wp';
import { Button, Badge } from '@wordpress/components';
import { useState, useMemo, useEffect } from '@wordpress/element'; // <-- NEW: Import useState
import { __ } from '@wordpress/i18n';
import { useNavigate } from 'react-router-dom';
import { Icon, plus } from '@wordpress/icons';
import apiFetch from '@wordpress/api-fetch';
import { __experimentalConfirmDialog as ConfirmDialog } from '@wordpress/components';
import { useToast } from '../store/toast/use-toast';




const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const [view, setView] = useState({
        type: 'table', // The default view type
        search: '', // The search term
        page: 1, // The current page number
        perPage: 5, // Items per page
        fields: ['status', 'campaign_type', 'target', 'value', 'start_datetime', 'end_datetime'],
        titleField: 'title',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const { addToast } = useToast();
    // Fields and Actions definitions remain the same...
    const fields = useMemo(
        () => [
            {
                id: 'title',
                header: __('Title', 'campaignbay'),
                render: ({ item }) => <strong>{item.title}</strong>,
                enableHiding: true,
            },
            {
                id: 'status',
                header: __('Status', 'campaignbay'),
                render: ({ item }) => {
                    // Map internal status codes to human-readable labels and badge types
                    let label = '';
                    let badgeType = '';
                    switch (item.status) {
                        case 'wpab_cb_active':
                            label = __('Active', 'campaignbay');
                            badgeType = 'success';
                            break;
                        case 'wpab_cb_scheduled':
                            label = __('Scheduled', 'campaignbay');
                            badgeType = 'warning';
                            break;
                        case 'wpab_cb_expired':
                            label = __('Expired', 'campaignbay');
                            badgeType = 'error';
                            break;
                        case 'wpab_cb_draft':
                        default:
                            label = __('Draft', 'campaignbay');
                            badgeType = 'info';
                            break;
                    }
                    return (
                        <span
                            status={badgeType}
                        >
                            {label}
                        </span>
                    );
                },
                enableHiding: true,
            },
            {
                id: 'campaign_type',
                header: __('Campaign Type', 'campaignbay'),
                render: ({ item }) => {
                    // Map internal campaign_type to human-readable
                    let label = '';
                    switch (item.campaign_type) {
                        case 'quantity':
                            label = __('Quantity', 'campaignbay');
                            break;
                        case 'early_bird':
                            label = __('Early Bird', 'campaignbay');
                            break;
                        case 'bogo':
                            label = __('BOGO', 'campaignbay');
                            break;
                        default:
                            label = item.campaign_type;
                    }
                    return label;
                },
                enableHiding: true,
            },
            {
                id: 'target',
                header: __('Target', 'campaignbay'),
                render: ({ item }) => {
                    // Map target_type to human-readable
                    switch (item.target_type) {
                        case 'entire_store':
                            return __('Entire Store', 'campaignbay');
                        case 'categories':
                            return __('Categories', 'campaignbay');
                        case 'products':
                            return __('Products', 'campaignbay');
                        case 'tags':
                            return __('Tags', 'campaignbay');
                        default:
                            return item.target_type;
                    }
                },
                enableHiding: true,
            },
            {
                id: 'value',
                header: __('Value', 'campaignbay'),
                render: ({ item }) => {
                    // Show discount value and type
                    if (item.discount_type === 'percentage') {
                        return `${item.discount_value}%`;
                    } else if (item.discount_type === 'fixed_cart' || item.discount_type === 'fixed_product') {
                        return `${item.discount_value}`;
                    }
                    return item.discount_value;
                },
                enableHiding: true,
            },
            {
                id: 'start_datetime',
                header: __('Start Date', 'campaignbay'),
                render: ({ item }) => {
                    if (!item.start_datetime) return '';
                    const date = new Date(item.start_datetime);
                    return date.toLocaleString();
                },
                enableHiding: true,
            },
            {
                id: 'end_datetime',
                header: __('End Date', 'campaignbay'),
                render: ({ item }) => {
                    if (!item.end_datetime) return '';
                    const date = new Date(item.end_datetime);
                    return date.toLocaleString();
                },
                enableHiding: true,
            },
        ],
        []
    );

    const actions = useMemo(
        () => [
            {
                id: 'edit',
                label: __('Edit', 'campaignbay'),
                callback: (item) => {
                    navigate(`./${item[0].id}`);
                },
            },
            {
                id: 'delete',
                label: __('Delete', 'campaignbay'),
                isDestructive: true,
                callback: (item) => {
                    setSelectedCampaign(item);
                    setIsModalOpen(true);
                },
            },
        ],
        []
    );

    const defaultLayouts = {
        table: {
            showMedia: false,
        },
        grid: {
            showMedia: false,
        },
    };
    useEffect(() => {
        setIsLoading(true);
        const fetchCampaigns = async () => {
            try {
                const response = await apiFetch({
                    path: '/campaignbay/v1/campaigns',
                    method: 'GET',
                });
                setCampaigns(response);
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                addToast(__('Something went wrong, please try again later.', 'campaignbay'), 'error');
            }

        };

        fetchCampaigns();
    }, []);

    const handleConfirmDelete = async () => {
        try {
            const response = await apiFetch({
                path: `/campaignbay/v1/campaigns/${selectedCampaign[0]?.id}`,
                method: 'DELETE',
            });
            addToast(__('Campaign deleted successfully', 'campaignbay'), 'success');
            setCampaigns(campaigns.filter(campaign => campaign.id !== selectedCampaign[0]?.id));
            console.log('campaigns', campaigns);
            console.log('selectedCampaign', selectedCampaign);
        } catch (error) {
            addToast(__('Error deleting campaign', 'campaignbay'), 'error');
        }
        setIsModalOpen(false);
    };


    return (

        <div className='cb-page'>
            <div className="cb-page-header-container">
                <div className="cb-page-header-title">{__('Campaigns', 'campaignbay')}</div>
                <div className="cb-page-header-actions">
                    <button className="wpab-cb-btn wpab-cb-btn-primary " onClick={() => navigate('/campaigns/add')}>
                        <Icon icon={plus} fill="currentColor" />
                        {__('Add Campaign', 'campaignbay')}
                    </button>
                </div>
            </div>
            <div className="cb-page-container">
                <div className="cb-bg-white">
                    <DataViews
                        data={campaigns}
                        isLoading={isLoading}
                        fields={fields}
                        actions={actions}
                        view={view}
                        onChangeView={setView}
                        paginationInfo={{
                            totalItems: 5,
                            totalPages: 5,
                        }}
                        defaultLayouts={defaultLayouts}
                        search={false}
                        filters={false}
                        perPageSize={[5, 10, 25, 100]}
                    />
                </div>
            </div>

            <ConfirmDialog
                isOpen={isModalOpen}
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsModalOpen(false)}
            >
                {__('Are you sure you want to delete this campaign?', 'campaignbay')}
            </ConfirmDialog>

        </div>


    );
};

export default Campaigns;