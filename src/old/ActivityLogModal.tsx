import {
  useState,
  useEffect,
  useCallback,
  FC,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import {
  Spinner,
  Button,
  SelectControl,
  TextControl,
} from "@wordpress/components";
import { __, _n, sprintf } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { Icon, chevronUp, chevronDown } from "@wordpress/icons";
import Modal from "./Modal";
import Select from "./Select";
import Input from "./Input";

interface ActivityLog {
  id: number;
  timestamp: string;
  log_type: string;
  campaign_id: number;
  campaign_title?: string;
  campaign_edit_link?: string;
  order_id: number;
  order_number?: string;
  order_status?: string;
  order_status_label?: string;
  order_edit_link?: string;
  user_id: number;
  user_name?: string;
  user_email?: string;
  base_total: number;
  total_discount: number;
  order_total: number;
}

interface Filters {
  log_type: string;
  date_from: string;
  date_to: string;
}

type OrderDirection = "asc" | "desc";

interface TableHeadConfig {
  label: string;
  value: string;
  isSortable?: boolean;
}

interface PerPage {
  label: string;
  value: number;
}

interface ActivityLogModalProps {
  isActivityModalOpen: boolean;
  setIsActivityModalOpen: Dispatch<SetStateAction<boolean>>;
}
const ActivityLogModal: FC<ActivityLogModalProps> = ({
  isActivityModalOpen,
  setIsActivityModalOpen,
}) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [perPage, setPerPage] = useState<number>(10);

  const [orderby, setOrderby] = useState<string>("timestamp");
  const [order, setOrder] = useState<OrderDirection>("desc");

  // Filter states - removed campaign_id and order_status
  const [filters, setFilters] = useState<Filters>({
    log_type: "activity",
    date_from: "",
    date_to: "",
  });

  const logTypeOptions: TableHeadConfig[] = [
    { label: __("All Types", "campaignbay"), value: "" },
    { label: __("Activity", "campaignbay"), value: "activity" },
    { label: __("Sale", "campaignbay"), value: "sale" },
    { label: __("Campaign Created", "campaignbay"), value: "campaign_created" },
    { label: __("Campaign Updated", "campaignbay"), value: "campaign_updated" },
    { label: __("Campaign Deleted", "campaignbay"), value: "campaign_deleted" },
  ];

  const perPageOptions: PerPage[] = [
    { label: __("10 per page", "campaignbay"), value: 10 },
    { label: __("20 per page", "campaignbay"), value: 20 },
    { label: __("50 per page", "campaignbay"), value: 50 },
    { label: __("100 per page", "campaignbay"), value: 100 },
  ];

  const shouldShowFinancialColumns = (): boolean => {
    return filters.log_type === "sale" || filters.log_type === "";
  };

  const getTableHeads = (): TableHeadConfig[] => {
    const baseColumns: TableHeadConfig[] = [
      {
        label: __("Time", "campaignbay"),
        value: "timestamp",
        isSortable: true,
      },
      { label: __("Type", "campaignbay"), value: "log_type", isSortable: true },
      {
        label: __("Campaign", "campaignbay"),
        value: "campaign_title",
        isSortable: true,
      },
      {
        label: __("Order", "campaignbay"),
        value: "order_id",
        isSortable: true,
      },
      {
        label: __("User", "campaignbay"),
        value: "user_name",
        isSortable: true,
      },
    ];

    if (shouldShowFinancialColumns()) {
      baseColumns.push(
        {
          label: __("Amount", "campaignbay"),
          value: "base_total",
          isSortable: true,
        },
        {
          label: __("Discount", "campaignbay"),
          value: "total_discount",
          isSortable: true,
        },
        {
          label: __("Total", "campaignbay"),
          value: "order_total",
          isSortable: true,
        }
      );
    }

    return baseColumns;
  };

  const fetchActivityLogs = useCallback(
    async (page = 1, newFilters = filters) => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          per_page: perPage,
          orderby,
          order,
          ...newFilters,
        };

        // Remove empty filter values
        Object.keys(params).forEach((key) => {
          if (params[key] === "") {
            delete params[key];
          }
        });

        const response = await apiFetch({
          path: addQueryArgs("/campaignbay/v1/activity-logs", params),
          parse: false,
        });

        setCurrentPage(page);

        // Get pagination info from headers
        const totalItemsHeader =
          response.headers?.get("X-WP-Total") ||
          response.headers?.get("x-wp-total") ||
          "";
        const totalPagesHeader =
          response.headers?.get("X-WP-TotalPages") ||
          response.headers?.get("x-wp-total-pages") ||
          "";

        setTotalItems(parseInt(totalItemsHeader, 10));
        setTotalPages(parseInt(totalPagesHeader, 10));
        setActivityLogs(await response.json());
      } catch (error) {
        console.error("Error fetching activity logs:", error);
        setActivityLogs([]);
      }
      setIsLoading(false);
    },
    [perPage, filters, orderby, order]
  );

  useEffect(() => {
    if (isActivityModalOpen) {
      fetchActivityLogs(1);
    }
  }, [isActivityModalOpen, fetchActivityLogs]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);
    fetchActivityLogs(1, newFilters);
  };

  const handlePerPageChange = (value: string | number) => {
    setPerPage(Number(value));
    setCurrentPage(1);
    fetchActivityLogs(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchActivityLogs(newPage);
    }
  };

  const handleSort = (newSortBy: string) => {
    if (orderby === newSortBy) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      // If clicking a new column, set it as the sort column and default to ascending.
      setOrderby(newSortBy);
      setOrder("asc");
    }
  };

  const closeModal = () => {
    setIsActivityModalOpen(false);
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLogTypeLabel = (logType: string): string => {
    const option = logTypeOptions.find((opt) => opt.value === logType);
    return option ? option.label : logType;
  };

  const getOrderStatusLabel = (status: string): string => {
    const statusLabels: Record<string, string> = {
      pending: __("Pending", "campaignbay"),
      processing: __("Processing", "campaignbay"),
      "on-hold": __("On Hold", "campaignbay"),
      completed: __("Completed", "campaignbay"),
      cancelled: __("Cancelled", "campaignbay"),
      refunded: __("Refunded", "campaignbay"),
      failed: __("Failed", "campaignbay"),
    };
    return statusLabels[status] || status;
  };

  const getLogTypeColor = (logType: string): string => {
    const colors: Record<string, string> = {
      activity: "#6f42c1", // Purple for activity
      sale: "#28a745", // Green for sales
      campaign_created: "#007cba", // Blue for created
      campaign_updated: "#ffc107", // Yellow for updated
      campaign_deleted: "#6c757d", // Gray for deleted
    };
    return colors[logType] || "#6c757d";
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): (number | string)[] => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // Always show first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      // Show pages around current
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Always show last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const TableHead: FC<{
    label: ReactNode;
    isSortable: boolean;
    value: string;
    onClick: () => void;
  }> = ({ label, isSortable, value, onClick }) => {
    if (isSortable) {
      return (
        <th>
          <span
            className="campaignbay-table-header campaignbay-flex campaignbay-items-center campaignbay-p-[4px]"
            onClick={onClick}
            style={{ cursor: "pointer" }}
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

  const SortIndicator: FC<{ value: string }> = ({ value }) => {
    if (orderby !== value) {
      return null; // Don't show an icon if it's not the active sort column
    }
    return (
      <Icon
        className="campaignbay-table-header-icon"
        icon={order === "asc" ? chevronUp : chevronDown}
        fill="currentColor"
        style={{ marginLeft: "4px" }}
      />
    );
  };

  if (!isActivityModalOpen) {
    return null;
  }

  const tableHeads = getTableHeads();
  const colSpan = tableHeads.length;

  return (
    <Modal
      title={__("Activity Log", "campaignbay")}
      onRequestClose={closeModal}
      className="wpab-cb-activity-log-modal campaignbay-w-[95vw] md:campaignbay-w-[90vw] lg:campaignbay-w-[85vw] campaignbay-max-w-7xl campaignbay-max-h-[90vh] campaignbay-rounded-none campaignbay-overflow-y-auto"
    >
      {/* Filters Section */}
      <div className="campaignbay-mb-[6px] campaignbay-p-[16px] campaignbay-bg-gray-50 campaignbay-rounded-[8px] campaignbay-border campaignbay-border-gray-200">
        <h3 className="campaignbay-text-lg campaignbay-font-semibold campaignbay-mb-[4px]">
          {__("Filters", "campaignbay")}
        </h3>
        <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2 lg:campaignbay-grid-cols-4 campaignbay-gap-4">
          <Select
            label={__("Log Type", "campaignbay")}
            value={filters.log_type}
            options={logTypeOptions}
            onChange={(value) => handleFilterChange("log_type", value)}
            conClassName="!campaignbay-items-stretch !campaignbay-p-0"
          />

          <Input
            label={__("Date From", "campaignbay")}
            value={filters.date_from}
            onChange={(value) => handleFilterChange("date_from", value)}
            type="date"
            conClassName="!campaignbay-items-stretch !campaignbay-p-0"
          />

          <Input
            label={__("Date To", "campaignbay")}
            value={filters.date_to}
            onChange={(value) => handleFilterChange("date_to", value)}
            type="date"
            conClassName="!campaignbay-items-stretch !campaignbay-p-0"
          />

          <Select
            label={__("Items per page", "campaignbay")}
            value={String(perPage)}
            options={perPageOptions}
            onChange={handlePerPageChange}
            conClassName="!campaignbay-items-stretch !campaignbay-p-0"
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="campaignbay-my-3 campaignbay-flex campaignbay-justify-between campaignbay-items-center">
        <div className="campaignbay-text-sm campaignbay-text-gray-600">
          {sprintf(
            _n(
              "Showing %d of %d log entry",
              "Showing %d of %d log entries",
              totalItems,
              "campaignbay"
            ),
            activityLogs.length,
            totalItems
          )}
        </div>
        <Button
          className="campaignbay-br-2"
          variant="secondary"
          onClick={() => fetchActivityLogs(currentPage)}
          isBusy={isLoading}
        >
          {__("Refresh", "campaignbay")}
        </Button>
      </div>

      {/* Activity Log Table */}
      <div className="campaignbay-border campaignbay-border-gray-200 campaignbay-rounded-[8px] campaignbay-overflow-hidden">
        <div className="campaignbay-overflow-x-auto">
          <table className="campaignbay-w-full campaignbay-text-sm">
            <thead className="campaignbay-bg-gray-50 campaignbay-border-b campaignbay-border-gray-200">
              <tr>
                {tableHeads.map((head) => (
                  <TableHead
                    key={head.value}
                    label={head.label}
                    isSortable={!!head.isSortable}
                    value={head.value}
                    onClick={() => handleSort(head.value)}
                  />
                ))}
              </tr>
            </thead>
            <tbody className="campaignbay-divide-y campaignbay-divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="campaignbay-px-[4px] campaignbay-py-[8px] campaignbay-text-center"
                  >
                    <Spinner />
                  </td>
                </tr>
              ) : activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <tr key={log.id} className="hover:campaignbay-bg-gray-50">
                    <td className="campaignbay-px-[4px] campaignbay-pl-[16px] campaignbay-py-3 campaignbay-text-gray-600">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="campaignbay-px-[4px] campaignbay-py-3">
                      <span
                        className="campaignbay-inline-flex campaignbay-px-2 campaignbay-py-1 campaignbay-text-xs campaignbay-font-medium campaignbay-rounded-full"
                        style={{
                          backgroundColor: getLogTypeColor(log.log_type) + "20",
                          color: getLogTypeColor(log.log_type),
                        }}
                      >
                        {getLogTypeLabel(log.log_type)}
                      </span>
                    </td>
                    <td className="campaignbay-px-[4px] campaignbay-py-3">
                      {log.campaign_id > 0 ? (
                        <a
                          href={"#/campaigns/" + log.campaign_id}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="campaignbay-text-blue-600 hover:campaignbay-text-blue-800 campaignbay-underline campaignbay-text-[14px] campaignbay-dashboard-campaigns-link"
                        >
                          {log.campaign_title || `Campaign #${log.campaign_id}`}
                        </a>
                      ) : (
                        <span className="campaignbay-text-gray-400">—</span>
                      )}
                    </td>
                    <td className="campaignbay-px-[4px] campaignbay-py-3">
                      {log.order_id > 0 ? (
                        <div>
                          <a
                            href={log.order_edit_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="campaignbay-text-blue-600 hover:campaignbay-text-blue-800 campaignbay-underline"
                          >
                            #{log.order_number || log.order_id}
                          </a>
                          {log.order_status && (
                            <div className="campaignbay-text-xs campaignbay-text-gray-500">
                              {getOrderStatusLabel(log.order_status)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="campaignbay-text-gray-400">—</span>
                      )}
                    </td>
                    <td className="campaignbay-px-[4px] campaignbay-py-3">
                      {log.user_name ? (
                        <div>
                          <div className="campaignbay-font-medium">
                            {log.user_name}
                          </div>
                          {log.user_email && (
                            <div className="campaignbay-text-xs campaignbay-text-gray-500">
                              {log.user_email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="campaignbay-text-gray-400">—</span>
                      )}
                    </td>
                    {/* Conditionally render financial columns */}
                    {shouldShowFinancialColumns() && (
                      <>
                        <td className="campaignbay-px-[4px] campaignbay-py-3 campaignbay-text-right campaignbay-font-mono">
                          {log.base_total > 0
                            ? formatCurrency(log.base_total)
                            : "—"}
                        </td>
                        <td className="campaignbay-px-[4px] campaignbay-py-3 campaignbay-text-right campaignbay-font-mono">
                          {log.total_discount > 0 ? (
                            <span className="campaignbay-text-green-600">
                              -{formatCurrency(log.total_discount)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="campaignbay-px-[4px] campaignbay-py-3 campaignbay-text-right campaignbay-font-mono campaignbay-font-medium">
                          {log.order_total > 0
                            ? formatCurrency(log.order_total)
                            : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="campaignbay-px-[4px] campaignbay-py-[8px] campaignbay-text-center campaignbay-text-gray-500"
                  >
                    {__(
                      "No activity logs found for the selected filters.",
                      "campaignbay"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="campaignbay-mt-[6px] campaignbay-flex campaignbay-justify-between campaignbay-items-center">
          <div className="campaignbay-text-sm campaignbay-text-gray-600">
            {sprintf(
              __("Page %d of %d", "campaignbay"),
              currentPage,
              totalPages
            )}
          </div>
          <div className="campaignbay-flex campaignbay-gap-1">
            {/* First Page */}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
              className="campaignbay-px-3 campaignbay-py-[1px]"
            >
              {__("First", "campaignbay")}
            </Button>

            {/* Previous Page */}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="campaignbay-px-3 campaignbay-py-[1px]"
            >
              {__("Previous", "campaignbay")}
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "primary" : "secondary"}
                onClick={() =>
                  typeof page === "number" ? handlePageChange(page) : null
                }
                disabled={page === "..."}
                className="campaignbay-px-3 campaignbay-py-[1px] campaignbay-min-w-[40px]"
              >
                {page}
              </Button>
            ))}

            {/* Next Page */}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="campaignbay-px-3 campaignbay-py-[1px] campaignbay-br-2"
            >
              {__("Next", "campaignbay")}
            </Button>

            {/* Last Page */}
            <Button
              variant="secondary"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="campaignbay-px-3 campaignbay-py-[1px] campaignbay-br-2"
            >
              {__("Last", "campaignbay")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ActivityLogModal;
