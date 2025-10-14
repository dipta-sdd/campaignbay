import { BookmarkCheck, Copy, CopyCheck, Paperclip } from "lucide-react";
import { useState } from "react";

export function CopyToClipboard({ text }) {
  const [copied, setCopied] = useState(false);
  const [copping, setCopping] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopping(true);
      setTimeout(() => setCopping(false), 200);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`campaignbay-inline-flex campaignbay-items-center campaignbay-justify-center campaignbay-cursor-pointer `}
    >
      {copied ? (
        <>{copping ? <CopyCheck size={14} /> : <BookmarkCheck size={16} />}</>
      ) : (
        <>
          <Paperclip size={14} className="" />
        </>
      )}
    </button>
  );
}
