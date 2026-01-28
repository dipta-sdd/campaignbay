import { Plus } from "lucide-react";
// @ts-ignore
import no_data from "./../../../assets/img/no_data.svg";
import { __ } from "@wordpress/i18n";
import { TOUR_STEPS } from "../../utils/tourSteps";
import { useGuide } from "../../store/GuideContext";
const EmptyStateCampaigns = () => {
  const { setTourStep, tourStep, setIsModalOpen } = useGuide();

  return (
    <div className="campaignbay-w-full campaignbay-p-8 md:campaignbay-p-16">
      <div className="campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-text-center campaignbay-bg-gray-50 campaignbay-border-2 campaignbay-border-dashed campaignbay-border-gray-200 campaignbay-rounded-lg campaignbay-p-10">
        {/* Image Section - Reduced size and added margin */}
        <div className="campaignbay-mb-6 campaignbay-relative">
          {/* Using a max-width to keep the illustration from dominating the screen */}
          <img
            src={no_data}
            alt="No Campaigns"
            className="campaignbay-h-48 campaignbay-w-auto campaignbay-mx-auto campaignbay-opacity-90"
          />
        </div>

        {/* Text Content Section */}
        <div className="campaignbay-max-w-md campaignbay-mx-auto">
          <h3 className="campaignbay-text-lg campaignbay-font-semibold campaignbay-text-gray-900 campaignbay-mb-2">
            {__("No campaigns found", "campaignbay")}
          </h3>

          <p className="campaignbay-text-gray-500 campaignbay-mb-6 campaignbay-text-sm">
            {__(
              "You haven't created any discount campaigns yet. Get started now to boost your sales!",
              "campaignbay",
            )}
          </p>

          {/* Call to Action Button */}
          <button
            type="button"
            onClick={() => {
              if (tourStep === 1) {
                setTourStep(TOUR_STEPS.BLANK_CAMPAIGN);
              }
              setIsModalOpen(true);
            }}
            className="campaignbay-inline-flex campaignbay-items-center campaignbay-justify-center campaignbay-px-5 campaignbay-py-2.5 campaignbay-text-sm campaignbay-font-medium campaignbay-text-white campaignbay-bg-blue-600 campaignbay-rounded-md hover:campaignbay-bg-blue-700 focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-blue-500 campaignbay-transition-colors campaignbay-shadow-sm"
          >
            <Plus size={16} className="campaignbay-mr-2" />
            {__("Create a New campaign", "campaignbay")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default EmptyStateCampaigns;
