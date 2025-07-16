import { useState, useMemo } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';

import { Badge, DropdownMenu, DataViews } from '@wordpress/components';
import { moreVertical } from '@wordpress/icons';
import { CloudCog } from 'lucide-react';

// --- 1. Create Random Sample Data ---
// In a real application, this would come from your REST API endpoint.
const generateRandomData = () => [
    { id: 1, campaignName: 'Summer Sale 2025', status: 'Active', discountType: 'Percentage', target: 'Entire Store', value: '20%', startDate: 'Jun 1, 2025', endDate: 'Aug 31, 2025', usage: 1247 },
    { id: 2, campaignName: 'BOGO Electronics', status: 'Scheduled', discountType: 'BOGO', target: 'Electronics', value: 'Buy 1 Get 1', startDate: 'Mar 15, 2025', endDate: 'Mar 31, 2025', usage: 0 },
    { id: 3, campaignName: 'Early Bird Special', status: 'Active', discountType: 'EarlyBird', target: 'New Arrivals', value: '$15 off', startDate: 'Jan 1, 2025', endDate: 'Dec 31, 2025', usage: 432 },
    { id: 4, campaignName: 'Holiday Flash Sale', status: 'Expired', discountType: 'Percentage', target: 'Entire Store', value: '35%', startDate: 'Dec 20, 2024', endDate: 'Dec 31, 2024', usage: 2156 },
    { id: 5, campaignName: 'Clothing Category Sale', status: 'Draft', discountType: 'Category', target: 'Clothing', value: '25%', startDate: 'Apr 1, 2025', endDate: 'Apr 30, 2025', usage: 0 },
    { id: 6, campaignName: 'Recurring Friday Deal', status: 'Active', discountType: 'Recurring', target: 'All Drinks', value: '10%', startDate: 'N/A', endDate: 'N/A', usage: 98 },
    { id: 7, campaignName: 'New Year Promo', status: 'Expired', discountType: 'Amount', target: 'Entire Store', value: '$10 off', startDate: 'Jan 1, 2025', endDate: 'Jan 7, 2025', usage: 841 },
];


export const CampaignsList = () => {
    const [view, setView] = useState({
        type: 'table',
        perPage: 5,
        page: 1,
        sort: {
            field: 'date',
            direction: 'desc',
        },
        search: '',
        filters: [
            { field: 'author', operator: 'is', value: 2 },
            {
                field: 'status',
                operator: 'isAny',
                value: ['publish', 'draft'],
            },
        ],
        titleField: 'title',
        fields: ['author', 'status'],
        layout: {},
    });

    const queryArgs = useMemo(() => {
        const filters = {};
        view.filters.forEach((filter) => {
            if (filter.field === 'status' && filter.operator === 'isAny') {
                filters.status = filter.value;
            }
            if (filter.field === 'author' && filter.operator === 'is') {
                filters.author = filter.value;
            }
        });
        return {
            per_page: view.perPage,
            page: view.page,
            _embed: 'author',
            order: view.sort?.direction,
            orderby: view.sort?.field,
            search: view.search,
            ...filters,
        };
    }, [view]);

    const { records } = useEntityRecords('postType', 'product', queryArgs);
    console.log(records);

    return (
        <DataViews
            data={records}
            view={view}
            onChangeView={setView}
        // ...
        />
    );
};