import { __ } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import { Icon, plus } from "@wordpress/icons";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          period: "7days",
        };
        const response = await apiFetch({
          path: addQueryArgs("/campaignbay/v1/dashboard", params),
        });
        setDashboardData(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="wpab-cb-page">
        <div className="cb-dashboard-skeleton">
          <div className="cb-skeleton-header"></div>
          <div className="cb-skeleton-kpis">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="cb-skeleton-kpi-card"></div>
            ))}
          </div>
          <div className="cb-skeleton-charts">
            <div className="cb-skeleton-chart-left"></div>
            <div className="cb-skeleton-chart-right"></div>
          </div>
          <div className="cb-skeleton-insights">
            <div className="cb-skeleton-insight-left"></div>
            <div className="cb-skeleton-insight-right"></div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-US").format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="cb-page campaignbay-dashboard">
      {/* Header Section */}
      <div className="cb-page-header-container">
        <div className="cb-page-header-title">
          {__("Dashboard", "campaignbay")}
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
        {/* KPIs Section */}
        <div className="cb-kpis-grid">
          <div className="cb-kpi-card">
            <div className="cb-kpi-value">
              {dashboardData?.kpis?.active_campaigns?.value || 0}
            </div>
            <div className="cb-kpi-label">
              {__("Active Campaigns", "wpab-cb-bay-boilerplate")}
            </div>
            <div className="cb-kpi-action">
              <a href="#">
                {__("View All Campaigns", "wpab-cb-bay-boilerplate")}
              </a>
            </div>
          </div>

          <div className="cb-kpi-card">
            <div className="cb-kpi-value">
              {formatCurrency(
                dashboardData?.kpis?.total_discount_value?.value || 0
              )}
            </div>
            <div className="cb-kpi-label">
              {__("Total Discount Value", "wpab-cb-bay-boilerplate")}
            </div>
            <div className="cb-kpi-subtitle">
              {__("Last 30 Days", "wpab-cb-bay-boilerplate")}
            </div>
            {dashboardData?.kpis?.total_discount_value?.change !== 0 && (
              <div
                className={`cb-kpi-change ${
                  dashboardData?.kpis?.total_discount_value?.change > 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {dashboardData?.kpis?.total_discount_value?.change > 0
                  ? "+"
                  : ""}
                {dashboardData?.kpis?.total_discount_value?.change}% vs. prev
                period
              </div>
            )}
          </div>

          <div className="cb-kpi-card">
            <div className="cb-kpi-value">
              {formatNumber(dashboardData?.kpis?.discounted_orders?.value || 0)}
            </div>
            <div className="cb-kpi-label">
              {__("Discounted Orders", "wpab-cb-bay-boilerplate")}
            </div>
            <div className="cb-kpi-subtitle">
              {__("Last 30 Days", "wpab-cb-bay-boilerplate")}
            </div>
            {dashboardData?.kpis?.discounted_orders?.change !== 0 && (
              <div
                className={`cb-kpi-change ${
                  dashboardData?.kpis?.discounted_orders?.change > 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {dashboardData?.kpis?.discounted_orders?.change > 0 ? "+" : ""}
                {dashboardData?.kpis?.discounted_orders?.change}% vs. prev
                period
              </div>
            )}
          </div>

          <div className="cb-kpi-card">
            <div className="cb-kpi-value">
              {formatCurrency(
                dashboardData?.kpis?.sales_from_campaigns?.value || 0
              )}
            </div>
            <div className="cb-kpi-label">
              {__("Sales from Campaigns", "wpab-cb-bay-boilerplate")}
            </div>
            <div className="cb-kpi-subtitle">
              {__("Last 30 Days", "wpab-cb-bay-boilerplate")}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="cb-charts-grid">
          <div className="cb-chart-card">
            <div className="cb-chart-header">
              <h3>{__("Discount Value Trends", "wpab-cb-bay-boilerplate")}</h3>
              <select className="cb-period-selector">
                <option value="7">
                  {__("Last 7 Days", "wpab-cb-bay-boilerplate")}
                </option>
                <option value="30">
                  {__("Last 30 Days", "wpab-cb-bay-boilerplate")}
                </option>
                <option value="90">
                  {__("Last 90 Days", "wpab-cb-bay-boilerplate")}
                </option>
              </select>
            </div>
            <div className="cb-chart-placeholder">
              <div className="cb-chart-message">
                {__(
                  "Line Chart showing discount value over time",
                  "wpab-cb-bay-boilerplate"
                )}
                <br />
                <small>
                  {__(
                    "X-axis: Date, Y-axis: Discount Value ($)",
                    "wpab-cb-bay-boilerplate"
                  )}
                </small>
              </div>
            </div>
          </div>

          <div className="cb-chart-card">
            <div className="cb-chart-header">
              <h3>{__("Most Impactful Types", "wpab-cb-bay-boilerplate")}</h3>
            </div>
            <div className="cb-chart-placeholder">
              <div className="cb-chart-message">
                {__(
                  "Pie Chart showing sales by type",
                  "wpab-cb-bay-boilerplate"
                )}
                <br />
                <small>
                  {__("Quantity: 55%", "wpab-cb-bay-boilerplate")}
                  <br />
                  {__("Scheduled: 35%", "wpab-cb-bay-boilerplate")}
                  <br />
                  {__("Early Bird: 10%", "wpab-cb-bay-boilerplate")}
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div className="cb-insights-grid">
          <div className="cb-insight-card">
            <h3>
              {__("Live & Upcoming Campaigns", "wpab-cb-bay-boilerplate")}
            </h3>

            <div className="cb-campaign-group">
              <h4 className="cb-campaign-group-title">
                {__("CURRENTLY ACTIVE", "wpab-cb-bay-boilerplate")}
              </h4>
              {dashboardData?.live_and_upcoming?.active?.map((campaign) => (
                <div key={campaign.id} className="cb-campaign-item active">
                  <div className="cb-campaign-info">
                    <span className="cb-campaign-title">{campaign.title}</span>
                    {campaign.end_date && (
                      <span className="cb-campaign-date">
                        {__("Ends in", "wpab-cb-bay-boilerplate")}{" "}
                        {getTimeAgo(campaign.end_date)}
                      </span>
                    )}
                  </div>
                  <div className="cb-campaign-toggle">
                    <input
                      type="checkbox"
                      className="wpab-dashboard-toggle"
                      defaultChecked
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="cb-campaign-group">
              <h4 className="cb-campaign-group-title">
                {__("STARTING SOON", "wpab-cb-bay-boilerplate")}
              </h4>
              {dashboardData?.live_and_upcoming?.scheduled?.map((campaign) => (
                <div key={campaign.id} className="cb-campaign-item scheduled">
                  <div className="cb-campaign-info">
                    <span className="cb-campaign-title">{campaign.title}</span>
                    {campaign.start_date && (
                      <span className="cb-campaign-date">
                        {__("Starts in", "wpab-cb-bay-boilerplate")}{" "}
                        {getTimeAgo(campaign.start_date)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cb-insight-card">
            <h3>{__("Recent Activity", "wpab-cb-bay-boilerplate")}</h3>
            <div className="cb-activity-list">
              {dashboardData?.recent_activity
                ?.slice(0, 5)
                .map((activity, index) => (
                  <div key={index} className="cb-activity-item">
                    <div className="cb-activity-timestamp">
                      {getTimeAgo(activity.timestamp)}
                    </div>
                    <div className="cb-activity-content">
                      <span className="cb-activity-campaign">
                        {activity.campaign_title}
                      </span>
                      <span className="cb-activity-action">
                        {activity.action}
                      </span>
                      <span className="cb-activity-user">
                        by {activity.user}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="cb-activity-footer">
              <a href="#" className="cb-view-all-link">
                {__("View Full Activity Log", "wpab-cb-bay-boilerplate")}
              </a>
            </div>
          </div>
        </div>

        {/* Floating Help Button */}
        <div className="cb-floating-help">
          <button
            className="cb-help-button"
            title={__("Help & Documentation", "wpab-cb-bay-boilerplate")}
          >
            ?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
