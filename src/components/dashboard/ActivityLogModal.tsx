import {
  useState,
  useEffect,
  useCallback,
  FC,
  Dispatch,
  SetStateAction,
  ReactNode,
} from "react";
import { __, _n, sprintf } from "@wordpress/i18n";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { Icon, chevronUp, chevronDown } from "@wordpress/icons";

// New components
import CustomModal from "../common/CustomModal";
import Button from "../common/Button";
import Select from "../common/Select";
import { Input } from "../common/Input";

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

  // Filter states
  const [filters, setFilters] = useState<Filters>({
    log_type: "activity",
    date_from: "",
    date_to: "",
  });

  const logTypeOptions = [
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
        },
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
    [perPage, filters, orderby, order],
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
      activity: "#6f42c1",
      sale: "#28a745",
      campaign_created: "#007cba",
      campaign_updated: "#ffc107",
      campaign_deleted: "#6c757d",
    };
    return colors[logType] || "#6c757d";
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("...");
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

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
        <th className="campaignbay-text-left campaignbay-px-[12px] campaignbay-py-[12px] campaignbay-text-[12px] campaignbay-font-bold campaignbay-text-gray-700 campaignbay-uppercase campaignbay-whitespace-nowrap">
          <span
            className="campaignbay-flex campaignbay-items-center campaignbay-gap-[4px] campaignbay-cursor-pointer hover:campaignbay-text-primary"
            onClick={onClick}
          >
            {label}
            <SortIndicator value={value} />
          </span>
        </th>
      );
    }
    return (
      <th className="campaignbay-text-left campaignbay-px-[12px] campaignbay-py-[12px] campaignbay-text-[12px] campaignbay-font-bold campaignbay-text-gray-700 campaignbay-uppercase campaignbay-whitespace-nowrap">
        {label}
      </th>
    );
  };

  const SortIndicator: FC<{ value: string }> = ({ value }) => {
    if (orderby !== value) {
      return null;
    }
    return (
      <Icon
        className="campaignbay-w-[16px] campaignbay-h-[16px]"
        icon={order === "asc" ? chevronUp : chevronDown}
        fill="currentColor"
      />
    );
  };

  if (!isActivityModalOpen) {
    return null;
  }

  const tableHeads = getTableHeads();
  const colSpan = tableHeads.length;

  return (
    <CustomModal
      isOpen={isActivityModalOpen}
      onClose={closeModal}
      title={__("Activity Log", "campaignbay")}
      maxWidth="campaignbay-max-w-[1200px]"
      className="campaignbay-max-h-[90vh]"
      classNames={{
        body: "campaignbay-p-[24px] campaignbay-overflow-y-auto",
      }}
    >
      {/* Filters Section */}
      <div className="campaignbay-mb-[16px] campaignbay-p-[16px] campaignbay-bg-gray-50 campaignbay-rounded-[8px] campaignbay-border campaignbay-border-gray-200">
        <h3 className="campaignbay-text-[14px] campaignbay-font-bold campaignbay-text-[#1e1e1e] campaignbay-mb-[12px]">
          {__("Filters", "campaignbay")}
        </h3>
        <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2 lg:campaignbay-grid-cols-4 campaignbay-gap-[12px]">
          <Select
            label={__("Log Type", "campaignbay")}
            value={filters.log_type}
            options={logTypeOptions}
            onChange={(value) => handleFilterChange("log_type", String(value))}
            classNames={{
              label:
                "!campaignbay-text-[12px] !campaignbay-font-bold !campaignbay-text-gray-700 !campaignbay-uppercase",
            }}
          />

          <Input
            label={__("Date From", "campaignbay")}
            value={filters.date_from}
            onChange={(e) => handleFilterChange("date_from", e.target.value)}
            type="date"
            size="small"
            classNames={{
              input: "!campaignbay-py-[6px] ",
              label:
                "!campaignbay-text-[12px] !campaignbay-font-bold !campaignbay-text-gray-700 !campaignbay-uppercase !campaignbay-mb-[4px]",
            }}
          />

          <Input
            label={__("Date To", "campaignbay")}
            value={filters.date_to}
            onChange={(e) => handleFilterChange("date_to", e.target.value)}
            type="date"
            size="small"
            classNames={{
              input: "!campaignbay-py-[6px] ",
              label:
                "!campaignbay-text-[12px] !campaignbay-font-bold !campaignbay-text-gray-700 !campaignbay-uppercase !campaignbay-mb-[4px]",
            }}
          />

          <Select
            label={__("Items per page", "campaignbay")}
            value={perPage}
            options={perPageOptions}
            onChange={handlePerPageChange}
            classNames={{
              label:
                "!campaignbay-text-[12px] !campaignbay-font-bold !campaignbay-text-gray-700 !campaignbay-uppercase",
            }}
          />
        </div>
      </div>

      {/* Results Summary */}
      <div className="campaignbay-mb-[12px] campaignbay-flex campaignbay-justify-between campaignbay-items-center">
        <div className="campaignbay-text-[13px] campaignbay-text-gray-600">
          {sprintf(
            _n(
              "Showing %d of %d log entry",
              "Showing %d of %d log entries",
              totalItems,
              "campaignbay",
            ),
            activityLogs.length,
            totalItems,
          )}
        </div>
        <Button
          variant="outline"
          size="small"
          onClick={() => fetchActivityLogs(currentPage)}
          disabled={isLoading}
        >
          {isLoading
            ? __("Loading...", "campaignbay")
            : __("Refresh", "campaignbay")}
        </Button>
      </div>

      {/* Activity Log Table */}
      <div className="campaignbay-border campaignbay-border-gray-200 campaignbay-rounded-[8px] campaignbay-overflow-hidden campaignbay-bg-white">
        <div className="campaignbay-overflow-x-auto">
          <table className="campaignbay-w-full campaignbay-text-[13px]">
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
            <tbody className="campaignbay-divide-y campaignbay-divide-gray-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={colSpan}
                    className="campaignbay-px-[12px] campaignbay-py-[32px] campaignbay-text-center"
                  >
                    <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-gap-[8px]">
                      <div className="campaignbay-w-[20px] campaignbay-h-[20px] campaignbay-border-2 campaignbay-border-primary campaignbay-border-t-transparent campaignbay-rounded-full campaignbay-animate-spin" />
                      <span className="campaignbay-text-gray-500">
                        {__("Loading...", "campaignbay")}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:campaignbay-bg-gray-50 campaignbay-transition-colors"
                  >
                    <td className="campaignbay-px-[12px] campaignbay-py-[12px] campaignbay-text-gray-600 campaignbay-whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>
                    <td className="campaignbay-px-[12px] campaignbay-py-[12px]">
                      <span
                        className="campaignbay-inline-flex campaignbay-px-[8px] campaignbay-py-[4px] campaignbay-text-[11px] campaignbay-font-bold campaignbay-rounded-full"
                        style={{
                          backgroundColor: getLogTypeColor(log.log_type) + "20",
                          color: getLogTypeColor(log.log_type),
                        }}
                      >
                        {getLogTypeLabel(log.log_type)}
                      </span>
                    </td>
                    <td className="campaignbay-px-[12px] campaignbay-py-[12px]">
                      {log.campaign_id > 0 ? (
                        <a
                          href={"#/campaigns/" + log.campaign_id}
                          className="campaignbay-text-primary hover:campaignbay-text-primary-hovered campaignbay-underline campaignbay-font-medium"
                        >
                          {log.campaign_title || `Campaign #${log.campaign_id}`}
                        </a>
                      ) : (
                        <span className="campaignbay-text-gray-400">—</span>
                      )}
                    </td>
                    <td className="campaignbay-px-[12px] campaignbay-py-[12px]">
                      {log.order_id > 0 ? (
                        <div>
                          <a
                            href={log.order_edit_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="campaignbay-text-primary hover:campaignbay-text-primary-hovered campaignbay-underline"
                          >
                            #{log.order_number || log.order_id}
                          </a>
                          {log.order_status && (
                            <div className="campaignbay-text-[11px] campaignbay-text-gray-500 campaignbay-mt-[2px]">
                              {getOrderStatusLabel(log.order_status)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="campaignbay-text-gray-400">—</span>
                      )}
                    </td>
                    <td className="campaignbay-px-[12px] campaignbay-py-[12px]">
                      {log.user_name ? (
                        <div>
                          <div className="campaignbay-font-medium campaignbay-text-[#1e1e1e]">
                            {log.user_name}
                          </div>
                          {log.user_email && (
                            <div className="campaignbay-text-[11px] campaignbay-text-gray-500 campaignbay-mt-[2px]">
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
                        <td className="campaignbay-px-[12px] campaignbay-py-[12px] campaignbay-text-right campaignbay-font-mono campaignbay-text-[#1e1e1e]">
                          {log.base_total > 0
                            ? formatCurrency(log.base_total)
                            : "—"}
                        </td>
                        <td className="campaignbay-px-[12px] campaignbay-py-[12px] campaignbay-text-right campaignbay-font-mono">
                          {log.total_discount > 0 ? (
                            <span className="campaignbay-text-green-600 campaignbay-font-medium">
                              -{formatCurrency(log.total_discount)}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="campaignbay-px-[12px] campaignbay-py-[12px] campaignbay-text-right campaignbay-font-mono campaignbay-font-bold campaignbay-text-[#1e1e1e]">
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
                    className="campaignbay-px-[12px] campaignbay-py-[32px] campaignbay-text-center campaignbay-text-gray-500"
                  >
                    {__(
                      "No activity logs found for the selected filters.",
                      "campaignbay",
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
        <div className="campaignbay-mt-[16px] campaignbay-flex campaignbay-justify-between campaignbay-items-center">
          <div className="campaignbay-text-[13px] campaignbay-text-gray-600">
            {sprintf(
              __("Page %d of %d", "campaignbay"),
              currentPage,
              totalPages,
            )}
          </div>
          <div className="campaignbay-flex campaignbay-gap-[4px]">
            {/* First Page */}
            <Button
              variant="outline"
              size="small"
              color="secondary"
              onClick={() => handlePageChange(1)}
              disabled={currentPage <= 1}
            >
              {__("First", "campaignbay")}
            </Button>

            {/* Previous Page */}
            <Button
              variant="outline"
              size="small"
              color="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              {__("Previous", "campaignbay")}
            </Button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <Button
                key={index}
                variant={page === currentPage ? "solid" : "outline"}
                size="small"
                color={page === currentPage ? "primary" : "secondary"}
                onClick={() =>
                  typeof page === "number" ? handlePageChange(page) : undefined
                }
                disabled={page === "..."}
                className="campaignbay-min-w-[40px]"
              >
                {page}
              </Button>
            ))}

            {/* Next Page */}
            <Button
              variant="outline"
              size="small"
              color="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              {__("Next", "campaignbay")}
            </Button>

            {/* Last Page */}
            <Button
              variant="outline"
              size="small"
              color="secondary"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
            >
              {__("Last", "campaignbay")}
            </Button>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

export default ActivityLogModal;
