// types/index.ts

// ====================================================================
// Toast Notification Types
// ====================================================================
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

// ====================================================================
// Campaign and Tier Types
// ====================================================================
export type DiscountValueType = 'percentage' | 'fixed' | 'currency'; // Added 'currency' for clarity
export type CampaignStatus = 'active' | 'inactive' | 'scheduled' | 'expired';
export type CampaignType = 'quantity' | 'earlybird' | 'scheduled' | 'bogo';
export type TargetType = 'entire_store' | 'category' | 'product' | 'tag';

export interface QuantityTier {
  id: number;
  min: number | '';
  max: number | '';
  value: number | '';
  type: DiscountValueType;
}

export interface EarlyBirdTier {
  id: number;
  quantity: number | null;
  value: number | null;
  type: DiscountValueType;
  total: number;
}

export interface BogoTier {
  id: number;
  buy_product: number | null;
  get_product: number | null;
  buy_quantity: number;
  get_quantity: number;
}

export interface Campaign {
  id: number;
  title: string;
  status: CampaignStatus;
  type: CampaignType;
  discount_type: DiscountValueType;
  discount_value: number | null;
  target_type: TargetType;
  target_ids: number[];
  is_exclude: boolean;
  exclude_sale_items: boolean;
  schedule_enabled: boolean;
  start_datetime: string | undefined; // Using string as it comes from API/datetime-local input
  end_datetime: string | undefined;
  usage_limit: number | null;
  usage_count?: number; // Optional as it's not present on creation
  date_modified?: string; // Optional as it's not present on creation
  tiers: (QuantityTier | EarlyBirdTier | BogoTier)[];
}

// Used for API POST/PUT requests
export interface CampaignDataPayload extends Omit<Campaign, 'id' | 'usage_count' | 'date_modified'> {
  timezone_offset: string;
}


// ====================================================================
// Settings Types
// ====================================================================
export interface GlobalSettings {
  global_enableAddon: boolean;
  global_defaultPriority: number;
  global_calculationMode: 'after_tax' | 'before_tax';
  global_decimalPlaces: number;
  perf_enableCaching: boolean;
  debug_enableMode: boolean;
  debug_logLevel: string[];
}

export interface ProductSettings {
  product_showDiscountedPrice: boolean;
  product_messageFormat: string;
  product_enableQuantityTable: boolean;
  product_excludeSaleItems: boolean;
  product_priorityMethod: 'apply_highest' | 'apply_lowest';
}

export interface CartSettings {
  cart_allowWcCouponStacking: boolean;
  cart_allowCampaignStacking: boolean;
  cart_savedMessageFormat: string;
  cart_showNextDiscountBar: boolean;
  cart_nextDiscountFormat: string;
  cart_showDiscountBreakdown: boolean;
}

export interface PromotionSettings {
  promo_enableBar: boolean;
  promo_barPosition: 'top_of_page' | 'bottom_of_page';
  promo_barBgColor: string;
  promo_barTextColor: string;
  promo_barContent: string;
}

export interface AdvancedSettings {
  advanced_deleteAllOnUninstall: boolean;
  advanced_customCss: string;
  advanced_customJs: string;
}

// This represents the full settings object fetched from the API
export type PluginSettings = GlobalSettings &
  ProductSettings &
  CartSettings &
  PromotionSettings &
  AdvancedSettings;


// ====================================================================
// API and Store Types
// ====================================================================

// Structure of localized data from window.campaignbay_Localize
export interface WpSettings {
    dateFormat: string;
    timeFormat: string;
  }
export interface CbStoreValue {
  wpSettings: WpSettings;
  woocommerce_currency_symbol: string;
}

// For multiselect/select components
export interface SelectOption {
  label: string;
  value: number | string;
}

// Structure for API validation errors
export interface WPApiErrorDetails {
  [key: string]: {
    message: string;
    // You can add other properties if your API returns them
  };
}

// ====================================================================
// Dashboard Data Types
// ====================================================================
interface KpiValue {
  value: number;
  change?: number;
}

interface DashboardKpis {
  active_campaigns: KpiValue;
  total_discount_value: KpiValue;
  discounted_orders: KpiValue;
  sales_from_campaigns: KpiValue;
}

interface DiscountTrendItem {
  date: string;
  total_discount_value: string; // Comes as string from API
  total_base: string;
  total_sales: string;
}

interface TopCampaignItem {
  campaign_id: number;
  name: string;
  value: string; // Comes as string
}

interface MostImpactfulTypeItem {
  type: string;
  total_sales: string; // Comes as string
}

interface DashboardCharts {
  discount_trends: DiscountTrendItem[];
  top_campaigns: TopCampaignItem[];
  most_impactful_types: MostImpactfulTypeItem[];
}

interface LiveCampaign {
  id: number;
  title: string;
  type: CampaignType;
  end_date: string;
}

interface ScheduledCampaign {
  id: number;
  title: string;
  type: CampaignType;
  start_date: string;
}

interface LiveAndUpcoming {
  active: LiveCampaign[];
  scheduled: ScheduledCampaign[];
}

interface RecentActivity {
    timestamp: string;
    campaign_id: number;
    campaign_title: string;
    action: string;
    user: string;
}

export interface DashboardData {
  kpis: DashboardKpis;
  charts: DashboardCharts;
  live_and_upcoming: LiveAndUpcoming;
  recent_activity: RecentActivity[];
}