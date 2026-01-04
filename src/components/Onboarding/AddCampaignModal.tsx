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
    <div className="campaignbay-bg-zinc-300 campaignbay-p-0 campaignbay-gap-0 campaignbay-flex campaignbay-h-full campaignbay-text-gray-950 ">
      <div className="campaignbay-w-full campaignbay-p-[20px] campaignbay-pt-[10px] campaignbay-flex-1 campaignbay-flex campaignbay-flex-col campaignbay-gap-[10px]">
        <span className="campaignbay-text-[16px] campaignbay-font-bold campaignbay-block campaignbay-h-[24px]">
          Choose a Campaign Template
        </span>
        <div className="campaignbay-grid campaignbay-grid-cols-3 campaignbay-gap-[10px]">
          <div className="campaignbay-min-h-[136px] campaignbay-bg-white campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-flex campaignbay-flex-col campaignbay-justify-center campaignbay-items-center campaignbay-gap-[5px] campaignbay-cursor-pointer">
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
              className="campaignbay-min-h-[136px] campaignbay-bg-white campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-flex campaignbay-flex-col campaignbay-justify-center campaignbay-items-start campaignbay-gap-[5px] campaignbay-cursor-pointer"
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
        <div className="campaignbay-flex campaignbay-justify-start">
          <button className="campaignbay-bg-[#183ad6] campaignbay-text-white campaignbay-rounded-[4px] campaignbay-p-[10px] campaignbay-text-[14px] campaignbay-font-bold campaignbay-leading-[16px] disabled:campaignbay-bg-blue-500 disabled:campaignbay-cursor-not-allowed">
            Create
          </button>
        </div>
      </div>
      <div className="!campaignbay-min-w-[270px] !campaignbay-max-w-[270px] campaignbay-bg-green-500">
        <MarkdownPreview markdown={selectedTemplate?.markdown || ""} />
      </div>
    </div>
  );
};

export default AddCampaignModal;

const MarkdownPreview = ({ markdown }: { markdown: string }) => {
  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, index) => {
      // Handle Bold: **text** -> <strong>text</strong>
      const parts = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="campaignbay-font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Handle Bullet Points
      if (line.trim().startsWith("- ")) {
        return (
          <li
            key={index}
            className="campaignbay-ml-4 campaignbay-list-disc campaignbay-text-sm campaignbay-text-gray-700 campaignbay-mb-1"
          >
            {parts.slice(1)} {/* Remove "- " prefix logic is handled below */}
            {line
              .replace(/^- /, "")
              .split(/(\*\*.*?\*\*)/g)
              .map((part, i) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <strong key={i} className="campaignbay-font-bold">
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return part;
              })}
          </li>
        );
      }

      // Handle Empty Lines
      if (!line.trim()) {
        return <br key={index} />;
      }

      // Default Paragraph
      return (
        <p
          key={index}
          className="campaignbay-text-sm campaignbay-text-gray-700 campaignbay-mb-2"
        >
          {parts}
        </p>
      );
    });
  };

  if (!markdown) {
    return (
      <div className="campaignbay-p-4 campaignbay-bg-white campaignbay-h-full campaignbay-flex campaignbay-flex-col campaignbay-justify-center campaignbay-items-center campaignbay-text-center">
        <span className="campaignbay-text-base campaignbay-font-medium campaignbay-text-gray-400">
          Select a template to preview details
        </span>
      </div>
    );
  }

  return (
    <div className="campaignbay-p-4 campaignbay-bg-white campaignbay-h-full campaignbay-overflow-y-auto">
      {parseMarkdown(markdown)}
    </div>
  );
};
