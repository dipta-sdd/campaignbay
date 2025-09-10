import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { Modal } from "@wordpress/components";
import { useState } from "@wordpress/element";
import { HardDriveDownload, HardDriveUpload } from "lucide-react";
import { useToast } from "../store/toast/use-toast";
import { exportDataToCsv } from "./exportDataToCsv";
import ImportModal from "./ImportModal";

const ImportExport = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { addToast } = useToast();

  const exportCampaigns = async () => {
    try {
      const campaignsToExport = await apiFetch({
        path: "/campaignbay/v1/campaigns/export",
        method: "GET",
      });

      if (campaignsToExport && campaignsToExport.length > 0) {
        const date = new Date()
          .toISOString()
          .slice(0, 19)
          .replace("T", "-")
          .replace("_", "-");
        const filename = `campaignbay-export-${date}.csv`;
        exportDataToCsv(campaignsToExport, filename);
        addToast(
          __("Campaigns exported successfully.", "campaignbay"),
          "success"
        );
      } else {
        addToast(
          __("There are no campaigns to export.", "campaignbay"),
          "warning"
        );
      }
    } catch (error) {
      addToast(__("Error exporting campaigns.", "campaignbay"), "error");
    }
  };

  return (
    <>
      <div className="campaignbay-flex campaignbay-gap-1">
        <button
          className="campaignbay-font-medium campaignbay-border campaignbay-border-gray-500 campaignbay-text-gray-600 hover:campaignbay-border-blue-600 hover:campaignbay-text-blue-600 campaignbay-p-6 campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-nowrap"
          onClick={() => {
            setIsImportModalOpen(true);
          }}
        >
          <HardDriveUpload size={16} />
          {__("Import", "campaignbay")}
        </button>
        <button
          className="campaignbay-font-medium campaignbay-border campaignbay-border-gray-500 campaignbay-text-gray-600 hover:campaignbay-border-blue-600 hover:campaignbay-text-blue-600 campaignbay-p-6 campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-nowrap"
          onClick={() => {
            exportCampaigns();
          }}
        >
          <HardDriveDownload size={16} />
          {__("Export", "campaignbay")}
        </button>
      </div>
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </>
  );
};

export default ImportExport;
