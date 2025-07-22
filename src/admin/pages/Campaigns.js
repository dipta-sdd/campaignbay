import { DataViews, FOLDER_ICON } from '@wordpress/dataviews';
import { Button, Badge } from '@wordpress/components';
import { useState, useMemo } from '@wordpress/element'; // <-- NEW: Import useState
import { __ } from '@wordpress/i18n';

// --- Dummy Data (No changes here) ---
const dummyData = [
    {
        id: 1,
        campaignName: 'Summer Sale 2025',
        status: 'Active',
        discountType: 'Schedule Discount',
        target: 'Entire Store',
        value: '20%',
        startDate: 'Jun 1, 2025',
        endDate: 'Aug 31, 2025',
        usage: 1247,
    },
    {
        id: 2,
        campaignName: 'BOGO Electronics',
        status: 'Scheduled',
        discountType: 'Buy 1 Get 1',
        target: 'Electronics Category',
        value: 'Buy 1 Get 1',
        startDate: 'Mar 15, 2025',
        endDate: 'Mar 31, 2025',
        usage: 0,
    },
    {
        id: 3,
        campaignName: 'Early Bird Special',
        status: 'Active',
        discountType: 'EarlyBird',
        target: 'New Arrivals',
        value: '$15 off',
        startDate: 'Jan 1, 2025',
        endDate: 'Dec 31, 2025',
        usage: 432,
    },
    {
        id: 4,
        campaignName: 'Holiday Flash Sale',
        status: 'Expired',
        discountType: 'Schedule Discount',
        target: 'Entire Store',
        value: '35%',
        startDate: 'Dec 20, 2024',
        endDate: 'Dec 31, 2024',
        usage: 2156,
    },
    {
        id: 5,
        campaignName: 'Clothing Category Sale',
        status: 'Draft',
        discountType: 'By Product Category',
        target: 'Clothing',
        value: '25%',
        startDate: 'Apr 1, 2025',
        endDate: 'Apr 30, 2025',
        usage: 0,
    },
];

const Campaigns = () => {
    // --- NEW: State Management for the View ---
    const [view, setView] = useState({
        type: 'table', // The default view type
        search: '', // The search term
        page: 1, // The current page number
        perPage: 5, // Items per page
        fields: ['status', 'campaignName', 'discountType', 'target', 'value', 'startDate', 'endDate', 'usage'],
        // You can also add state for sorting, filters, etc. here
    });

    // Fields and Actions definitions remain the same...
    const fields = useMemo(
        () => [
            {
                id: 'campaignName',
                header: __('Campaign Name', 'wpab-cb'),
                render: ({ item }) => <strong>{item.campaignName}</strong>,
                enableHiding: true,
            },
            {
                id: 'status',
                header: __('Status', 'wpab-cb'),
                render: ({ item }) => {
                    const isSuccess = item.status === 'Active';
                    const isWarning = item.status === 'Scheduled';
                    const isError = item.status === 'Expired';
                    const isInfo = item.status === 'Draft';
                    return (
                        <span
                            isSuccess={isSuccess}
                            isWarning={isWarning}
                            isDestructive={isError}
                            isInfo={isInfo}
                        >
                            {item.status}
                        </span>
                    );
                },
                enableHiding: true,
            },
            { id: 'discountType', header: __('Discount Type', 'wpab-cb'), enableHiding: true, },
            { id: 'target', header: __('Target', 'wpab-cb'), enableHiding: true, },
            { id: 'value', header: __('Value', 'wpab-cb'), enableHiding: true, },
            { id: 'startDate', header: __('Start Date', 'wpab-cb'), enableHiding: true, },
            { id: 'endDate', header: __('End Date', 'wpab-cb'), enableHiding: true, },
            { id: 'usage', header: __('Usage', 'wpab-cb'), enableHiding: true, },
        ],
        []
    );

    const actions = useMemo(
        () => [
            {
                id: 'edit',
                label: __('Edit', 'wpab-cb'),
                callback: (item) => alert(`Editing "${item.campaignName}"`),
            },
            {
                id: 'delete',
                label: __('Delete', 'wpab-cb'),
                isDestructive: true,
                callback: (item) => {
                    if (window.confirm(`Delete "${item.campaignName}"?`)) {
                        console.log('Deleting campaign:', item);
                    }
                },
            },
        ],
        []
    );

    console.log('view', view);
    return (

        <DataViews
            data={dummyData}
            fields={fields}
            actions={actions}
            // --- NEW: Pass the state and handlers to the component ---
            view={view}
            onChangeView={setView}
            paginationInfo={{
                totalItems: 5,
                totalPages: 1,
            }}
        />

    );
};

export default Campaigns;