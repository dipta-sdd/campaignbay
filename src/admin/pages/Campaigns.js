import { useState, useMemo, useEffect } from "@wordpress/element"; // <-- NEW: Import useState
import { __ } from "@wordpress/i18n";
import { useNavigate } from "react-router-dom";
import { check, Icon, plus, search } from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import { __experimentalConfirmDialog as ConfirmDialog } from "@wordpress/components";
import { useToast } from "../store/toast/use-toast";
import Checkbox from "../components/Checkbox";
import CbCheckbox from "../components/CbCheckbox";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const { addToast } = useToast();

  const tableHeads = [
    {
      label: "Campaign Name",
      key: "title",
      isSortable: true,
    },
    {
      label: "Status",
      key: "status",
      isSortable: true,
    },
    {
      label: "Discount Type",
      key: "discount_type",
      isSortable: true,
    },
    {
      label: "Target",
      key: "target",
      isSortable: true,
    },
    {
      label: "Value",
      key: "value",
      isSortable: true,
    },
    {
      label: "Start Date",
      key: "start_date",
      isSortable: true,
    },
    {
      label: "End Date",
      key: "end_date",
      isSortable: true,
    },
    
  ];

  useEffect(() => {
    setIsLoading(true);
    const fetchCampaigns = async () => {
      try {
        const response = await apiFetch({
          path: "/campaignbay/v1/campaigns",
          method: "GET",
        });
        setCampaigns(response);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        addToast(
          __("Something went wrong, please try again later.", "campaignbay"),
          "error"
        );
      }
    };

    fetchCampaigns();
  }, []);

  const handleConfirmDelete = async () => {
    try {
      const response = await apiFetch({
        path: `/campaignbay/v1/campaigns/${selectedCampaign[0]?.id}`,
        method: "DELETE",
      });
      addToast(__("Campaign deleted successfully", "campaignbay"), "success");
      setCampaigns(
        campaigns.filter((campaign) => campaign.id !== selectedCampaign[0]?.id)
      );
      console.log("campaigns", campaigns);
      console.log("selectedCampaign", selectedCampaign);
    } catch (error) {
      addToast(__("Error deleting campaign", "campaignbay"), "error");
    }
    setIsModalOpen(false);
  };

  return (
    <div className="cb-page campaignbay-campaigns">
      <div className="cb-page-header-container">
        <div className="cb-page-header-title">
          {__("Campaigns", "campaignbay")}
        </div>
        <div className="cb-page-header-actions">
          <button
            className="wpab-cb-btn wpab-cb-btn-primary "
            onClick={() => navigate("/campaigns/add")}
          >
            <Icon icon={plus} fill="currentColor" />
            {__("Add Campaign", "campaignbay")}
          </button>
        </div>
      </div>
      <div className="cb-page-container">
        <div className="cb-bg-white">
          {/* ==================================================================== */}
          {/* FILTERS SECTION                                                      */}
          {/* ==================================================================== */}
          <div className="campaignbay-filters">
            <div className="campaignbay-filter-group">
              <div className="campaignbay-filter-group-1">
                <select className="wpab-select">
                  <option>Bulk Actions</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
                <select className="wpab-select">
                  <option>Filter by Status</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="campaignbay-filter-group-2">
                <select className="wpab-select">
                  <option>Filter by Discount</option>
                  <option value="scheduled">Schedule Discount</option>
                  <option value="quantity">Quantity Discount</option>
                  <option value="earlybird">EarlyBird Discount</option>
                </select>
                <button className="wpab-cb-btn wpab-cb-btn-primary">
                  Apply
                </button>
              </div>
            </div>
            <div className="campaignbay-search-box">
              <input
                type="search"
                className="wpab-input"
                placeholder="Search Campaign"
              />
              <Icon
                icon={search}
                fill="currentColor"
                className="campaignbay-search-icon"
              />
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="campaignbay-search-icon"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg> */}
            </div>
          </div>

          {/* ==================================================================== */}
          {/* TABLE CONTAINER                                                    */}
          {/* ==================================================================== */}
          <div className="campaignbay-table-container">
            <table className="campaignbay-table">
              <thead>
                <tr>
                  <th className="campaignbay-table-checkbox-cell">
                    <CbCheckbox checked={true} onChange={() => {}} />
                  </th>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Discount Type</th>
                  <th>Target</th>
                  <th>Value</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Usage</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {/* --- Example Row: Active --- */}
                <tr>
                  <td className="campaignbay-table-checkbox-cell">
                    <input type="checkbox" />
                  </td>
                  <td>
                    <a href="#">Summer Sale 2025</a>
                  </td>
                  <td>
                    <span className="campaignbay-status-pill campaignbay-status-active">
                      Active
                    </span>
                  </td>
                  <td>Schedule Discount</td>
                  <td>Entire Store</td>
                  <td>20%</td>
                  <td>Jun 1, 2025</td>
                  <td>Aug 30, 2025</td>
                  <td>1247</td>
                  <td>
                    <button className="campaignbay-action-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </td>
                </tr>
                {/* --- Example Row: Scheduled --- */}
                <tr>
                  <td className="campaignbay-table-checkbox-cell">
                    <input type="checkbox" />
                  </td>
                  <td>
                    <a href="#">Summer Sale 2026</a>
                  </td>
                  <td>
                    <span className="campaignbay-status-pill campaignbay-status-scheduled">
                      Scheduled
                    </span>
                  </td>
                  <td>Schedule Discount</td>
                  <td>Entire Store</td>
                  <td>20%</td>
                  <td>Jun 1, 2025</td>
                  <td>Aug 30, 2025</td>
                  <td>1247</td>
                  <td>
                    <button className="campaignbay-action-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </td>
                </tr>
                {/* --- Example Row: Expired --- */}
                <tr>
                  <td className="campaignbay-table-checkbox-cell">
                    <input type="checkbox" />
                  </td>
                  <td>
                    <a href="#">Summer Sale 2024</a>
                  </td>
                  <td>
                    <span className="campaignbay-status-pill campaignbay-status-expired">
                      Expired
                    </span>
                  </td>
                  <td>Schedule Discount</td>
                  <td>Entire Store</td>
                  <td>20%</td>
                  <td>Jun 1, 2025</td>
                  <td>Aug 30, 2025</td>
                  <td>1247</td>
                  <td>
                    <button className="campaignbay-action-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </td>
                </tr>
                {/* --- Example Row: Inactive --- */}
                <tr>
                  <td className="campaignbay-table-checkbox-cell">
                    <input type="checkbox" />
                  </td>
                  <td>
                    <a href="#">Summer Sale 2025</a>
                  </td>
                  <td>
                    <span className="campaignbay-status-pill campaignbay-status-inactive">
                      Inactive
                    </span>
                  </td>
                  <td>Schedule Discount</td>
                  <td>Entire Store</td>
                  <td>20%</td>
                  <td>Jun 1, 2025</td>
                  <td>Aug 30, 2025</td>
                  <td>1247</td>
                  <td>
                    <button className="campaignbay-action-button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================================== */}
          {/* FOOTER SECTION                                                     */}
          {/* ==================================================================== */}
          <div className="campaignbay-table-footer">
            <div className="campaignbay-bulk-actions-footer">
              <input type="checkbox" checked readOnly />
              <span>1 ITEM SELECTED</span>
              <button className="campaignbay-delete-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
            <div className="campaignbay-pagination">
              <span>PAGE</span>
              <select className="wpab-select wpab-page-select">
                <option>1</option>
              </select>
              <span>OF 340</span>
              <div className="campaignbay-pagination-arrows">
                <button className="campaignbay-arrow-button" disabled>
                  {"<<"}
                </button>
                <button className="campaignbay-arrow-button">{">>"}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsModalOpen(false)}
      >
        {__("Are you sure you want to delete this campaign?", "campaignbay")}
      </ConfirmDialog>
    </div>
  );
};

export default Campaigns;
