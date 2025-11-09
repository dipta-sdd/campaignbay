import { useState, FC } from "react";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { HardDriveDownload, HardDriveUpload } from "lucide-react";
import { useToast } from "../store/toast/use-toast";
import { exportDataToCsv } from "./exportDataToCsv";
import ImportModal from "./ImportModal";
import { Campaign } from "../types";

interface ImportExportProps {
  refresh: () => void;
}
type CampaignExportData = Partial<Campaign>;

const ImportExport: FC<ImportExportProps> = ({ refresh }) => {
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const { addToast } = useToast();

  const exportCampaigns = async () => {
    try {
      const campaignsToExport: CampaignExportData[] = await apiFetch({
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

  const handleImport = async (jsonData: any[]) => {
    try {
      const response: any = await apiFetch({
        path: "/campaignbay/v1/campaigns/import",
        method: "POST",
        data: {
          campaigns: jsonData,
        },
      });

      if (response && response?.success) {
        addToast(
          __("Campaigns imported successfully.", "campaignbay"),
          "success"
        );
        refresh();
        setIsImportModalOpen(false);
      } else {
        addToast(__("Error importing campaigns.", "campaignbay"), "error");
      }
    } catch (error) {
      addToast(__("Error importing campaigns.", "campaignbay"), "error");
    }
  };

  return (
    <>
      <div className="campaignbay-flex campaignbay-gap-1">
        <button
          className="campaignbay-font-medium campaignbay-border campaignbay-border-gray-500 campaignbay-text-gray-600 hover:campaignbay-border-blue-600 hover:campaignbay-text-blue-600 campaignbay-p-[6px] campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-nowrap"
          onClick={() => {
            setIsImportModalOpen(true);
          }}
        >
          <HardDriveUpload size={16} />
          {__("Import", "campaignbay")}
        </button>
        <button
          className="campaignbay-font-medium campaignbay-border campaignbay-border-gray-500 campaignbay-text-gray-600 hover:campaignbay-border-blue-600 hover:campaignbay-text-blue-600 campaignbay-p-[6px] campaignbay-flex campaignbay-items-center campaignbay-gap-2 campaignbay-flex-nowrap"
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
        onImport={handleImport}
      />
    </>
  );
};

export default ImportExport;
