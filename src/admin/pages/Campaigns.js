import { useState, useMemo, useEffect } from "react";
import { __ } from "@wordpress/i18n";
import { useNavigate } from "react-router-dom";
import {
  Icon,
  plus,
  search,
  chevronUp,
  chevronDown,
  trash,
  moreVertical,
  previous,
  next,
  more,
  arrowLeft,
  arrowRight,
  arrowUp,
  arrowDown,
  edit,
} from "@wordpress/icons";
import apiFetch from "@wordpress/api-fetch";
import {
  __experimentalConfirmDialog as ConfirmDialog,
  ToolbarDropdownMenu,
} from "@wordpress/components";
import { useToast } from "../store/toast/use-toast";
import CbCheckbox from "../components/CbCheckbox"; // Assuming you still use this for the header

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();

  // --- State for selection, sorting, and modals ---
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]); // <-- NEW: Tracks selected campaign IDs
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

  const tableHeads = [
    { label: "Campaign Name", value: "title", isSortable: true },
    { label: "Status", value: "status", isSortable: true },
    { label: "Discount Type", value: "discount_type", isSortable: false },
    { label: "Target", value: "target", isSortable: false },
    { label: "Value", value: "value", isSortable: false },
    { label: "Start Date", value: "start_date", isSortable: true },
    { label: "End Date", value: "end_date", isSortable: true },
    { label: "Usage", value: "usage", isSortable: false },
    { label: "Action", value: "action", isSortable: false },
  ];

  useEffect(() => {
    setIsLoading(true);
    const fetchCampaigns = async () => {
      try {
        // In a real app, you would add sorting/filtering params here
        const response = await apiFetch({
          path: "/campaignbay/v1/campaigns",
          method: "GET",
        });
        setCampaigns(response);
      } catch (error) {
        addToast(__("Error fetching campaigns.", "campaignbay"), "error");
      }
      setIsLoading(false);
    };
    fetchCampaigns();
  }, []);

  // --- NEW: Checkbox Handlers ---
  const handleSelectAll = (isChecked) => {
    if (isChecked) {
      setSelectedCampaigns(campaigns.map((c) => c.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const handleSelectCampaign = (campaignId, isChecked) => {
    if (isChecked) {
      setSelectedCampaigns((prev) => [...prev, campaignId]);
    } else {
      setSelectedCampaigns((prev) => prev.filter((id) => id !== campaignId));
    }
  };

 
  const handleCampaignDelete = async () => {
    try {
      await apiFetch({
        path: `/campaignbay/v1/campaigns/${selectedCampaignId}`,
        method: "DELETE",
      });   
        addToast(__("Campaign deleted successfully", "campaignbay"), "success");
        setCampaigns((prev) => prev.filter((c) => c.id !== selectedCampaignId));
        setSelectedCampaigns((prev) => prev.filter((id) => id !== selectedCampaignId));
        setIsDeleteModalOpen(false);
    } catch (error) {
      addToast(__("Error deleting campaign", "campaignbay"), "error");
      setIsDeleteModalOpen(false);
    }
  };

  const handleCampaignsDelete = async () => {
    const campaignsToDelete = [...selectedCampaigns]; // Copy the IDs to delete
    setIsLoading(true);
    setIsDeleteModalOpen(false);

    try {
      // This could be a bulk delete endpoint in the future
      for (const campaignId of campaignsToDelete) {
        await apiFetch({
          path: `/campaignbay/v1/campaigns/${campaignId}`,
          method: "DELETE",
        });
      }
      addToast(
        __("Campaign(s) deleted successfully", "campaignbay"),
        "success"
      );
      // Update UI by filtering out the deleted campaigns
      setCampaigns((prev) =>
        prev.filter((c) => !campaignsToDelete.includes(c.id))
      );
      setSelectedCampaigns([]); // Clear selection
    } catch (error) {
      addToast(__("Error deleting campaign(s)", "campaignbay"), "error");
    }
    setIsLoading(false);
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as the sort column and default to ascending.
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
    // NOTE: In a future step, you would trigger a data re-fetch here.
    // For now, we are just updating the state.
  };

  const TableHead = ({ label, isSortable, value, onClick }) => {
    console.log(isSortable, value);
    if (isSortable) {
      return (
        <th>
          <span
            className="campaignbay-table-header campaignbay-table-header-sortable"
            onClick={onClick}
          >
            {label}
            <SortIndicator value={value} />
          </span>
        </th>
      );
    }
    return (
      <th>
        <span className="campaignbay-table-header">{label}</span>
      </th>
    );
  };

  const SortIndicator = ({ value }) => {
    console.log(sortBy, value);
    if (sortBy !== value) {
      return null; // Don't show an icon if it's not the active sort column
    }
    return (
      <Icon
        className="campaignbay-table-header-icon"
        icon={sortOrder === "asc" ? chevronUp : chevronDown}
        fill="currentColor"
      />
    );
  };

  const isAllSelected =
    campaigns.length > 0 && selectedCampaigns.length === campaigns.length;

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
                    <CbCheckbox
                      checked={isAllSelected}
                      onChange={handleSelectAll}
                    />
                  </th>
                  {tableHeads.map((head) => (
                    <TableHead
                      key={head.value}
                      label={head.label}
                      isSortable={head.isSortable}
                      value={head.value}
                      onClick={() => handleSort(head.value)}
                    />
                  ))}
                </tr>
              </thead>
              <tbody>

                {isLoading ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      Loading campaigns...
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ textAlign: "center" }}>
                      No campaigns found.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr
                      key={campaign.id}
                      className={
                        selectedCampaigns.includes(campaign.id)
                          ? "is-selected"
                          : ""
                      }
                    >
                      <td className="campaignbay-table-checkbox-cell">
                        {/* --- MODIFIED: Individual Row Checkbox --- */}
                        <CbCheckbox
                          checked={selectedCampaigns.includes(campaign.id)}
                          onChange={(isChecked) =>
                            handleSelectCampaign(campaign.id, isChecked)
                          }
                        />
                      </td>
                      <td>
                        <a href={`#/campaigns/${campaign.id}`}>
                          {campaign.title}
                        </a>
                      </td>
                      <td>
                        <span
                          className={`campaignbay-status-pill campaignbay-status-${campaign.status.replace(
                            "wpab_cb_",
                            ""
                          )}`}
                        >
                          {/* Capitalize first letter */}
                          {campaign.status
                            .replace("wpab_cb_", "")
                            .charAt(0)
                            .toUpperCase() +
                            campaign.status.slice(1).replace("wpab_cb_", "")}
                        </span>
                      </td>
                      <td>{campaign.campaign_type}</td>
                      <td>{campaign.target_type}</td>
                      <td>
                        {campaign.discount_value}
                        {campaign.discount_type === "percentage" ? "%" : ""}
                      </td>
                      <td>
                        {new Date(campaign.start_datetime).toLocaleDateString()}
                      </td>
                      <td>
                        {new Date(campaign.end_datetime).toLocaleDateString()}
                      </td>
                      <td>{/* Usage data will come from logs */}</td>
                      <td>
                        <ToolbarDropdownMenu
                          icon={moreVertical}
                          label="Actions"
                          position="bottom left"
                          controls={[
                            {
                              title: "Edit",
                              icon: edit,
                              onClick: () => navigate(`/campaigns/${campaign.id}`),
                            },
                            {
                              title: "Delete",
                              icon: trash,
                              onClick: () => {
                                setSelectedCampaignId(campaign.id);
                                setIsDeleteModalOpen(true);
                              },
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ==================================================================== */}
          {/* FOOTER SECTION                                                     */}
          {/* ==================================================================== */}
          <div className="campaignbay-table-footer">
            <div className="campaignbay-bulk-actions-footer">
              <CbCheckbox checked={true} onChange={() => {}} />
              <span>1 ITEM SELECTED</span>
            </div>
            <div className="campaignbay-pagination">
              <span>PAGE</span>
              <select className="wpab-select campaignbay-hidden-border">
                <option>1</option>
              </select>
              <span>OF 340</span>
              <div className="campaignbay-pagination-arrows">
                <button
                  className="wpab-cb-btn campaignbay-arrow-button"
                  disabled
                >
                  <Icon icon={previous} fill="currentColor" />
                </button>
                <button className="wpab-cb-btn campaignbay-arrow-button">
                  <Icon icon={next} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onConfirm={handleCampaignDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      >
        {__("Are you sure you want to delete this campaign?", "campaignbay")}
      </ConfirmDialog>
    </div>
  );
};

export default Campaigns;
