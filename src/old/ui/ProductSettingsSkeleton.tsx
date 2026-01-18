import React from 'react';
import SettingCard from '../../../../campaignbay/src/components/SettingCard';
import Skeleton from '../../../../campaignbay/src/components/Skeleton';

const ProductSettingsSkeleton = () => {
    return (
        <div className="wpab-cb-settings-tab">
            <SettingCard title={<Skeleton className="!campaignbay-h-6 !campaignbay-w-64" />}>
                <div className="campaignbay-p-[30px] campaignbay-pt-3 campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[20px] campaignbay-w-full">
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>

                </div>
            </SettingCard>
            <SettingCard title={<Skeleton className="!campaignbay-h-6 !campaignbay-w-64" />}>
                <div className="campaignbay-p-[30px] campaignbay-pt-3 campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[20px] campaignbay-w-full">
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>
                    <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-2">
                        <Skeleton className="!campaignbay-h-4 !campaignbay-w-2/3" />
                        <Skeleton className="!campaignbay-h-10 campaignbay-w-full" />
                    </div>

                </div>
            </SettingCard>

        </div>
    );
};

export default ProductSettingsSkeleton;
