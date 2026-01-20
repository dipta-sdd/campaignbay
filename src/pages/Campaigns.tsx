import { Dispatch, FC, SetStateAction, useEffect, useState } from "react";
import Page from "../components/common/Page";
import HeaderContainer from "../components/common/HeaderContainer";
import Header from "../components/common/Header";
import Button from "../components/common/Button";
import {
  arrowDown,
  arrowUp,
  blockTable,
  closeSmall,
  cog,
  copy,
  download,
  edit,
  funnel,
  Icon,
  moreVertical,
  next,
  previous,
  search,
  trash,
} from "@wordpress/icons";
import { Popover } from "../components/common/Popover";
import { Campaign, TargetType } from "../utils/types";
import { Checkbox } from "../components/common/Checkbox";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { useToast } from "../store/toast/use-toast";
import { __, _n } from "@wordpress/i18n";
import { getCampaignTypeText } from "./Dashboard";
import { formatDate } from "../utils/Dates";
import CustomSelect from "../components/common/CustomSelect";
import { Toggler } from "../components/common/Toggler";
import { ListSelect } from "../components/common/ListSelect";

interface TableHeader {
  key: string;
  label: string;
  sortable: boolean;
}
interface Filters {
  types: string[];
  status: string[];
  sort: string;
  order: "asc" | "desc";
  page: number;
  limit: number;
}

