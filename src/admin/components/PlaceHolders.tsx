import { FC } from "react";
import { CopyToClipboard } from "./CopyToClipboard";

interface PlaceholderProps {
  text: string;
}

export const Placeholder: FC<PlaceholderProps> = ({ text }) => {
  return (
    <span className="campaignbay-bg-gray-200 campaignbay-my-[2px] campaignbay-mx-[4px] campaignbay-p-[2px] campaignbay-px-[4px] campaignbay-rounded-md campaignbay-inline-flex campaignbay-items-center campaignbay-justify-center campaignbay-gap-[4px]">
      <span className="campaignbay-mr-[2px] campaignbay-text-gray-600">{`{${text}}`}</span>
      <CopyToClipboard text={`{${text}}`} />
    </span>
  );
};

interface PlaceholdersProps {
  options: string[];
}

const Placeholders: FC<PlaceholdersProps> = ({ options }) => {
  return (
    <span className="campaignbay-inline campaignbay-text-wrap">
      {" "}
      Use placeholder like
      {options.map((option, index) => {
        return <Placeholder key={index} text={option} />;
      })}
      .
    </span>
  );
};

export default Placeholders;
