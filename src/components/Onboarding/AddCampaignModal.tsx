import { Plus } from "lucide-react";
import templates from "../../utils/templates";
import { useState } from "react";

interface AddCampaignModalProps {
  onClose: () => void;
}

const AddCampaignModal = ({ onClose }: AddCampaignModalProps) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId
  );
  return (
    <div className="campaignbay-bg-zinc-300 campaignbay-p-0 campaignbay-gap-0 campaignbay-flex campaignbay-h-full campaignbay-text-gray-950 campaignbay-rounded-[4px] campaignbay-overflow-hidden campaignbay-max-h-[calc(92vh-65px)]">
      <div className="campaignbay-w-full campaignbay-py-[20px] campaignbay-pt-[10px] campaignbay-flex-1 campaignbay-flex campaignbay-flex-col campaignbay-gap-[10px]">
        <span className="campaignbay-text-[16px] campaignbay-px-[20px] campaignbay-font-bold campaignbay-block campaignbay-leading-[24px]">
          Choose a Campaign Template
        </span>
        <div className="campaignbay-grid campaignbay-add-campaigns-modal-grid-cols campaignbay-gap-[10px] campaignbay-px-[20px] ">
          <div
            className={`campaignbay-min-h-[136px] campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-pt-[28px] campaignbay-flex campaignbay-flex-col campaignbay-justify-start campaignbay-items-start campaignbay-gap-[5px] campaignbay-cursor-pointer ${
              selectedTemplateId === "blank"
                ? "!campaignbay-bg-[#183ad6] campaignbay-text-white"
                : "campaignbay-bg-white "
            }`}
            onClick={() => setSelectedTemplateId("blank")}
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
              onClick={() => setSelectedTemplateId(template.id)}
              className={`campaignbay-min-h-[136px] campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-pt-[28px] campaignbay-flex campaignbay-flex-col campaignbay-justify-start campaignbay-items-start campaignbay-gap-[5px] campaignbay-cursor-pointer ${
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
            </div>
          ))}
        </div>
        <div className="campaignbay-flex campaignbay-justify-start campaignbay-px-[20px]">
          <button className="campaignbay-bg-[#183ad6] campaignbay-text-white campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-text-[14px] campaignbay-font-bold campaignbay-leading-[16px] disabled:campaignbay-bg-blue-500 disabled:campaignbay-cursor-not-allowed">
            Create
          </button>
        </div>
      </div>
      <div className="campaignbay-add-campaigns-modal-example campaignbay-bg-[#f7f8fe]">
        <Example example={selectedTemplate?.example} />
      </div>
    </div>
  );
};

export default AddCampaignModal;

interface ExampleProps {
  example?: { text: string; list: string[] };
}
const Example = ({ example }: ExampleProps) => {
  if (!example) {
    return (
      <div className="campaignbay-p-[15px] campaignbay-text-[13px] campaignbay-font-normal campaignbay-leading-[20px]">
        No Example
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
