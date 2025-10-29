// =====================================================================
//  SETTINGS TYPES (from previous request, included for completeness)
// =====================================================================

/**
 * Interface for the nested options within the discount pricing table.
 */
export interface DiscountTableOptionsType {
  show_header: boolean;
  title: {
    show: boolean;
    label: string;
  };
  range: {
    show: boolean;
    label: string;
  };
  discount: {
    show: boolean;
    label: string;
    content: 'price' | 'value';
  };
}

/**
 * Represents the complete settings object for the CampaignBay plugin.
 */
export interface CampaignBaySettingsType {
  global_enableAddon: boolean;
  global_calculate_discount_from: 'regular_price' | 'sale_price';
  position_to_show_bulk_table: string;
  position_to_show_discount_bar: string;
  perf_enableCaching: boolean;
  debug_enableMode: boolean;
  product_message_format_percentage: string;
  product_message_format_fixed: string;
  bogo_banner_message_format: string;
  product_priorityMethod: 'apply_highest' | 'apply_lowest' | 'apply_first';
  show_discount_table: boolean;
  product_enableQuantityTable: boolean;
  discount_table_options: DiscountTableOptionsType;
  cart_allowWcCouponStacking: boolean;
  cart_allowCampaignStacking: boolean;
  cart_quantity_message_format_percentage: string;
  cart_quantity_message_format_fixed: string;
  cart_bogo_message_format: string;
  cart_bogo_cart_message_format: string;
  advanced_deleteAllOnUninstall: boolean;
  advanced_customCss: string;
  advanced_customJs: string;
  _locale?: string;
}

// =====================================================================
//  NEW TYPES FOR THE MAIN LOCALIZED OBJECT
// =====================================================================

/**
 * Represents the white-label branding settings.
 */
export interface WhiteLabel {
  plugin_name: string;
  short_name: string;
  menu_label: string;
  custom_icon: string; // URL
  menu_icon: string;   // URL
  author_name: string;
  author_uri: string;  // URL
  support_uri: string; // URL
  docs_uri: string;    // URL
  position: number;
}

/**
 * Represents general WordPress settings passed to the app.
 */
export interface WpSettings {
  dateFormat: string;
  timeFormat: string;
}

/**
 * Represents the entire localized data object available to the frontend app.
 * This is the main type for `window.campaignbay_Localize`.
 */
export interface CbStore {
  version: string;
  root_id: string;
  nonce: string;
  store: string;
  rest_url: string;
  white_label: WhiteLabel;
  woocommerce_currency_symbol: string;
  wpSettings: WpSettings;
  campaignbay_settings: CampaignBaySettingsType;
}



export interface QuantityTier {
  id: number;
  min: number;
  max?: number| ''; 
  value?: number | ''; 
  type?: 'percentage' | 'currency';
}
export type QuantityTierError = Partial<Record<'min' | 'max' | 'value' | 'type', { message: string }>>;
export type QuantityTierErrorMap = Record<string | number, QuantityTierError>;

export interface EBTier {
  id: number | string;
  quantity: number | '';
  value: number | '';
  type: 'percentage' | 'currency';
  total: number; 
}
export type EBTierError = Partial<Record<'quantity' | 'value', { message: string }>>;
export type EBTierErrorMap = Record<string | number, EBTierError>;

export type CampaignType = 'scheduled' | 'earlybird' | 'quantity' | 'bogo';

export type ApplyAsType = "line_total" | "coupon" | "fee";
export type BogoMessageLocationType = "line_item_name" | "notice" | "dont_show";

export interface CampaignSettingsType {
  // scheduled & earlybird
  display_as_regular_price?: boolean;
  message_format?: string;

  // quantity
  enable_quantity_table?: boolean;
  apply_as?: ApplyAsType;
  cart_quantity_message_format?: string;

  // bogo
  auto_add_free_product?: boolean;
  bogo_banner_message_format?: string;
  cart_bogo_message_format?: string;
  bogo_cart_message_location?: BogoMessageLocationType;
}
export type CampaignSettingsErrorsType = Partial<Record<keyof CampaignSettingsType, { message: string }>>;