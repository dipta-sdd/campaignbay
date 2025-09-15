import { Target, TrendingUp, Clock, MoreVertical, Tag, Play, Square } from "lucide-react"
import Campaigns from "../pages/Campaigns"

interface Campaign {
  id: number
  title: string
  status: string
  type: string
  target_type: string
  discount_value: string
  start_datetime: string
  end_datetime: string
  usage_count: number
  date_modified: string
}

interface CampaignsGridProps {
  campaigns: Campaign[],
  formatDateTime: (x: string) => string
}

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "campaignbay-bg-green-100 campaignbay-text-green-800 campaignbay-border-green-200"
      case "inactive":
        return "campaignbay-bg-gray-100 campaignbay-text-gray-800 campaignbay-border-gray-200"
      case "scheduled":
        return "campaignbay-bg-yellow-100 campaignbay-text-yellow-800 campaignbay-border-yellow-200"
      default:
        return "campaignbay-bg-gray-100 campaignbay-text-gray-800 campaignbay-border-gray-200"
    }
  }

  return (
    <span
      className={`campaignbay-inline-flex campaignbay-items-center campaignbay-px-2.5 campaignbay-py-0.5 campaignbay-rounded-full campaignbay-text-xs campaignbay-font-medium campaignbay-border ${getStatusStyles(status)}`}
    >
      {status}
    </span>
  )
}

const UsageBadge = ({ usage_count }: { usage_count: number }) => {
  return (
    <span className="campaignbay-inline-flex campaignbay-items-center campaignbay-px-2 campaignbay-py-0.5 campaignbay-rounded-full campaignbay-text-xs campaignbay-font-medium campaignbay-bg-blue-50 campaignbay-text-blue-700 campaignbay-border campaignbay-border-blue-200">
      {usage_count}
    </span>
  )
}

export default function CampaignsGrid({ campaigns, formatDateTime }: CampaignsGridProps) {
  console.log(campaigns);
  return (
    <div className="campaignbay-grid campaignbay-grid-cols-1 md:campaignbay-grid-cols-2 lg:campaignbay-grid-cols-3 xl:campaignbay-grid-cols-4 campaignbay-gap-4">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="campaignbay-bg-white campaignbay-rounded-none campaignbay-border campaignbay-border-gray-200 campaignbay-p-[8px] hover:campaignbay-shadow-md campaignbay-transition-shadow campaignbay-duration-200"
        >
          {/* Header with title and status */}
          <div className="campaignbay-flex campaignbay-items-start campaignbay-justify-between campaignbay-mb-3">
            <div className="campaignbay-flex-1 campaignbay-min-w-0">
              <a href={`./${campaign.id}`} className="campaignbay-text-base campaignbay-font-semibold campaignbay-text-blue-600 hover:campaignbay-text-blue-800 campaignbay-cursor-pointer campaignbay-truncate">
                {campaign.title}
              </a>
            </div>
            <div className="campaignbay-ml-2 campaignbay-flex-shrink-0">
              <StatusBadge status={campaign.status} />
            </div>
          </div>

          {/* Campaign details with icons, no labels */}
          <div className="campaignbay-space-y-2">
            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <Tag className="campaignbay-w-[14px] campaignbay-h-[14px] campaignbay-text-gray-400" />
              <span className="campaignbay-text-sm campaignbay-text-gray-900">{campaign.type}</span>
            </div>

            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <Target className="campaignbay-w-[14px] campaignbay-h-[14px] campaignbay-text-gray-400" />
              <span className="campaignbay-text-sm campaignbay-text-gray-900">{campaign.target_type}</span>
            </div>

            <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
              <TrendingUp className="campaignbay-w-[14px] campaignbay-h-[14px] campaignbay-text-gray-400" />
              <span className="campaignbay-text-sm campaignbay-font-semibold campaignbay-text-gray-900">{campaign.discount_value}</span>
              <div className="campaignbay-ml-auto">
                <UsageBadge usage_count={campaign.usage_count} />
              </div>
            </div>
          </div>

          {/* Dates section - more compact */}
          <div className="campaignbay-mt-3 campaignbay-pt-3 campaignbay-border-t campaignbay-border-gray-100">
            <div className="campaignbay-space-y-1.5">


              {formatDateTime(campaign.start_datetime) !== "—" && (
                <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                  <Play className="campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-green-500 campaignbay-fill-green-500" />
                  <span className="campaignbay-text-xs campaignbay-text-gray-900">{formatDateTime(campaign.start_datetime)}</span>
                </div>
              )}

              {formatDateTime(campaign.end_datetime) !== "—" && (
                <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                  <Square className="campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-red-500 campaignbay-fill-red-500" />
                  <span className="campaignbay-text-xs campaignbay-text-gray-900">{formatDateTime(campaign.end_datetime)}</span>
                </div>
              )}

              {formatDateTime(campaign.date_modified) !== "—" && (
                <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                  <Clock className="campaignbay-w-3.5 campaignbay-h-3.5 campaignbay-text-gray-400" />
                  <span className="campaignbay-text-xs campaignbay-text-gray-500">{formatDateTime(campaign.date_modified)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="campaignbay-mt-3 campaignbay-flex campaignbay-justify-end">
            <button className="campaignbay-text-gray-400 hover:campaignbay-text-gray-600 campaignbay-transition-colors campaignbay-duration-200">
              <MoreVertical className="campaignbay-w-[14px] campaignbay-h-[14px]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