const headers: TableHeader[] = [
  { key: "title", label: "Title", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "type", label: "Type", sortable: true },
  { key: "target", label: "Target", sortable: false },
  { key: "duration", label: "Duration", sortable: false },
];
const Campaigns: FC = () => {
  const { addToast } = useToast();

  const [filters, setFilters] = useState<Filters>({
    types: [],
    status: [],
    sort: "title",
    order: "asc",
    page: 1,
    limit: 10,
  });

  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "title",
    "status",
    "type",
    "target",
    "duration",
  ]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCampaigns(campaigns.map((campaign) => campaign.id));
    } else {
      setSelectedCampaigns([]);
    }
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const queryParams = {
        page: filters.page,
        per_page: filters.limit,
        orderby: filters.sort,
        order: filters.order,
        search: searchQuery,
        status: filters.status,
        type: filters.types,
        _timestamp: Date.now(),
      };
      const response: any = await apiFetch({
        path: addQueryArgs("/campaignbay/v1/campaigns", queryParams),
        method: "GET",
        parse: false,
      });

      setTotalPages(response?.headers?.get("x-wp-totalpages"));
      // setTotalItems(response?.headers?.get("x-wp-total"));
      setCampaigns(await response.json());
    } catch (error) {
      addToast(__("Error fetching campaigns.", "campaignbay"), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filters, searchQuery]);

  const deleteCampaigns = async (ids: number[]) => {
    setLoading(true);
    try {
      await apiFetch({
        path: `/campaignbay/v1/campaigns/bulk`,
        method: "DELETE",
        data: {
          ids: ids,
        },
      });
      addToast(
        _n(
          "Campaign deleted successfully",
          "Campaigns deleted successfully",
          ids.length,
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
          ids.length,
          "campaignbay"
        ),
        "error"
      );
    }
  };

  const duplicateCampaign = async (id: number) => {
    setLoading(true);
    try {
      await apiFetch({
        path: `/campaignbay/v1/campaigns/${id}/duplicate`,
        method: "POST",
      });
      addToast(
        __("Campaign duplicated successfully", "campaignbay"),
        "success"
      );
      fetchCampaigns();
    } catch (error) {
      addToast(__("Error duplicating campaign", "campaignbay"), "error");
    }
  };

  return (
    <Page>
      <HeaderContainer className="campaignbay-py-[12px]">
        <Header> Campaigns </Header>
        <div className="campaignbay-flex campaignbay-gap-2 campaignbay-justify-end campaignbay-items-center">
          <Button size="small" variant="outline" color="primary">
            Import <Icon icon={arrowDown} size={20} fill="currentColor" />
          </Button>
          <Button size="small" variant="outline" color="primary">
            Export <Icon icon={arrowUp} size={20} fill="currentColor" />
          </Button>
        </div>
      </HeaderContainer>
      {/* main body */}
      <div className="campaignbay-bg-white campaignbay-rounded-[8px] campaignbay-shadow-sm">
        {/* serach and filter */}
        <div className="campaignbay-p-[24px] campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-between campaignbay-px-[48px]">
          <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-center campaignbay-gap-[12px]  campaignbay-w-full">
            {/* right */}
            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[8px]">
              <label className="campaignbay-relative">
                <input
                  placeholder="search"
                  className="campaignbay-w-[200px] campaignbay-text-default campaignbay-py-[5px] campaignbay-px-[8px] campaignbay-pr-[24px] campaignbay-border campaignbay-rounded-[0] campaignbay-bg-secondary campaignbay-border-1 campaignbay-border-secondary hover:campaignbay-border-primary focus:campaignbay-border-primary focus:campaignbay-outline-none"
                ></input>
                <Icon
                  icon={search}
                  size={20}
                  fill="currentColor"
                  className="campaignbay-text-gray-400 campaignbay-absolute campaignbay-top-[50%] campaignbay-right-[5px] campaignbay-transform campaignbay-translate-y-[-50%]"
                />
              </label>
              {/* filter triger */}
              <Button
                size="small"
                variant="outline"
                color="primary"
                className="!campaignbay-px-[4px] campaignbay-relative"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Icon icon={funnel} size={20} fill="currentColor" />
                {/* badge */}
                <span className="campaignbay-block campaignbay-w-[12px] campaignbay-h-[12px] campaignbay-bg-primary campaignbay-text-white campaignbay-rounded-full campaignbay-absolute campaignbay-top-0 campaignbay-right-0 campaignbay-transform campaignbay-translate-y-[-30%] campaignbay-translate-x-[25%] campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-[9px]">
                  1
                </span>
              </Button>
            </div>
            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-end campaignbay-gap-[4px]">
              {/* left */}
              <Button
                size="small"
                variant="ghost"
                color="primary"
                className="!campaignbay-px-[4px] campaignbay-text-[#1e1e1e]"
              >
                <Icon icon={blockTable} size={20} fill="currentColor" />
              </Button>

              <Popover
                align="right"
                trigger={
                  <Button
                    size="small"
                    variant="ghost"
                    color="primary"
                    className="!campaignbay-px-[4px] campaignbay-text-[#1e1e1e]"
                  >
                    <Icon icon={cog} size={20} fill="currentColor" />
                  </Button>
                }
                content={
                  <PopoverContent
                    filters={filters}
                    setFilters={setFilters}
                    visibleColumns={visibleColumns}
                    setVisibleColumns={setVisibleColumns}
                  />
                }
              />
            </div>
          </div>
          {/* filters */}
          {filterOpen ? (
            <FiltersAccordion filters={filters} setFilters={setFilters} />
          ) : null}
        </div>
        {/* table */}
        <div className="campaignbay-w-full">
          <Table
            campaigns={campaigns}
            visibleColumns={visibleColumns}
            selectedCampaigns={selectedCampaigns}
            setSelectedCampaigns={setSelectedCampaigns}
            handleSelectAll={handleSelectAll}
            filters={filters}
            setFilters={setFilters}
            handleDelete={deleteCampaigns}
            handleDuplicate={duplicateCampaign}
          />
        </div>
        <Pagination
          totalPages={totalPages}
          totalItems={campaigns.length || 0}
          filters={filters}
          setFilters={setFilters}
          selectedCampaigns={selectedCampaigns}
          setSelectedCampaigns={setSelectedCampaigns}
          handleSelectAll={handleSelectAll}
          handleDelete={deleteCampaigns}
        />
      </div>
    </Page>
  );
};

export default Campaigns;

