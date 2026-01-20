import { useState, FC } from "react";
import { __ } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { HardDriveDownload, HardDriveUpload } from "lucide-react";
import { useToast } from "../../store/toast/use-toast";
import { exportDataToCsv } from "./exportDataToCsv";
import ImportModal from "./ImportModal";
import { Campaign } from "../../utils/types";
import Button from "../common/Button";
import { arrowDown, arrowUp, Icon } from "@wordpress/icons";

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
        <Button
          size="small"
          variant="outline"
          color="primary"
          onClick={() => {
            setIsImportModalOpen(true);
          }}
        >
          Import <Icon icon={arrowDown} size={20} fill="currentColor" />
        </Button>
        <Button
          size="small"
          variant="outline"
          color="primary"
          onClick={() => {
            exportCampaigns();
          }}
        >
          Export <Icon icon={arrowUp} size={20} fill="currentColor" />
        </Button>
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
