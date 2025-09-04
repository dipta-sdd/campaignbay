import { __, _n, sprintf } from "@wordpress/i18n";
import { useEffect, useState } from "@wordpress/element";
import apiFetch from "@wordpress/api-fetch";
import { addQueryArgs } from "@wordpress/url";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

import Navbar from "../components/Navbar";
import ActivityLogModal from "../components/ActivityLogModal";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("7days");
  const [chartType, setChartType] = useState("bar");
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = {
          period: selectedPeriod,
          _timestamp: Date.now(),
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
  }, [selectedPeriod]);

  if (loading) {
    return (
      <div className="cb-page">
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

  const formatTimeDifference = (
    dateString,
    futureTense = "in",
    pastTense = "ago"
  ) => {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);
    const now = new Date();

    // Get the difference in seconds
    const diffInSeconds = (date - now) / 1000;
    const absDiffInSeconds = Math.abs(diffInSeconds);
    const tense = diffInSeconds > 0 ? futureTense : pastTense;
    const tenseStart = diffInSeconds > 0 ? futureTense : "";
    const tenseEnd = diffInSeconds > 0 ? "" : pastTense;

    // Handle times less than a minute
    if (absDiffInSeconds < 60) {
      return diffInSeconds > 0
        ? __("Just now", "campaignbay")
        : __("A moment ago", "campaignbay");
    }

    // Handle times in minutes
    const diffInMinutes = Math.floor(absDiffInSeconds / 60);
    if (diffInMinutes < 60) {
      const value = sprintf(
        /* translators: %d: number of minutes. */
        _n("%d minute", "%d minutes", diffInMinutes, "campaignbay"),
        diffInMinutes
      );
      return `${tenseStart} ${value} ${tenseEnd}`;
    }

    // Handle times in hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      const value = sprintf(
        /* translators: %d: number of hours. */
        _n("%d hour", "%d hours", diffInHours, "campaignbay"),
        diffInHours
      );
      return `${tenseStart} ${value} ${tenseEnd}`;
    }

    // Handle times in days
    const diffInDays = Math.floor(diffInHours / 24);
    const value = sprintf(
      /* translators: %d: number of days. */
      _n("%d day", "%d days", diffInDays, "campaignbay"),
      diffInDays
    );
    return `${tenseStart} ${value} ${tenseEnd}`;
  };

  // Chart data preparation
  const getDiscountTrendsData = () => {
    if (!dashboardData?.charts?.discount_trends) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const data = dashboardData.charts.discount_trends;
    return {
      labels: data.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }),
      datasets: [
        {
          label: __("Discount Value ($)", "campaignbay"),
          data: data.map((item) => parseFloat(item.total_discount_value)),
          borderColor: "#183ad6",
          backgroundColor: "rgba(24, 58, 214, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#183ad6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: __("Orginal Order Value ($)", "campaignbay"),
          data: data.map((item) => parseFloat(item.total_base)),
          borderColor: "#ffc107",
          backgroundColor: "rgba(255, 193, 7, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: "#ffc107",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: __("Discounted Order Value ($)", "campaignbay"),
          data: data.map((item) => parseFloat(item.total_sales)),
          borderColor: "#28a745",
          backgroundColor: "rgba(40, 167, 69, 0.1)",
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: "#28a745",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  const getTopCampaignsData = () => {
    if (!dashboardData?.charts?.top_campaigns) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const data = dashboardData.charts.top_campaigns;
    const colors = [
      "#183ad6", // Primary blue
      "#28a745", // Green
      "#ffc107", // Yellow
      "#dc3545", // Red
      "#6f42c1", // Purple
    ];

    return {
      labels: data.map((item) => item.name || `Campaign ${item.campaign_id}`),
      datasets: [
        {
          data: data.map((item) => parseFloat(item.value)),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors
            .slice(0, data.length)
            .map((color) => color + "80"),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  };

  const getTopCampaignTypesData = () => {
    if (!dashboardData?.charts?.most_impactful_types) {
      return {
        labels: [],
        datasets: [],
      };
    }

    const data = dashboardData.charts.most_impactful_types;
    const colors = [
      "#183ad6", // Primary blue
      "#28a745", // Green
      "#ffc107", // Yellow
      "#dc3545", // Red
      "#6f42c1", // Purple
    ];

    return {
      labels: data.map((item) => item.campaign_type || "Unknown"),
      datasets: [
        {
          data: data.map((item) => parseFloat(item.total_sales)),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors
            .slice(0, data.length)
            .map((color) => color + "80"),
          borderWidth: 2,
          hoverOffset: 4,
        },
      ],
    };
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#183ad6",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Value: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#757575",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#e0e0e0",
          borderDash: [5, 5],
        },
        ticks: {
          color: "#757575",
          font: {
            size: 12,
          },
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#183ad6",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function (context) {
            return `Value: ${formatCurrency(context.parsed.y)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#757575",
          font: {
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: "#e0e0e0",
          borderDash: [5, 5],
        },
        ticks: {
          color: "#757575",
          font: {
            size: 12,
          },
          callback: function (value) {
            return formatCurrency(value);
          },
        },
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
          color: "#757575",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        borderColor: "#183ad6",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(
              context.parsed
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="cb-page campaignbay-dashboard">
      {/* Header Section */}
      <Navbar />
      <div className="cb-page-header-container">
        <div className="cb-page-header-title">
          {__("Dashboard", "campaignbay")}
        </div>
        <div className="cb-page-header-actions">
          <select
            className="wpab-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="7days">{__("Last 7 Days", "campaignbay")}</option>
            <option value="30days">{__("Last 30 Days", "campaignbay")}</option>
            <option value="1year">{__("Last 1 Year", "campaignbay")}</option>
          </select>
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
              {__("Active Campaigns", "campaignbay")}
            </div>
            <div className="cb-kpi-action">
              <a href="#/campaigns">
                {__("View All Campaigns", "campaignbay")}
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
              {__("Total Discounted Amount", "campaignbay")}
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
              {__("Discounted Orders", "campaignbay")}
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
              {__("Sales from Campaigns", "campaignbay")}
            </div>
            {dashboardData?.kpis?.sales_from_campaigns?.change !== 0 && (
              <div
                className={`cb-kpi-change ${
                  dashboardData?.kpis?.sales_from_campaigns?.change > 0
                    ? "positive"
                    : "negative"
                }`}
              >
                {dashboardData?.kpis?.sales_from_campaigns?.change > 0
                  ? "+"
                  : ""}
                {dashboardData?.kpis?.sales_from_campaigns?.change}% vs. prev
                period
              </div>
            )}
          </div>
        </div>
        <div className="campaignbay-grid campaignbay-grid-cols-12 campaignbay-gap-4 cb-charts-grid">
          <div className="cb-chart-card campaignbay-col-span-12">
            <div className="cb-chart-header">
              <h3>{__("Daily Discount Value Trends", "campaignbay")}</h3>

              <div className="cb-chart-header-actions">
                <div className="cb-chart-type-toggle">
                  <button
                    className={`cb-toggle-btn ${
                      chartType === "line" ? "active" : ""
                    }`}
                    onClick={() => setChartType("line")}
                    title={__("Line Chart", "campaignbay")}
                  >
                    {__("Line", "campaignbay")}
                  </button>
                  <button
                    className={`cb-toggle-btn ${
                      chartType === "bar" ? "active" : ""
                    }`}
                    onClick={() => setChartType("bar")}
                    title={__("Bar Chart", "campaignbay")}
                  >
                    {__("Bar", "campaignbay")}
                  </button>
                </div>
              </div>
            </div>
            <div className="cb-chart-container">
              {dashboardData?.charts?.discount_trends?.length > 0 ? (
                chartType === "line" ? (
                  <Line
                    data={getDiscountTrendsData()}
                    options={lineChartOptions}
                    height={220}
                  />
                ) : (
                  <Bar
                    data={getDiscountTrendsData()}
                    options={barChartOptions}
                    height={220}
                  />
                )
              ) : (
                <div className="cb-chart-placeholder">
                  <div className="cb-chart-message">
                    {__(
                      "No discount data available for the selected period",
                      "campaignbay"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="cb-chart-card campaignbay-col-span-12 lg:campaignbay-col-span-6">
            <div className="cb-chart-header">
              <h3>{__("Top Performing Campaigns", "campaignbay")}</h3>
            </div>
            <div className="cb-chart-container">
              {dashboardData?.charts?.top_campaigns?.length > 0 ? (
                <Doughnut
                  data={getTopCampaignsData()}
                  options={doughnutChartOptions}
                  height={220}
                />
              ) : (
                <div className="cb-chart-placeholder">
                  <div className="cb-chart-message">
                    {__(
                      "No campaign performance data available",
                      "campaignbay"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="cb-chart-card campaignbay-col-span-12 lg:campaignbay-col-span-6">
            <div className="cb-chart-header">
              <h3>{__("Top Performing Types", "campaignbay")}</h3>
            </div>
            <div className="cb-chart-container">
              {dashboardData?.charts?.most_impactful_types?.length > 0 ? (
                <Doughnut
                  data={getTopCampaignTypesData()}
                  options={doughnutChartOptions}
                  height={220}
                />
              ) : (
                <div className="cb-chart-placeholder">
                  <div className="cb-chart-message">
                    {__(
                      "No campaign performance data available",
                      "campaignbay"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cb-insights-flex">
          {/* Live Campaigns Section */}
          <div className="cb-insight-card">
            <h3>{__("Live Campaigns", "campaignbay")}</h3>

            <div className="cb-campaigns-section">
              <div className="cb-campaigns-table-container">
                <table className="campaignbay-table">
                  <thead>
                    <tr>
                      <th>{__("Campaign Name", "campaignbay")}</th>
                      <th>{__("Type", "campaignbay")}</th>
                      <th>{__("Ending Time", "campaignbay")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.live_and_upcoming?.active?.length > 0 ? (
                      dashboardData.live_and_upcoming.active.map((campaign) => (
                        <tr key={campaign.id}>
                          <td className="">
                            <a
                              href={`#/campaigns/${campaign.id}`}
                              className="campaignbay-dashboard-campaigns-link"
                            >
                              {campaign.title}
                            </a>
                          </td>
                          <td>
                            <span className="campaignbay-capitalize campaignbay-text-secondary">
                              {campaign.type || __("Standard", "campaignbay")}
                            </span>
                          </td>
                          <td>
                            {campaign.end_date ? (
                              <span className="cb-dashboard-timestamp campaignbay-capitalize">
                                {formatTimeDifference(campaign.end_date)}
                              </span>
                            ) : (
                              <span className="cb-dashboard-timestamp campaignbay-capitalize">
                                {__("No end date", "campaignbay")}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="cb-campaign-row empty">
                        <td colSpan="3" className="cb-no-campaigns">
                          {__("No active campaigns", "campaignbay")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Upcoming Campaigns Section */}
          <div className="cb-insight-card">
            <h3>{__("Upcoming Campaigns", "campaignbay")}</h3>

            <div className="cb-campaigns-section">
              <div className="cb-campaigns-table-container">
                <table className="campaignbay-table">
                  <thead>
                    <tr>
                      <th>{__("Campaign Name", "campaignbay")}</th>
                      <th>{__("Type", "campaignbay")}</th>
                      <th>{__("Starting Time", "campaignbay")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData?.live_and_upcoming?.scheduled?.length > 0 ? (
                      dashboardData.live_and_upcoming.scheduled.map(
                        (campaign) => (
                          <tr
                            key={campaign.id}
                            className="cb-campaign-row scheduled"
                          >
                            <td>
                              <a
                                href={`#/campaigns/${campaign.id}`}
                                className="campaignbay-dashboard-campaigns-link"
                              >
                                {campaign.title}
                              </a>
                            </td>
                            <td>
                              <span className="campaignbay-capitalize campaignbay-text-secondary">
                                {campaign.type || __("Standard", "campaignbay")}
                              </span>
                            </td>
                            <td>
                              {campaign.start_date ? (
                                <span className="cb-dashboard-timestamp campaignbay-capitalize">
                                  {formatTimeDifference(campaign.start_date)}
                                </span>
                              ) : (
                                <span className="cb-dashboard-timestamp campaignbay-capitalize">
                                  {__("No start date", "campaignbay")}
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      )
                    ) : (
                      <tr className="cb-campaign-row empty">
                        <td colSpan="3" className="cb-no-campaigns">
                          {__("No scheduled campaigns", "campaignbay")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="cb-insight-card">
            <h3>{__("Recent Activity", "campaignbay")}</h3>
            <div className="cb-activity-list">
              {dashboardData?.recent_activity
                ?.slice(0, 5)
                .map((activity, index) => (
                  <div key={index} className="cb-activity-item">
                    <div className="cb-dashboard-timestamp">
                      {formatTimeDifference(activity.timestamp)}
                    </div>
                    <div className="cb-activity-content">
                      <span className="cb-activity-campaign">
                        <a
                          href={`#/campaigns/${activity.campaign_id}`}
                          className="campaignbay-dashboard-campaigns-link"
                        >
                          {activity.campaign_title}
                        </a>
                      </span>
                      <span className="cb-activity-action">
                        {activity.action + " by " + activity.user}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
            <div className="cb-activity-footer">
              <button
                onClick={() => setIsActivityModalOpen(true)}
                className="cb-view-all-link"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "inherit",
                  textDecoration: "underline",
                }}
              >
                {__("View Full Activity Log", "campaignbay")}
              </button>
            </div>
          </div>
        </div>

        {/* Floating Help Button */}
        <div className="cb-floating-help">
          <button
            className="cb-help-button"
            title={__("Help & Documentation", "campaignbay")}
          >
            ?
          </button>
        </div>
      </div>

      {/* Activity Log Modal */}
      <ActivityLogModal
        isActivityModalOpen={isActivityModalOpen}
        setIsActivityModalOpen={setIsActivityModalOpen}
      />
    </div>
  );
};

export default Dashboard;