interface PopoverContentProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  visibleColumns: string[];
  setVisibleColumns: Dispatch<SetStateAction<string[]>>;
}
const PopoverContent = ({
  filters,
  setFilters,
  visibleColumns,
  setVisibleColumns,
}: PopoverContentProps) => {
  const handleVisibleColumnsChange = (value: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };
  return (
    <div className="campaignbay-w-full campaignbay-p-3">
      <div className="campaignbay-grid campaignbay-grid-cols-2 campaignbay-gap-2">
        {/* row 1 */}
        {/* sort by */}
        <div>
          <CustomSelect
            label="Sort by"
            border="campaignbay-border-[#e0e0e0]"
            classNames={{
              container: "!campaignbay-rounded-[8px]",
              label:
                "campaignbay-uppercase campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e]",
            }}
            options={headers
              .filter((header) => header.sortable)
              .map((header) => ({ value: header.key, label: header.label }))}
            value={filters.sort}
            onChange={(value) =>
              setFilters({ ...filters, sort: value as string })
            }
          />
        </div>
        {/* order */}
        <div className="campaignbay-flex campaignbay-items-start campaignbay-justify-between campaignbay-flex-col">
          <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-pb-[4px] campaignbay-uppercase">
            Order
          </span>
          <Toggler
            classNames={{
              button:
                "campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-py-[7px]",
            }}
            options={[
              { value: "asc", label: "Ascending" },
              { value: "desc", label: "Descending" },
            ]}
            value={filters.order}
            onChange={(value) =>
              setFilters({ ...filters, order: value as "asc" | "desc" })
            }
          />
        </div>
        {/* row 2 */}
        {/* item per page */}
        <div className="campaignbay-flex campaignbay-items-start campaignbay-justify-between campaignbay-flex-col campaignbay-col-span-2">
          <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-pb-[4px] campaignbay-uppercase">
            Item per page
          </span>
          <Toggler
            classNames={{
              root: "campaignbay-w-full",
              button:
                "campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-py-[7px]",
            }}
            options={[
              { value: "10", label: "10" },
              { value: "25", label: "25" },
              { value: "50", label: "50" },
              { value: "100", label: "100" },
            ]}
            value={filters.limit}
            onChange={(value) =>
              setFilters({ ...filters, limit: value as number })
            }
          />
        </div>
        {/* row 3 */}
        {/* visible columns */}
        <div className="campaignbay-flex campaignbay-items-start campaignbay-justify-between campaignbay-flex-col campaignbay-col-span-2">
          <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-pb-[4px] campaignbay-uppercase">
            Properties
          </span>
          <ListSelect
            classNames={{
              root: "campaignbay-w-full",
              item: "campaignbay-p-1",
              label: "campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-py-[7px]",
            }}
            items={headers.map((header) => ({
              value: header.key,
              label: header.label,
            }))}
            selectedValues={visibleColumns}
            onChange={(value) => handleVisibleColumnsChange(value)}
          />
        </div>
      </div>
    </div>
  );
};

const FiltersAccordion = ({
  filters,
  setFilters,
}: {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
}) => {
  return (
    <div className="campaignbay-w-full">
      <h2>Filters</h2>
    </div>
  );
};

