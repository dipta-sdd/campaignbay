import { Plus } from "lucide-react";
import templates, { getTemplate } from "../../utils/templates";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGuideStep } from "../../store/GuideContext";
import { TOUR_STEPS } from "../../utils/tourSteps";

interface AddCampaignModalProps {
  onClose: () => void;
}

const AddCampaignModal = ({ onClose }: AddCampaignModalProps) => {
  const navigate = useNavigate();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(
    null
  );

  const blankCampaignRef = useGuideStep<HTMLDivElement>(
    TOUR_STEPS.BLANK_CAMPAIGN
  );
  const createRef = useGuideStep<HTMLButtonElement>(TOUR_STEPS.CREATE);

  const handleSelect = (templateId: string) => {
    if (selectedTemplateId === templateId) {
      setSelectedTemplateId(null);
    } else {
      setSelectedTemplateId(templateId);
    }
  };
  const selectedTemplate = getTemplate(selectedTemplateId || "");

  return (
    <div className="campaignbay-bg-zinc-300 campaignbay-p-0 campaignbay-gap-0 campaignbay-flex campaignbay-h-full campaignbay-text-gray-950 campaignbay-rounded-[4px] campaignbay-overflow-hidden campaignbay-max-h-[calc(92vh-65px)] campaignbay-w-min">
      <div className="campaignbay-w-full campaignbay-py-[20px] campaignbay-pt-[10px] campaignbay-flex-1 campaignbay-flex campaignbay-flex-col campaignbay-gap-[10px]">
        <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-center campaignbay-px-[20px]">
          <span className="campaignbay-text-[16px] campaignbay-font-bold ">
            Choose a Campaign Template
          </span>
          <button
          ref={createRef}
            className="campaignbay-bg-[#183ad6] campaignbay-text-white campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-text-[14px] campaignbay-font-bold campaignbay-leading-[16px] disabled:campaignbay-opacity-40 disabled:campaignbay-cursor-not-allowed"
            disabled={selectedTemplateId === "" || selectedTemplateId === null}
            onClick={() => {
              navigate("/campaigns/add?templateId=" + selectedTemplateId);
              onClose();
            }}
          >
            Create
          </button>
        </div>
        <div className="campaignbay-grid campaignbay-add-campaigns-modal-grid-cols campaignbay-gap-[10px] campaignbay-px-[20px] campaignbay-py-[10px]">
          <div
            ref={blankCampaignRef}
            className={`campaignbay-add-campaigns-modal-grid-item campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-pt-[28px] campaignbay-flex campaignbay-flex-col campaignbay-justify-start campaignbay-items-start campaignbay-gap-[5px] campaignbay-cursor-pointer hover:campaignbay-shadow-sm ${
              selectedTemplateId === "blank"
                ? "!campaignbay-bg-[#183ad6] campaignbay-text-white"
                : "campaignbay-bg-white "
            }`}
            onClick={() => handleSelect("blank")}
            onMouseEnter={() => setHoveredTemplateId("blank")}
            onMouseLeave={() => setHoveredTemplateId(null)}
          >
            <Plus className="campaignbay-w-[32px] campaignbay-h-[32px] campaignbay-stroke-[3px]" />
            <span className="campaignbay-text-[14px] campaignbay-font-bold campaignbay-leading-[16px]">
              Blank Campaign
            </span>
            <span className="campaignbay-text-[12px] campaignbay-leading-[24px]">
              Create your own campaign
            </span>
          </div>
          {templates.map((template, index) => (
            <div
              key={index}
              onClick={() => handleSelect(template.id)}
              onMouseEnter={() => setHoveredTemplateId(template.id)}
              onMouseLeave={() => setHoveredTemplateId(null)}
              className={`campaignbay-relative campaignbay-add-campaigns-modal-grid-item campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-flex campaignbay-flex-col campaignbay-justify-start campaignbay-items-start campaignbay-gap-[5px] campaignbay-cursor-pointer hover:campaignbay-shadow-sm campaignbay-transition-all campaignbay-duration-[200ms] ${
                selectedTemplateId === template.id
                  ? "!campaignbay-bg-[#183ad6] campaignbay-text-white"
                  : "campaignbay-bg-white "
              }`}
            >
              {template.svg ? (
                template.svg
              ) : (
                <Plus className="campaignbay-w-[32px] campaignbay-h-[32px] campaignbay-stroke-[3px]" />
              )}
              <span className="campaignbay-text-[14px] campaignbay-font-bold campaignbay-leading-[16px]">
                {template.title}
              </span>
              <span className="campaignbay-text-[12px] campaignbay-leading-[24px]">
                {template.description}
              </span>

              {/* Overlay for small devices */}
              {hoveredTemplateId === template.id && (
                <div
                  className={`campaignbay-add-campaigns-modal-overlay campaignbay-overflow-hidden campaignbay-transition-all campaignbay-duration-[200ms] campaignbay-absolute campaignbay-inset-0 campaignbay-rounded-[4px] campaignbay-shadow-sm campaignbay-z-10 ${
                    selectedTemplateId === template.id
                      ? "campaignbay-bg-[#183ad6] campaignbay-text-white"
                      : "campaignbay-bg-white"
                  }`}
                >
                  <div className="campaignbay-p-[10px]">
                    <span className="campaignbay-block campaignbay-text-[14px] campaignbay-font-bold campaignbay-mb-1">
                      Example
                    </span>
                    <div
                      className={`campaignbay-flex campaignbay-flex-col campaignbay-gap-[5px] campaignbay-text-[12px] campaignbay-font-normal campaignbay-leading-[16px] ${
                        selectedTemplateId === template.id
                          ? "campaignbay-text-white"
                          : "campaignbay-text-gray-600"
                      }`}
                    >
                      <span>{template.example?.text}</span>
                      <ul className="campaignbay-list-disc campaignbay-list-inside campaignbay-leading-[16px]">
                        {template.example?.list.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="campaignbay-add-campaigns-modal-example campaignbay-bg-[#f7f8fe]">
        <Example
          example={selectedTemplate?.example}
          isBlank={selectedTemplateId === "blank" ? true : false}
        />
      </div>
    </div>
  );
};

export default AddCampaignModal;

interface ExampleProps {
  example?: { text: string; list: string[] };
  isBlank?: boolean;
}
const Example = ({ example, isBlank }: ExampleProps) => {
  if (isBlank) {
    return (
      <div className="campaignbay-p-[15px] campaignbay-h-full campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-text-center">
        <svg
          className="campaignbay-w-16 campaignbay-h-16 campaignbay-mb-4 campaignbay-text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
        <span className="campaignbay-text-[16px] campaignbay-font-bold campaignbay-text-gray-700 campaignbay-mb-2">
          Blank Campaign
        </span>
        <span className="campaignbay-text-[13px] campaignbay-text-gray-500 campaignbay-leading-[20px] campaignbay-max-w-[220px]">
          Start from scratch and build your campaign exactly the way you want it
        </span>
      </div>
    );
  }
  if (!example) {
    return (
      <div className="campaignbay-p-[15px] campaignbay-h-full campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-text-center">
        <svg
          className="campaignbay-w-16 campaignbay-h-16 campaignbay-mb-4 campaignbay-text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
        <span className="campaignbay-text-[14px] campaignbay-font-semibold campaignbay-text-gray-600 campaignbay-mb-2">
          Select a Template
        </span>
        <span className="campaignbay-text-[12px] campaignbay-text-gray-400 campaignbay-leading-[18px]">
          Click on any template to view its example and features
        </span>
      </div>
    );
  }
  return (
    <div className="campaignbay-p-0 campaignbay-bg-white campaignbay-h-full campaignbay-overflow-y-auto">
      <span className="campaignbay-block campaignbay-p-[10px] campaignbay-text-[16px] campaignbay-font-bold">
        Example
      </span>
      <div className="campaignbay-p-[15px] campaignbay-pt-0 campaignbay-flex campaignbay-flex-col campaignbay-gap-[10px] campaignbay-text-[13px] campaignbay-font-normal campaignbay-leading-[20px] campaignbay-text-gray-500">
        <span>{example?.text}</span>
        <ul className="campaignbay-list-disc campaignbay-list-inside campaignbay-leading-[24px]">
          {example?.list.map((item, index) => <li key={index}>{item}</li>)}
        </ul>
      </div>
    </div>
  );
};
