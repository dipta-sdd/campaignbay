import { __ } from "@wordpress/i18n";
import { FC, Dispatch, SetStateAction } from "react";
import { Icon, check } from "@wordpress/icons";
import Checkbox from "./Checkbox";
import Modal from "./Modal";
import { DiscountTableOptionsType } from "../types";

interface QuantityTableEditModalProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  options: DiscountTableOptionsType;
  setOptions: Dispatch<SetStateAction<DiscountTableOptionsType>>;
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
    value: string | boolean
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
          }
    );
  };

  if (!isModalOpen) {
    return null;
  }

  // Defensive check in case options is not yet loaded.
  if (!options) {
    return null;
  }

  const columnOptions: KeyType[] = ["title", "range", "discount"];

  console.log("options : ", options);

  return (
    <Modal
      title="Customize Discount Table"
      onRequestClose={closeModal}
      size="large"
      className=" campaignbay-rounded-none campaignbay-max-w-[99vw] xl:campaignbay-max-w-7xl"
    >
      <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2">
        {/* customization form */}
        <div className="campaignbay-flex campaignbay-flex-col campaignbay-p-6 campaignbay-text-gray-700 !campaignbay-gap-4 ">
          <div className="campaignbay-mb-4 campaignbay-flex campaignbay-items-center">
            <Checkbox
              checked={options.show_header}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleOptionChange("show_header", null, e.target.checked)
              }
              label={__("Show Table Header", "campaignbay")}
              help={__("Show/Hide table header column names", "campaignbay")}
              conClassName="!campaignbay-p-0"
            />
          </div>

          {columnOptions.map((key: KeyType) => (
            <div key={key}>
              <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-3 campaignbay-mb-[12px] campaignbay-items-center">
                <Checkbox
                  checked={options[key]?.show}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleOptionChange(key, "show", e.target.checked)
                  }
                  label={`Show ${key} column`}
                  conClassName="!campaignbay-p-0"
                />
                <div className="md:campaignbay-col-span-2">
                  <div className="cb-form-input-con !campaignbay-p-0">
                    <input
                      type="text"
                      className={`wpab-input w-100`}
                      id={`${key}_label`}
                      value={options[key]?.label}
                      onChange={(e) =>
                        handleOptionChange(key, "label", e.target.value)
                      }
                      disabled={!options[key]?.show}
                    />
                  </div>
                </div>
                {key === "discount" && (
                  <div className="md:campaignbay-col-start-2 md:campaignbay-col-span-2 !campaignbay-mt-2.5">
                    <div className="cb-form-input-con  !campaignbay-p-0 !campaignbay-gap-1.5 ">
                      <label htmlFor="discount_content">
                        {__("Content To Show", "campaignbay")}
                      </label>
                      <select
                        className={`wpab-input w-100`}
                        id="discount_content"
                        value={options.discount?.content}
                        onChange={(e) =>
                          handleOptionChange(
                            "discount",
                            "content",
                            e.target.value
                          )
                        }
                        disabled={!options.discount?.show}
                      >
                        <option value="price">Price</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Example table */}
        <div className="campaignbay-p-6 campaignbay-text-gray-700">
          <div className="campaignbay-bg-gray-50 campaignbay-p-3.5 campaignbay-shadow-md ">
            <h3 className="campaignbay-text-lg campaignbay-font-semibold campaignbay-mb-1.5">
              {__("Preview Table", "campaignbay")}
            </h3>
            <p className="campaignbay-text-xs campaignbay-text-gray-500 campaignbay-mb-2.5">
              {__(
                "This table contains sample content for design purpose.",
                "campaignbay"
              )}
            </p>
            <table className="campaignbay-min-w-full campaignbay-divide-y campaignbay-divide-gray-200 campaignbay-border campaignbay-border-gray-200">
              {options.show_header && (
                <thead className="campaignbay-bg-gray-50">
                  <tr>
                    {options.title?.show && (
                      <th
                        scope="col"
                        className="campaignbay-px-3.5 campaignbay-py-2.5 campaignbay-text-left campaignbay-text-xs campaignbay-font-medium campaignbay-text-gray-500 campaignbay-uppercase campaignbay-tracking-wider"
                      >
                        {options.title?.label || __("Title", "campaignbay")}
                      </th>
                    )}
                    {options.range?.show && (
                      <th
                        scope="col"
                        className="campaignbay-px-3.5 campaignbay-py-2.5 campaignbay-text-left campaignbay-text-xs campaignbay-font-medium campaignbay-text-gray-500 campaignbay-uppercase campaignbay-tracking-wider"
                      >
                        {options.range?.label || __("Range", "campaignbay")}
                      </th>
                    )}
                    {options.discount?.show && (
                      <th
                        scope="col"
                        className="campaignbay-px-3.5 campaignbay-py-2.5 campaignbay-text-left campaignbay-text-xs campaignbay-font-medium campaignbay-text-gray-500 campaignbay-uppercase campaignbay-tracking-wider"
                      >
                        {options.discount?.label ||
                          __("Discount", "campaignbay")}
                      </th>
                    )}
                  </tr>
                </thead>
              )}
              <tbody className="campaignbay-bg-white campaignbay-divide-y !campaignbay-divide-gray-200 !campaignbay-border-gray-200 ">
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
                    percentage: "15%",
                  },
                  {
                    title: "Bulk Purchase",
                    range: "1-4",
                    discount: "5",
                    percentage: "5%",
                  },
                  {
                    title: "Bulk Purchase",
                    range: "5-9",
                    discount: "10",
                    percentage: "10%",
                  },
                  {
                    title: "Bulk Purchase",
                    range: "10+",
                    discount: "15",
                    percentage: "15%",
                  },
                ].map((row, index) => (
                  <tr key={index}>
                    {options.title?.show && (
                      <td className="campaignbay-px-3.5 campaignbay-py-3.5 campaignbay-whitespace-nowrap campaignbay-text-sm campaignbay-font-medium campaignbay-text-gray-600">
                        {row.title}
                      </td>
                    )}
                    {options.range?.show && (
                      <td className="campaignbay-px-3.5 campaignbay-py-3.5 campaignbay-whitespace-nowrap campaignbay-text-sm campaignbay-font-medium campaignbay-text-gray-600">
                        {row.range}
                      </td>
                    )}
                    {options.discount?.show && (
                      <td className="campaignbay-px-3.5 campaignbay-py-3.5 campaignbay-whitespace-nowrap campaignbay-text-sm campaignbay-font-medium campaignbay-text-gray-600">
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
        </div>
      </div>
      <div className="campaignbay-flex campaignbay-justify-end campaignbay-mt-4">
        <button
          className="wpab-cb-btn wpab-cb-btn-primary"
          disabled={isSaving}
          onClick={updateSettings}
        >
          <Icon icon={check} fill="currentColor" />
          {__("Save Changes", "campaignbay")}
        </button>
      </div>
    </Modal>
  );
};

export default QuantityTableEditModal;