interface TableProps {
  campaigns: Campaign[];
  visibleColumns: string[];
  selectedCampaigns: number[];
  setSelectedCampaigns: Dispatch<SetStateAction<number[]>>;
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  handleSelectAll: (checked: boolean) => void;
  handleDuplicate: (id: number) => void;
  handleDelete: (ids: number[]) => void;
}
const Table = ({
  campaigns,
  visibleColumns,
  selectedCampaigns,
  setSelectedCampaigns,
  filters,
  setFilters,
  handleSelectAll,
  handleDuplicate,
  handleDelete,
}: TableProps) => {
  const handleSortChange = (header: string) => {
    if (filters.sort === header) {
      setFilters({
        ...filters,
        order: filters.order === "asc" ? "desc" : "asc",
      });
    } else {
      setFilters({
        ...filters,
        sort: header,
        order: "asc",
      });
    }
  };
  const renderHeaderRow = () => {
    return visibleColumns.map((header) => {
      const head: TableHeader | undefined = headers.find(
        (h: TableHeader) => h.key === header
      );
      return (
        <th
          key={header}
          className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#1e1e1e] campaignbay-uppercase campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0]"
        >
          {head?.sortable ? (
            <button
              className="campaignbay-flex campaignbay-items-center campaignbay-justify-start campaignbay-w-full campaignbay-p-0 campaignbay-m-0 campaignbay-uppercase "
              onClick={() => handleSortChange(header)}
            >
              <span>{head?.label}</span>
              {filters.sort === header ? (
                filters.order === "asc" ? (
                  <Icon icon={arrowUp} size={14} fill="currentColor" />
                ) : (
                  <Icon icon={arrowDown} size={14} fill="currentColor" />
                )
              ) : null}
            </button>
          ) : (
            head?.label
          )}
        </th>
      );
    });
  };

  const handleCheckboxChange = (checked: boolean, id: number) => {
    if (checked) {
      setSelectedCampaigns([...selectedCampaigns, id]);
    } else {
      setSelectedCampaigns(
        selectedCampaigns.filter((campaignId) => campaignId !== id)
      );
    }
  };

  const renderRow = (campaign: Campaign) => {
    return (
      <tr className="">
        <td className="campaignbay-pl-[40px] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-w-[42px]">
          <Checkbox
            checked={selectedCampaigns.includes(campaign.id)}
            onChange={(checked) => handleCheckboxChange(checked, campaign.id)}
          />
        </td>
        {visibleColumns.map((header) => {
          return renderColumn(campaign, header);
        })}
        <td className="campaignbay-text-right campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-pr-[32px] campaignbay-text-[#1e1e1e] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0]">
          <ActionMenu
            id={campaign.id}
            handleDuplicate={handleDuplicate}
            handleDelete={handleDelete}
          />
        </td>
      </tr>
    );
  };

  const renderColumn = (campaign: Campaign, header: string) => {
    switch (header) {
      case "title":
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#1e1e1e] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] ">
            {campaign.title}
          </td>
        );
      case "status":
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#1e1e1e] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-whitespace-nowrap">
            <span
              className={`campaignbay-inline-block campaignbay-py-[5px] campaignbay-px-[10px] campaignbay-rounded-full campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-uppercase ${
                campaign.status === "active" || campaign.status === "scheduled"
                  ? "campaignbay-bg-[#4ab866] campaignbay-text-white"
                  : "campaignbay-bg-[#060606] campaignbay-text-[#fff]"
              }`}
            >
              {campaign.status === "active" || campaign.status === "scheduled"
                ? "Active"
                : "Inactive"}
            </span>
          </td>
        );
      case "type":
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#1e1e1e] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-whitespace-nowrap">
            {getCampaignTypeText(campaign.type)}
          </td>
        );
      case "target":
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#757575] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-whitespace-nowrap">
            {getTargetType(campaign.target_type)}
          </td>
        );
      case "duration":
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#757575] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-whitespace-nowrap">
            {campaign.schedule_enabled
              ? `${formatDate(
                  campaign?.start_datetime_unix ?? campaign.date_created_unix
                )} - ${formatDate(campaign?.end_datetime_unix)}`
              : "--"}
          </td>
        );
      case "usage":
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#757575] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-whitespace-nowrap">
            {campaign.usage_count || 0} / {campaign.usage_limit ?? "∞"}
          </td>
        );
      default:
        return (
          <td className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-text-[#1e1e1e] campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0] campaignbay-whitespace-nowrap">
            {" "}
            --{" "}
          </td>
        );
    }
  };

  return (
    <div className="campaignbay-w-full campaignbay-overflow-x-auto">
      <table className="campaignbay-w-full">
        <thead>
          <tr>
            <th className="campaignbay-text-left campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-pl-[40px]  campaignbay-text-[#1e1e1e] campaignbay-uppercase campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0]">
              <Checkbox
                checked={selectedCampaigns.length === campaigns.length}
                onChange={(checked) => handleSelectAll(checked)}
              />
            </th>
            {renderHeaderRow()}
            <th className="campaignbay-text-right campaignbay-font-[11px] campaignbay-leading-[16px] campaignbay-px-[8px] campaignbay-py-[12px] campaignbay-pr-[32px] campaignbay-text-[#1e1e1e] campaignbay-uppercase campaignbay-border-b-[1px] campaignbay-border-[#e0e0e0]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            return renderRow(campaign);
          })}
        </tbody>
      </table>
    </div>
  );
};

