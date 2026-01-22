import Skeleton from "../common/Skeleton";
import HeaderContainer from "../common/HeaderContainer";

const CampaignLoading = () => {
  return (
    <>
      {/* Header Skeleton */}
      <HeaderContainer className="campaignbay-py-[12px]">
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
          <Skeleton className="campaignbay-h-[32px] campaignbay-w-[250px] campaignbay-rounded-[4px]" />
          <Skeleton className="campaignbay-h-[24px] campaignbay-w-[24px] campaignbay-rounded-full" />
        </div>
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[8px]">
          <Skeleton className="campaignbay-h-[16px] campaignbay-w-[50px] campaignbay-rounded-[4px]" />
          <Skeleton className="campaignbay-h-[24px] campaignbay-w-[44px] campaignbay-rounded-full" />
          <Skeleton className="campaignbay-h-[32px] campaignbay-w-[120px] campaignbay-rounded-[8px]" />
        </div>
      </HeaderContainer>

      <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-default">
        {/* Discount Type Card Skeleton */}
        <div className="campaignbay-bg-white campaignbay-p-[24px] campaignbay-rounded-[8px] campaignbay-shadow-sm">
          <Skeleton className="campaignbay-h-[24px] campaignbay-w-[180px] campaignbay-rounded-[4px] campaignbay-mb-[15px]" />
          <div className="campaignbay-grid campaignbay-grid-cols-2 lg:campaignbay-grid-cols-4 campaignbay-gap-[12px]">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="campaignbay-h-[100px] campaignbay-w-full campaignbay-rounded-[8px]"
              />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="campaignbay-flex campaignbay-flex-nowrap campaignbay-flex-col xl:campaignbay-flex-row campaignbay-gap-default">
          {/* Left Card - Discount */}
          <div className="campaignbay-w-full">
            <div className="campaignbay-bg-white campaignbay-p-[24px] campaignbay-rounded-[8px] campaignbay-shadow-sm">
              {/* Card Header */}
              <div className="campaignbay-pb-[24px] campaignbay-border-b campaignbay-border-[#dddddd] campaignbay-w-full">
                <Skeleton className="campaignbay-h-[20px] campaignbay-w-[100px] campaignbay-rounded-[4px]" />
              </div>

              <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[30px] campaignbay-pt-[30px]">
                {/* Target Section */}
                <div>
                  <Skeleton className="campaignbay-h-[24px] campaignbay-w-[80px] campaignbay-rounded-[4px] campaignbay-mb-[15px]" />
                  <Skeleton className="campaignbay-h-[40px] campaignbay-w-full campaignbay-rounded-[8px]" />
                </div>

                {/* Tiers Section */}
                <div>
                  <Skeleton className="campaignbay-h-[24px] campaignbay-w-[120px] campaignbay-rounded-[4px] campaignbay-mb-[15px]" />
                  <div className="campaignbay-space-y-[10px]">
                    <Skeleton className="campaignbay-h-[60px] campaignbay-w-full campaignbay-rounded-[8px]" />
                    <Skeleton className="campaignbay-h-[60px] campaignbay-w-full campaignbay-rounded-[8px]" />
                  </div>
                </div>

                {/* Conditions Section */}
                <div>
                  <Skeleton className="campaignbay-h-[24px] campaignbay-w-[100px] campaignbay-rounded-[4px] campaignbay-mb-[15px]" />
                  <Skeleton className="campaignbay-h-[80px] campaignbay-w-full campaignbay-rounded-[8px]" />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="campaignbay-py-[15px]">
              <Skeleton className="campaignbay-h-[44px] campaignbay-w-[180px] campaignbay-rounded-[8px]" />
            </div>
          </div>

          {/* Right Card - Configurations */}
          <div className="campaignbay-w-full xl:campaignbay-w-[min(70%,900px)]">
            <div className="campaignbay-bg-[#f9fbfd] campaignbay-p-[24px] campaignbay-rounded-[8px] campaignbay-shadow-sm">
              {/* Card Header */}
              <div className="campaignbay-pb-[24px] campaignbay-border-b campaignbay-border-[#dddddd] campaignbay-w-full">
                <Skeleton className="campaignbay-h-[20px] campaignbay-w-[140px] campaignbay-rounded-[4px]" />
              </div>

              <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[15px] campaignbay-pt-[15px]">
                {/* Others Section */}
                <div>
                  <Skeleton className="campaignbay-h-[24px] campaignbay-w-[60px] campaignbay-rounded-[4px] campaignbay-mb-[15px]" />
                  <div className="campaignbay-space-y-[15px]">
                    <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[10px]">
                      <Skeleton className="campaignbay-h-[20px] campaignbay-w-[20px] campaignbay-rounded-[4px]" />
                      <Skeleton className="campaignbay-h-[16px] campaignbay-w-[140px] campaignbay-rounded-[4px]" />
                    </div>
                    <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[10px]">
                      <Skeleton className="campaignbay-h-[20px] campaignbay-w-[20px] campaignbay-rounded-[4px]" />
                      <Skeleton className="campaignbay-h-[16px] campaignbay-w-[160px] campaignbay-rounded-[4px]" />
                    </div>
                    <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[10px]">
                      <Skeleton className="campaignbay-h-[20px] campaignbay-w-[20px] campaignbay-rounded-[4px]" />
                      <Skeleton className="campaignbay-h-[16px] campaignbay-w-[130px] campaignbay-rounded-[4px]" />
                    </div>
                    {/* Date Pickers */}
                    <Skeleton className="campaignbay-h-[40px] campaignbay-w-full campaignbay-rounded-[8px]" />
                    <Skeleton className="campaignbay-h-[40px] campaignbay-w-full campaignbay-rounded-[8px]" />
                  </div>
                </div>

                {/* Settings Section */}
                <div>
                  <Skeleton className="campaignbay-h-[24px] campaignbay-w-[80px] campaignbay-rounded-[4px] campaignbay-mb-[15px]" />
                  <div className="campaignbay-space-y-[15px]">
                    <Skeleton className="campaignbay-h-[40px] campaignbay-w-full campaignbay-rounded-[8px]" />
                    <Skeleton className="campaignbay-h-[40px] campaignbay-w-full campaignbay-rounded-[8px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CampaignLoading;
