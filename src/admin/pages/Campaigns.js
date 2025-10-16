import { useState, useEffect } from "react";
import { __, _n, sprintf } from "@wordpress/i18n";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  BarChart3,
  Tag,
  Zap,
  Gift,
  Layers,
  Table,
  Table2,
  LayoutGrid,
} from "lucide-react";

import {
  Icon,
  plus,
  search,
  chevronUp,
  chevronDown,
  trash,
  previous,
  next,
  edit,
  copySmall,
} from "@wordpress/icons";

import {
  __experimentalToggleGroupControl as ToggleGroupControl,
  __experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import { useToast } from "../store/toast/use-toast";
import CbCheckbox from "../components/CbCheckbox"; // Assuming you still use this for the header
import { addQueryArgs } from "@wordpress/url";
import { useCbStore } from "../store/cbStore";
import Skeleton from "../components/Skeleton";
import Navbar from "../components/Navbar";
import ImportExport from "../components/ImportExport";
import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import formatDateTime, { timeDiff } from "../utils/Dates";
import DropdownMenu from "../components/DropdownMenu";
import ConfirmDialog from "../components/ConfirmDialog";

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { wpSettings, woocommerce_currency_symbol } = useCbStore();
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderby, setOrderby] = useState("modified");
  const [order, setOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [bulkAction, setBulkAction] = useState("");
  const [isBulkActionModalOpen, setIsBulkActionModalOpen] = useState(false);
  const [view, setView] = useState();

  useEffect(() => {
    const savedView = localStorage.getItem("campaignbay_campaigns_view");

    if (savedView) {
      setView(savedView);
    } else {
      setView("table");
    }
  }, []);

  useEffect(() => {
    if (view) {
      localStorage.setItem("campaignbay_campaigns_view", view);
    }
  }, [view]);

  const tableHeads = [
    { label: "Campaign Name", value: "post_name", isSortable: true },
    { label: "Status", value: "status", isSortable: true },
    { label: "Campaign Type", value: "type", isSortable: true },
    { label: "Target", value: "target", isSortable: false },
    { label: "Value", value: "value", isSortable: false },
    { label: "Start Date", value: "start_date", isSortable: true },
    { label: "End Date", value: "end_date", isSortable: true },
    { label: "Usage", value: "usage_count", isSortable: true },
    { label: "Last Modified", value: "modified", isSortable: true },
    { label: " ", value: "action", isSortable: false },
  ];

  useEffect(() => {
    fetchCampaigns();
  }, [orderby, order, searchQuery, currentPage, itemsPerPage]);

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      const queryParams = {
        page: currentPage,
        per_page: itemsPerPage,
        orderby: orderby,
        order: order,
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
        _timestamp: Date.now(),
      };
      const response = await apiFetch({
        path: addQueryArgs("/campaignbay/v1/campaigns", queryParams),
        method: "GET",
        parse: false,
      });

      setTotalPages(response.headers.get("x-wp-totalpages"));
      setTotalItems(response.headers.get("x-wp-total"));
      setCampaigns(await response.json());
    } catch (error) {
      addToast(__("Error fetching campaigns.", "campaignbay"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  // const formatDateTime = (dateTimeString) => {
  //   if (
  //     !dateTimeString ||
  //     new Date(dateTimeString).toString() === "Invalid Date"
  //   ) {
  //     return "—";
  //   }
  //   const format = `${wpSettings.dateFormat} ${wpSettings.timeFormat}`;
  //   const dateTime = getDate(dateTimeString);
  //   return date(format, dateTime, null);
  // };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map((c) => c.id));
    }
  };

  const handleSelectCampaign = (campaignId) => {
    if (selectedCampaigns.includes(campaignId)) {
      setSelectedCampaigns((prev) => prev.filter((id) => id !== campaignId));
    } else {
      setSelectedCampaigns((prev) => [...prev, campaignId]);
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
      setSelectedCampaigns((prev) =>
        prev.filter((id) => id !== selectedCampaignId)
      );
      setIsDeleteModalOpen(false);
    } catch (error) {
      addToast(__("Error deleting campaign", "campaignbay"), "error");
      setIsDeleteModalOpen(false);
    }
  };

  const handleSort = (newSortBy) => {
    if (orderby === newSortBy) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as the sort column and default to ascending.
      setOrderby(newSortBy);
      setOrder("asc");
    }
    console.log(orderby, order);
  };

  const TableHead = ({ label, isSortable, value, onClick }) => {
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
    if (orderby !== value) {
      return null; // Don't show an icon if it's not the active sort column
    }
    if (order === "asc") {
      return (
        <ArrowDownWideNarrow
          className="campaignbay-table-header-icon campaignbay-ml-2"
          size={16}
        />
      );
    }
    if (order === "desc") {
      return (
        <ArrowUpNarrowWide
          className="campaignbay-table-header-icon campaignbay-ml-2"
          size={16}
        />
      );
    }
    return (
      <Icon
        className="campaignbay-table-header-icon"
        icon={order === "asc" ? chevronUp : chevronDown}
        fill="currentColor"
      />
    );
  };
  const isAllSelected =
    campaigns.length > 0 && selectedCampaigns.length === campaigns.length;

  const getTargetType = (target_type) => {
    if (target_type === "product") {
      return "Selected Products";
    }
    if (target_type === "category") {
      return "Selected Categories";
    }
    if (target_type === "entire_store") {
      return "All Products";
    }
    return "All Products";
  };
  const applyFilters = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchCampaigns();
    }
  };

  const handleBulkAction = (action) => {
    setBulkAction(action);
    if (action !== "" && action !== null && action !== undefined) {
      setIsBulkActionModalOpen(true);
    }
  };

  const handleBulkActionModal = () => {
    if (!selectedCampaigns?.length || !bulkAction || bulkAction === "") {
      setIsBulkActionModalOpen(false);
      return;
    }
    if (bulkAction === "delete") {
      handleCampaignsDelete();
    } else if (bulkAction === "activate") {
      handleCampaignsStatusUpdate();
    } else if (bulkAction === "deactivate") {
      handleCampaignsStatusUpdate();
    }

    setIsBulkActionModalOpen(false);
    setIsLoading(false);
  };

  const bulkActionLabels = {
    "": __("Select Action", "campaignbay"), // Default
    activate: __("activate", "campaignbay"),
    deactivate: __("deactivate", "campaignbay"),
    delete: __("delete", "campaignbay"),
  };

  const confirmationMessage = sprintf(
    /* translators: %1$s: the action to perform (e.g., "delete"), %2$d: the number of campaigns. */
    _n(
      "Are you sure you want to %1$s %2$d selected campaign?",
      "Are you sure you want to %1$s %2$d selected campaigns?",
      selectedCampaigns.length || 0,
      "campaignbay"
    ),
    bulkActionLabels[bulkAction], // %1$s gets replaced with the action label
    selectedCampaigns.length || 0 // %2$d gets replaced with the number
  );

  const handleCampaignsDelete = async () => {
    // Ensure all campaign IDs are integers
    const campaignsToDeleteInt = selectedCampaigns
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
    setIsLoading(true);
    try {
      await apiFetch({
        path: `/campaignbay/v1/campaigns/bulk`,
        method: "DELETE",
        data: {
          ids: campaignsToDeleteInt,
        },
      });
      addToast(
        _n(
          "Campaign deleted successfully",
          "Campaigns deleted successfully",
          campaignsToDeleteInt.length,
          "campaignbay"
        ),
        "success"
      );
      setSelectedCampaigns([]);
      fetchCampaigns();
    } catch (error) {
      addToast(
        _n(
          "Error deleting campaign",
          "Error deleting campaigns",
          campaignsToDeleteInt.length,
          "campaignbay"
        ),
        "error"
      );
      console.log(error);
    }
  };

  const handleCampaignsStatusUpdate = async () => {
    const campaignsToUpdateInt = selectedCampaigns
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
    setIsLoading(true);
    try {
      await apiFetch({
        path: `/campaignbay/v1/campaigns/bulk`,
        method: "PUT",
        data: {
          ids: campaignsToUpdateInt,
          status: bulkAction === "activate" ? "active" : "inactive",
        },
      });
      addToast(
        _n(
          "Campaign status updated successfully",
          "Campaigns status updated successfully",
          campaignsToUpdateInt.length,
          "campaignbay"
        ),
        "success"
      );
      setSelectedCampaigns([]);
      console.log(campaignsToUpdateInt);
      setCampaigns((prev) =>
        prev.map((c) => {
          console.log(c);
          if (campaignsToUpdateInt.includes(parseInt(c.id, 10))) {
            return {
              ...c,
              status: bulkAction === "activate" ? "active" : "inactive",
            };
          }
          return { ...c };
        })
      );
      setBulkAction("");
      setSelectedCampaigns([]);
    } catch (error) {
      addToast(
        _n(
          "Error updating campaign status",
          "Error updating campaigns status",
          campaignsToUpdateInt.length,
          "campaignbay"
        ),
        "error"
      );
    }
  };

  const getCampaignValue = (campaign) => {
    if (campaign.type === "scheduled") {
      return (
        campaign?.discount_value +
        " " +
        (campaign?.discount_type === "percentage"
          ? "%"
          : woocommerce_currency_symbol)
      );
    }
    const tier = campaign?.tiers[0];
    if (campaign?.type === "bogo")
      return tier?.get_quantity + " / " + tier?.buy_quantity;
    return (
      tier?.value +
      " " +
      (tier?.type === "percentage" ? "%" : woocommerce_currency_symbol)
    );
  };

  const duplicateCampaign = async (campaignId) => {
    try {
      const response = await apiFetch({
        path: `/campaignbay/v1/campaigns/${campaignId}/duplicate`,
        method: "POST",
      });
      addToast(
        __("Campaign duplicated successfully.", "campaignbay"),
        "success"
      );
      fetchCampaigns();
    } catch (error) {
      addToast(
        __("Error duplicating campaign. Please try again.", "campaignbay"),
        "error"
      );
      setIsLoading(false);
    }
  };

  const getCampaignTypeIcon = (type) => {
    switch (type) {
      case "scheduled":
        return <Calendar className="campaignbay-w-3.5 campaignbay-h-3.5" />;
      case "earlybird":
        return <Zap className="campaignbay-w-3.5 campaignbay-h-3.5" />;
      case "bogo":
        return <Gift className="campaignbay-w-3.5 campaignbay-h-3.5" />;
      case "quantity":
        return <Layers className="campaignbay-w-3.5 campaignbay-h-3.5" />;
      default:
        return <Tag className="campaignbay-w-3.5 campaignbay-h-3.5" />;
    }
  };

  return (
    <div className="cb-page campaignbay-campaigns">
      <Navbar />
      <div className="cb-page-header-container">
        <div className="cb-page-header-title">
          {__("Campaigns", "campaignbay")}
        </div>
        <div className="cb-page-header-actions">
          <ImportExport refresh={fetchCampaigns} />
        </div>
      </div>
      <div className="cb-page-container">
        <div
          className={`campaignbay-bg-white ${
            view === "table" ? "" : "!campaignbay-border-0"
          }`}
        >
          {/* ==================================================================== */}
          {/* FILTERS SECTION                                                      */}
          {/* ==================================================================== */}
          <div
            className={`campaignbay-filters ${
              view === "table" ? "" : "campaignbay-bg-white"
            }`}
          >
            <div className="campaignbay-filter-group">
              <div className="campaignbay-filter-group-1">
                <select
                  className="wpab-select"
                  value={bulkAction}
                  onChange={(e) => {
                    handleBulkAction(e.target.value);
                  }}
                >
                  <option value="">Bulk Actions</option>
                  <option value="activate">Activate</option>
                  <option value="deactivate">Deactivate</option>
                  <option value="delete">Delete</option>
                </select>
                <select
                  className="wpab-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                  }}
                >
                  <option value="">Filter by Status</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="expired">Expired</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="campaignbay-filter-group-2">
                <select
                  className="wpab-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Filter by Type</option>
                  <option value="scheduled">Schedule Discount</option>
                  <option value="quantity">Quantity Discount</option>
                  <option value="earlybird">EarlyBird Discount</option>
                </select>
                <button
                  className="wpab-cb-btn wpab-cb-btn-primary"
                  onClick={applyFilters}
                >
                  Apply
                </button>

                <ToggleGroupControl
                  className={`cb-toggle-group-control campaignbay-mt-[-8px]`}
                  __next40pxDefaultSize
                  __nextHasNoMarginBottom
                  isBlock
                  value={view}
                  onChange={(value) => setView(value)}
                >
                  <ToggleGroupControlOption
                    label={<Table2 size={16} />}
                    value="table"
                  />
                  <ToggleGroupControlOption
                    label={<LayoutGrid size={16} />}
                    value="grid"
                  />
                </ToggleGroupControl>
              </div>
            </div>
            <div className="campaignbay-search-box">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="wpab-input"
                placeholder="Search Campaign"
              />
              <Icon
                icon={search}
                fill="currentColor"
                className="campaignbay-search-icon"
              />
            </div>
          </div>

          {view === "table" ? (
            <>
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
                      Array.from({ length: itemsPerPage || 10 }).map(
                        (_, index) => (
                          <tr key={index}>
                            <td>
                              <Skeleton />
                            </td>
                            <td>
                              <Skeleton />
                            </td>
                            <td>
                              <Skeleton
                                height="24"
                                width="24"
                                borderRadius="full"
                              />
                            </td>
                            <td>
                              <Skeleton />
                            </td>
                            <td>
                              <Skeleton />
                            </td>
                            <td>
                              <Skeleton>
                                <span>August 9, 2025 7:04 pm</span>
                              </Skeleton>
                            </td>
                            <td>
                              <Skeleton>
                                <span>August 9, 2025 7:04 pm</span>
                              </Skeleton>
                            </td>
                            <td>
                              <Skeleton />
                            </td>
                            <td>
                              <Skeleton />
                            </td>
                            <td>
                              <Skeleton
                                width="24"
                                height="24"
                                className="campaignbay-m-6"
                              />
                            </td>
                          </tr>
                        )
                      )
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
                          <td className="campaignbay-table-checkbox-cell campaignbay-sticky-l-td">
                            <CbCheckbox
                              checked={selectedCampaigns.includes(campaign.id)}
                              onChange={(isChecked) =>
                                handleSelectCampaign(campaign.id)
                              }
                            />
                          </td>
                          <td>
                            <a
                              className="campaignbay-capitalize "
                              href={`#/campaigns/${campaign.id}`}
                            >
                              {campaign.title}
                            </a>
                          </td>
                          <td>
                            <span
                              className={`campaignbay-status-pill campaignbay-status-${
                                campaign?.status?.replace("", "") || ""
                              }`}
                            >
                              {campaign?.status?.replace("", "") || ""}
                            </span>
                          </td>
                          <td className="campaignbay-capitalize campaignbay-text-secondary">
                            {campaign.type}
                          </td>
                          <td className="campaignbay-capitalize campaignbay-text-secondary">
                            {getTargetType(campaign.target_type)}
                          </td>
                          <td>{getCampaignValue(campaign)}</td>
                          <td className="campaignbay-text-secondary">
                            {formatDateTime(campaign.start_datetime_unix)}
                          </td>
                          <td className="campaignbay-text-secondary">
                            {formatDateTime(campaign.end_datetime_unix)}
                          </td>
                          <td className="campaignbay-text-secondary">
                            {campaign.usage_count || 0}
                          </td>
                          <td className="campaignbay-text-secondary">
                            {timeDiff(campaign.date_modified)}
                          </td>
                          <td className="campaignbay-sticky-r-td">
                            <DropdownMenu
                              controls={[
                                {
                                  title: "Edit",
                                  icon: edit,
                                  onClick: () =>
                                    navigate(`/campaigns/${campaign.id}`),
                                },
                                {
                                  title: "Duplicate",
                                  icon: copySmall,
                                  onClick: async () => {
                                    setIsLoading(true);
                                    duplicateCampaign(campaign.id);
                                  },
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
            </>
          ) : (
            <>
              {/* ==================================================================== */}
              {/* GRID                                                    */}
              {/* ==================================================================== */}

              <div>
                <div className="campaignbay-grid campaign-grid campaignbay-gap-3  campaignbay-bg-body campaignbay-py-3.5">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="campaignbay-bg-white campaignbay-rounded-xs campaignbay-border campaignbay-border-gray-200 campaignbay-p-3.5 campaignbay-pb-1.5 campaignbay-hover:shadow-md campaignbay-hover:border-gray-300 campaignbay-transition-all campaignbay-duration-200 campaignbay-group"
                    >
                      {/* Card Header */}
                      <div className="campaignbay-flex campaignbay-items-start campaignbay-justify-between campaignbay-mb-2.5">
                        <div className="campaignbay-flex campaignbay-items-start campaignbay-gap-2 campaignbay-flex-1 campaignbay-min-w-0">
                          <CbCheckbox
                            checked={selectedCampaigns.includes(campaign.id)}
                            onChange={(isChecked) =>
                              handleSelectCampaign(campaign.id)
                            }
                          />
                          <div className="campaignbay-flex-1 campaignbay-min-w-0">
                            <a
                              className="campaignbay-capitalize campaignbay-campaign-link"
                              href={`#/campaigns/${campaign.id}`}
                            >
                              {campaign.title}
                            </a>
                          </div>
                        </div>
                        <DropdownMenu
                          controls={[
                            {
                              title: "Edit",
                              icon: edit,
                              onClick: () =>
                                navigate(`/campaigns/${campaign.id}`),
                            },
                            {
                              title: "Duplicate",
                              icon: copySmall,
                              onClick: async () => {
                                setIsLoading(true);
                                duplicateCampaign(campaign.id);
                              },
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
                      </div>

                      {/* Campaign Details */}
                      <div className="campaignbay-grid campaignbay-grid-cols-2 campaignbay-gap-x-3 campaignbay-gap-y-2  campaignbay-mb-2.5">
                        {/* Left Column */}
                        <div className="campaignbay-space-y-2">
                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1.5">
                            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-5 campaignbay-h-5 campaignbay-rounded campaignbay-bg-blue-100 campaignbay-text-blue-600 campaignbay-flex-shrink-0 ">
                              {getCampaignTypeIcon(campaign.type)}
                            </div>
                            <div className="campaignbay-flex-1 campaignbay-min-w-0">
                              <div className="campaignbay-text-xs campaignbay-text-gray-900 campaignbay-font-medium campaignbay-truncate campaignbay-capitalize">
                                {campaign.type}
                              </div>
                            </div>
                          </div>

                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1.5">
                            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-5 campaignbay-h-5 campaignbay-rounded campaignbay-bg-purple-100 campaignbay-text-purple-600 campaignbay-flex-shrink-0">
                              <Target className="campaignbay-w-3.5 campaignbay-h-3.5" />
                            </div>
                            <div className="campaignbay-flex-1 campaignbay-min-w-0">
                              <div className="campaignbay-text-xs campaignbay-text-gray-800 campaignbay-truncatecampaignbay-capitalize">
                                {getTargetType(campaign.target_type)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="campaignbay-space-y-2">
                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1.5">
                            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-5 campaignbay-h-5 campaignbay-rounded campaignbay-bg-amber-100 campaignbay-text-amber-600 campaignbay-flex-shrink-0">
                              <TrendingUp className="campaignbay-w-3.5 campaignbay-h-3.5" />
                            </div>
                            <div className="campaignbay-flex-1 campaignbay-min-w-0">
                              <div className="campaignbay-text-xs campaignbay-text-gray-900 campaignbay-font-semibold campaignbay-truncate">
                                {getCampaignValue(campaign)}
                              </div>
                            </div>
                          </div>

                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1.5">
                            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-5 campaignbay-h-5 campaignbay-rounded campaignbay-bg-indigo-100 campaignbay-text-indigo-600 campaignbay-flex-shrink-0">
                              <BarChart3 className="campaignbay-w-3.5 campaignbay-h-3.5" />
                            </div>
                            <div className="campaignbay-flex-1 campaignbay-min-w-0">
                              <div className="campaignbay-text-xs campaignbay-text-gray-800 campaignbay-truncate">
                                Usage: {campaign.usage_count || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dates Section */}
                      <div className="campaignbay-pt-2.5 campaignbay-border-t campaignbay-border-gray-200 campaignbay-mb-2.5">
                        <div className="campaignbay-grid campaignbay-grid-cols-2 campaignbay-gap-x-3 campaignbay-gap-y-1">
                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1">
                            <Calendar className="campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-gray-500 campaignbay-flex-shrink-0" />
                            <span className="campaignbay-text-xs campaignbay-text-gray-600">
                              Start:
                            </span>
                          </div>
                          <div className="campaignbay-text-xs campaignbay-text-gray-700 campaignbay-truncate">
                            {formatDateTime(campaign.start_datetime_unix)}
                          </div>

                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1">
                            <Calendar className="campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-gray-500 campaignbay-flex-shrink-0" />
                            <span className="campaignbay-text-xs campaignbay-text-gray-600">
                              End:
                            </span>
                          </div>
                          <div className="campaignbay-text-xs campaignbay-text-gray-700 campaignbay-truncate">
                            {formatDateTime(campaign.end_datetime_unix)}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-center campaignbay-pt-1.5 campaignbay-border-t campaignbay-border-gray-200">
                        <div className="">
                          <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-1.5 campaignbay-text-xs campaignbay-text-gray-500">
                            <Clock className="campaignbay-w-3.5 campaignbay-h-3.5" />
                            <span className="campaignbay-text-xs campaignbay-text-gray-600">
                              {timeDiff(campaign.date_modified)}
                            </span>
                          </div>
                        </div>
                        {/* Status Badge */}
                        <div className="campaignbay-my-1.5">
                          <span
                            className={`campaignbay-status-pill campaignbay-status-${
                              campaign?.status?.replace("", "") || ""
                            }`}
                          >
                            {campaign?.status?.replace("", "") || ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
          {/* ==================================================================== */}
          {/* FOOTER SECTION                                                     */}
          {/* ==================================================================== */}
          <div
            className={`campaignbay-table-footer ${
              view === "table" ? "" : "campaignbay-bg-white"
            }`}
          >
            <div className="campaignbay-bulk-actions-footer">
              {/* <CbCheckbox checked={isAllSelected} onChange={handleSelectAll} />
              <span>{selectedCampaigns.length} ITEM SELECTED</span> */}
              Show Campaigns
              <select
                className="wpab-select campaignbay-hidden-border"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {[10, 25, 50, 100].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              per page.
            </div>
            <div className="campaignbay-pagination">
              <span>PAGE</span>
              <select
                className="wpab-select campaignbay-hidden-border"
                value={currentPage}
                onChange={(e) => setCurrentPage(e.target.value)}
              >
                {Array.from({ length: totalPages }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
              <span className="campaignbay-w-max">OF {totalPages}</span>
              <div className="campaignbay-pagination-arrows campaignbay-ml-4">
                <button
                  className="wpab-cb-btn campaignbay-arrow-button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <Icon icon={previous} fill="currentColor" />
                </button>
                <button
                  className="wpab-cb-btn campaignbay-arrow-button"
                  disabled={currentPage === parseInt(totalPages)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
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

      <ConfirmDialog
        isOpen={isBulkActionModalOpen}
        onConfirm={handleBulkActionModal}
        onCancel={() => setIsBulkActionModalOpen(false)}
      >
        {selectedCampaigns?.length > 0
          ? confirmationMessage
          : __(
              "Please select campaigns to perform this action.",
              "campaignbay"
            )}
      </ConfirmDialog>
    </div>
  );
};

export default Campaigns;

const campaignsData = [
  {
    id: 1,
    name: "Happy Hour Sale Sssssssssssssss",
    status: "Inactive",
    campaignType: "Scheduled",
    target: "All Products",
    value: "50.00 %",
    startDate: "September 16, 2025 3:26 pm",
    endDate: "—",
    usage: 0,
    lastModified: "4 days ago",
  },
  {
    id: 2,
    name: "Earlybird",
    status: "Active",
    campaignType: "Earlybird",
    target: "All Products",
    value: "16 %",
    startDate: "—",
    endDate: "—",
    usage: 5,
    lastModified: "4 days ago",
  },
  {
    id: 3,
    name: "Bogo (Copy)",
    status: "Active",
    campaignType: "Bogo",
    target: "All Products",
    value: "undefined ℬ",
    startDate: "—",
    endDate: "—",
    usage: 0,
    lastModified: "4 days ago",
  },
  {
    id: 4,
    name: "Bogo (Copy) (Copy)",
    status: "Active",
    campaignType: "Bogo",
    target: "All Products",
    value: "undefined ℬ",
    startDate: "—",
    endDate: "—",
    usage: 0,
    lastModified: "4 days ago",
  },
  {
    id: 5,
    name: "Minimal Test Campaign",
    status: "Active",
    campaignType: "Scheduled",
    target: "All Products",
    value: "10.00 %",
    startDate: "—",
    endDate: "—",
    usage: 0,
    lastModified: "2 days ago",
  },
  {
    id: 6,
    name: "Bogo",
    status: "Active",
    campaignType: "Bogo",
    target: "All Products",
    value: "undefined ℬ",
    startDate: "—",
    endDate: "—",
    usage: 5,
    lastModified: "19 hours ago",
  },
  {
    id: 7,
    name: "Happy Hour Sale",
    status: "Active",
    campaignType: "Quantity",
    target: "All Products",
    value: "10 %",
    startDate: "—",
    endDate: "—",
    usage: 5,
    lastModified: "17 hours ago",
  },
  {
    id: 8,
    name: "Happy Hour Sale (Copy)",
    status: "Active",
    campaignType: "Quantity",
    target: "All Products",
    value: "9 %",
    startDate: "—",
    endDate: "—",
    usage: 4,
    lastModified: "14 hours ago",
  },
  {
    id: 9,
    name: "Happy Hour Sale (Copy) (Copy)",
    status: "Active",
    campaignType: "Quantity",
    target: "All Products",
    value: "9 %",
    startDate: "—",
    endDate: "—",
    usage: 0,
    lastModified: "14 hours ago",
  },
];
