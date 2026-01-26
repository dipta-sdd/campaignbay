import { __ } from "@wordpress/i18n";
import { FC, Dispatch, SetStateAction } from "react";
import { Icon, check } from "@wordpress/icons";

// New components
import { Checkbox } from "../common/Checkbox";
import CustomModal from "../common/CustomModal";
import Button from "../common/Button";
import { Input } from "../common/Input";
import Select from "../common/Select";
import { DiscountTableOptionsType } from "./types";

interface QuantityTableEditModalProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  options: DiscountTableOptionsType;
  setOptions: (v: DiscountTableOptionsType) => void;
  isSaving: boolean;
  updateSettings: () => void;
}

type KeyType = "title" | "range" | "discount";

const QuantityTableEditModal: FC<QuantityTableEditModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  options,
  setOptions,
  isSaving,
  updateSettings,
}) => {
  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleOptionChange = (
    key: KeyType | "show_header",
    subKey: "show" | "label" | "content" | null,
    value: string | boolean,
  ) => {
    setOptions(
      subKey
        ? {
            ...options,
            [key]: {
              // @ts-ignore
              ...options[key],
              [subKey]: value,
            },
          }
        : {
            ...options,
            [key]: value,
          },
    );
  };

  // Defensive check in case options is not yet loaded.
  if (!options) {
    return null;
  }

  const columnOptions: KeyType[] = ["title", "range", "discount"];

  const getColumnLabel = (key: KeyType): string => {
    const labels: Record<KeyType, string> = {
      title: __("Title Column", "campaignbay"),
      range: __("Range Column", "campaignbay"),
      discount: __("Discount Column", "campaignbay"),
    };
    return labels[key];
  };

  return (
    <CustomModal
      isOpen={isModalOpen}
      onClose={closeModal}
      title={__("Customize Discount Table", "campaignbay")}
      maxWidth="campaignbay-max-w-[900px]"
      className="campaignbay-max-h-[90vh]"
      classNames={{
        body: "campaignbay-p-0 campaignbay-overflow-y-auto",
      }}
      footer={
        <Button size="medium" onClick={updateSettings} disabled={isSaving}>
          <Icon icon={check} fill="currentColor" />
          {isSaving
            ? __("Saving...", "campaignbay")
            : __("Save Changes", "campaignbay")}
        </Button>
      }
    >
      <div className="campaignbay-grid campaignbay-grid-cols-1 lg:campaignbay-grid-cols-2 campaignbay-gap-[24px] campaignbay-p-[24px]">
        {/* Customization Form */}
        <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[20px]">
          <div className="campaignbay-text-[14px] campaignbay-font-bold campaignbay-text-[#1e1e1e] campaignbay-mb-[4px]">
            {__("Table Settings", "campaignbay")}
          </div>

          {/* Show Header Toggle */}
          <div className="campaignbay-p-[16px] campaignbay-bg-gray-50 campaignbay-rounded-[8px] campaignbay-border campaignbay-border-gray-200">
            <Checkbox
              checked={options.show_header}
              onChange={(checked) =>
                handleOptionChange("show_header", null, checked)
              }
              label={__("Show Table Header", "campaignbay")}
              classNames={{
                label:
                  "!campaignbay-text-[13px] !campaignbay-font-bold !campaignbay-text-[#1e1e1e]",
              }}
            />
            <p className="campaignbay-text-[12px] campaignbay-text-gray-500 campaignbay-mt-[4px] campaignbay-pl-[28px]">
              {__("Show/Hide table header column names", "campaignbay")}
            </p>
          </div>

          {/* Column Options */}
          {columnOptions.map((key: KeyType) => (
            <div
              key={key}
              className="campaignbay-p-[16px] campaignbay-bg-gray-50 campaignbay-rounded-[8px] campaignbay-border campaignbay-border-gray-200"
            >
              <div className="campaignbay-flex campaignbay-flex-col campaignbay-gap-[12px]">
                <Checkbox
                  checked={options[key]?.show}
                  onChange={(checked) =>
                    handleOptionChange(key, "show", checked)
                  }
                  label={getColumnLabel(key)}
                  classNames={{
                    label:
                      "!campaignbay-text-[13px] !campaignbay-font-bold !campaignbay-text-[#1e1e1e]",
                  }}
                />

                <div className="campaignbay-pl-[28px]">
                  <Input
                    label={__("Column Label", "campaignbay")}
                    value={options[key]?.label || ""}
                    onChange={(e) =>
                      handleOptionChange(key, "label", e.target.value)
                    }
                    disabled={!options[key]?.show}
                    size="small"
                    classNames={{
                      label:
                        "!campaignbay-text-[12px] !campaignbay-font-bold !campaignbay-text-gray-700 !campaignbay-uppercase !campaignbay-mb-[4px]",
                    }}
                  />
                </div>

                {key === "discount" && (
                  <div className="campaignbay-pl-[28px] campaignbay-mt-[4px]">
                    <Select
                      label={__("Content To Show", "campaignbay")}
                      value={options.discount?.content || "price"}
                      onChange={(value) =>
                        handleOptionChange("discount", "content", String(value))
                      }
                      disabled={!options.discount?.show}
                      options={[
                        { label: __("Price", "campaignbay"), value: "price" },
                        {
                          label: __("Percentage", "campaignbay"),
                          value: "percentage",
                        },
                      ]}
                      classNames={{
                        label:
                          "!campaignbay-text-[12px] !campaignbay-font-bold !campaignbay-text-gray-700 !campaignbay-uppercase !campaignbay-mb-[4px]",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Table */}
        <div className="campaignbay-flex campaignbay-flex-col">
          <div className="campaignbay-text-[14px] campaignbay-font-bold campaignbay-text-[#1e1e1e] campaignbay-mb-[8px]">
            {__("Preview", "campaignbay")}
          </div>

          <div className="campaignbay-bg-gray-50 campaignbay-p-[16px] campaignbay-rounded-[8px] campaignbay-border campaignbay-border-gray-200 campaignbay-flex-1">
            <h3 className="campaignbay-text-[14px] campaignbay-font-bold campaignbay-text-[#1e1e1e] campaignbay-mb-[4px]">
              {__("Preview Table", "campaignbay")}
            </h3>
            <p className="campaignbay-text-[12px] campaignbay-text-gray-500 campaignbay-mb-[12px]">
              {__(
                "This table contains sample content for design purposes.",
                "campaignbay",
              )}
            </p>

            <div className="campaignbay-overflow-x-auto campaignbay-rounded-[8px] campaignbay-border campaignbay-border-gray-200">
              <table className="campaignbay-w-full campaignbay-text-[13px]">
                {options.show_header && (
                  <thead className="campaignbay-bg-gray-100 campaignbay-border-b campaignbay-border-gray-200">
                    <tr>
                      {options.title?.show && (
                        <th className="campaignbay-px-[12px] campaignbay-py-[10px] campaignbay-text-left campaignbay-text-[11px] campaignbay-font-bold campaignbay-text-gray-600 campaignbay-uppercase">
                          {options.title?.label || __("Title", "campaignbay")}
                        </th>
                      )}
                      {options.range?.show && (
                        <th className="campaignbay-px-[12px] campaignbay-py-[10px] campaignbay-text-left campaignbay-text-[11px] campaignbay-font-bold campaignbay-text-gray-600 campaignbay-uppercase">
                          {options.range?.label || __("Range", "campaignbay")}
                        </th>
                      )}
                      {options.discount?.show && (
                        <th className="campaignbay-px-[12px] campaignbay-py-[10px] campaignbay-text-left campaignbay-text-[11px] campaignbay-font-bold campaignbay-text-gray-600 campaignbay-uppercase">
                          {options.discount?.label ||
                            __("Discount", "campaignbay")}
                        </th>
                      )}
                    </tr>
                  </thead>
                )}
                <tbody className="campaignbay-bg-white campaignbay-divide-y campaignbay-divide-gray-100">
                  {[
                    {
                      title: "Weekend Deals",
                      range: "5-10",
                      discount: "$10",
                      percentage: "10%",
                    },
                    {
                      title: "Weekend Deals",
                      range: "11-20",
                      discount: "$15",
                      percentage: "15%",
                    },
                    {
                      title: "Weekend Deals",
                      range: "21+",
                      discount: "$25",
                      percentage: "20%",
                    },
                    {
                      title: "Bulk Purchase",
                      range: "1-4",
                      discount: "$5",
                      percentage: "5%",
                    },
                    {
                      title: "Bulk Purchase",
                      range: "5-9",
                      discount: "$10",
                      percentage: "10%",
                    },
                    {
                      title: "Bulk Purchase",
                      range: "10+",
                      discount: "$15",
                      percentage: "15%",
                    },
                  ].map((row, index) => (
                    <tr
                      key={index}
                      className="hover:campaignbay-bg-gray-50 campaignbay-transition-colors"
                    >
                      {options.title?.show && (
                        <td className="campaignbay-px-[12px] campaignbay-py-[10px] campaignbay-text-[#1e1e1e] campaignbay-font-medium">
                          {row.title}
                        </td>
                      )}
                      {options.range?.show && (
                        <td className="campaignbay-px-[12px] campaignbay-py-[10px] campaignbay-text-gray-600">
                          {row.range}
                        </td>
                      )}
                      {options.discount?.show && (
                        <td className="campaignbay-px-[12px] campaignbay-py-[10px] campaignbay-text-green-600 campaignbay-font-medium">
                          {options.discount.content === "price"
                            ? row.discount
                            : row.percentage}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* No columns visible warning */}
            {!options.title?.show &&
              !options.range?.show &&
              !options.discount?.show && (
                <div className="campaignbay-text-center campaignbay-py-[24px] campaignbay-text-gray-500 campaignbay-text-[13px]">
                  {__(
                    "No columns are currently visible. Enable at least one column to see the preview.",
                    "campaignbay",
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default QuantityTableEditModal;