const ActionMenu = ({
  id,
  handleDuplicate,
  handleDelete,
}: {
  id: number;
  handleDuplicate: (id: number) => void;
  handleDelete: (ids: number[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-end campaignbay-gap-[4px] campaignbay-min-w-[141px]">
      <div
        className={`campaignbay-gap-[4px] campaignbay-transition-all campaignbay-duration-200 ${
          isOpen
            ? "campaignbay-flex campaignbay-items-center"
            : "campaignbay-hidden"
        }`}
      >
        <Button variant="ghost" size="small" className="!campaignbay-p-[4px]">
          <Icon icon={edit} />
        </Button>
        <Button
          variant="ghost"
          size="small"
          className="!campaignbay-p-[4px]"
          onClick={() => handleDelete([id])}
        >
          <Icon icon={trash} />
        </Button>

        <Button
          variant="ghost"
          size="small"
          className="!campaignbay-p-[4px]"
          onClick={() => handleDuplicate(id)}
        >
          <Icon icon={copy} />
        </Button>
      </div>
      <Button
        variant="ghost"
        size="small"
        className="!campaignbay-p-[4px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon icon={moreVertical} />
      </Button>
    </div>
  );
};

const getTargetType = (target_type: TargetType) => {
  if (target_type === "product") {
    return "Selected Products";
  }
  if (target_type === "category") {
    return "Selected Categories";
  }
  if (target_type === "entire_store") {
    return "All Products";
  }
  return "--";
};

interface PaginationProps {
  filters: Filters;
  setFilters: Dispatch<SetStateAction<Filters>>;
  totalPages: number;
  totalItems: number;
  selectedCampaigns: number[];
  setSelectedCampaigns: Dispatch<SetStateAction<number[]>>;
  handleSelectAll: (checked: boolean) => void;
  handleDelete: (ids: number[]) => void;
}
const Pagination = ({
  totalPages,
  totalItems,
  filters,
  setFilters,
  selectedCampaigns,
  setSelectedCampaigns,
  handleSelectAll,
  handleDelete,
}: PaginationProps) => {
  return (
    // pagination container
    <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-px-[40px] campaignbay-py-[12px]">
      {/* left -  */}
      <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[8px]">
        <Checkbox
          checked={selectedCampaigns.length === totalItems}
          onChange={(checked) => handleSelectAll(checked)}
        />
        <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-uppercase">
          {selectedCampaigns.length} Item Selected
        </span>
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[4px]">
          <Button
            variant="ghost"
            size="small"
            className="!campaignbay-p-[4px]"
            disabled={selectedCampaigns.length === 0}
            onClick={() => handleDelete(selectedCampaigns)}
          >
            <Icon icon={trash} />
          </Button>
          <Button
            variant="ghost"
            size="small"
            className="!campaignbay-p-[4px]"
            disabled={selectedCampaigns.length === 0}
          >
            <Icon icon={download} />
          </Button>
          <Button
            variant="ghost"
            size="small"
            className="!campaignbay-p-[4px]"
            onClick={() => setSelectedCampaigns([])}
            disabled={selectedCampaigns.length === 0}
          >
            <Icon icon={closeSmall} />
          </Button>
        </div>
      </div>
      {/* right -  */}
      <div className="campaignbay-flex campaignbay-nowrap campaignbay-items-center campaignbay-justify-end campaignbay-gap-[8px]">
        <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-uppercase">
          page{" "}
        </span>
        <CustomSelect
          classNames={{
            container: "!campaignbay-px-0",
          }}
          differentDropdownWidth
          border="campaignbay-border-none"
          options={Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page) => ({
              value: page,
              label: page.toString(),
            })
          )}
          value={filters.page}
          onChange={(value) =>
            setFilters({ ...filters, page: parseInt(value as string) })
          }
        />

        <span className="campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-text-[#1e1e1e] campaignbay-uppercase campaignbay-text-nowrap">
          of {totalPages}
        </span>
        <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[4px]">
          <Button
            variant="ghost"
            size="small"
            className="!campaignbay-p-[4px]"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            <Icon icon={previous} />
          </Button>
          <Button
            variant="ghost"
            size="small"
            className="!campaignbay-p-[4px]"
            // @ts-ignore
            disabled={filters.page === parseInt(totalPages)}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            <Icon icon={next} />
          </Button>
        </div>
      </div>
    </div>
  );
};
