import React, { useMemo } from "react";
import { Campaign } from "../old/types";

export interface Template {
  id: string;
  title: string;
  description: string;
  svg?: React.ReactNode;
  best_for: string;
  campaign_data: Campaign;
  example: {
    text: string;
    list: string[];
  };
  markdown: string;
}

const templates: Template[] = [
  {
    id: "flash_sale_20",
    title: "Flash Sale Madness",
    description: "Urgent 20% off storewide for 24 hours.",
    best_for: "Creating quick revenue and traffic.",
    example: {
      text: "Urgent 20% off storewide for 24 hours.",
      list: [
        "20% Storewide Discount.",
        "Scheduled (User sets the short timeframe).",
        // "Countdown timer ready (if enabled in settings).",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15.6358 3.9519C16.2453 3.34241 17.072 3 17.9339 3H25.7519C27.5469 3 29.0019 4.45507 29.0019 6.25V14.068C29.0019 14.93 28.6595 15.7566 28.05 16.3661L16.37 28.0461C15.1008 29.3153 13.043 29.3153 11.7738 28.0461L3.95581 20.2281C2.68661 18.9589 2.6866 16.9011 3.95581 15.6319L15.6358 3.9519ZM23 11C24.1046 11 25 10.1046 25 9C25 7.89543 24.1046 7 23 7C21.8954 7 21 7.89543 21 9C21 10.1046 21.8954 11 23 11Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Flash Sale",
      status: "active",
      type: "scheduled",
      discount_type: "percentage",
      discount_value: 20,
      tiers: [],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: true,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        display_as_regular_price: false,
        message_format: "FLASH SALE: {percentage_off} OFF!",
      },
    },
    markdown:
      "**Best For:** Creating quick revenue and traffic.\n**Description:** Urgent 20% off storewide for 24 hours.\n**Key Features:**\n\n- **20% Storewide Discount**.\n- **Scheduled** (User sets the short timeframe).\n- **Countdown timer** ready (if enabled in settings).",
  },
  {
    id: "bogo_standard",
    title: "Buy One Get One Free (BOGO)",
    description: "Buy 1, Get 1 Free",
    best_for: "Moving stock and increasing order value.",
    example: {
      text: "Buy 1, Get 1 Free",
      list: [
        "Buy 1, Get 1 logic.",
        "Applies to Entire Store.",
        "Great for high-margin items.",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1.603 10V2.72727H6.41834V3.99503H3.14064V5.72798H6.09874V6.99574H3.14064V10H1.603ZM9.25261 10V2.72727H12.1219C12.6712 2.72727 13.1399 2.82552 13.5282 3.02202C13.9188 3.21615 14.2159 3.49195 14.4195 3.84943C14.6255 4.20455 14.7285 4.6224 14.7285 5.10298C14.7285 5.58594 14.6243 6.00142 14.416 6.34943C14.2076 6.69508 13.9058 6.96023 13.5104 7.14489C13.1174 7.32955 12.6416 7.42188 12.0829 7.42188H10.1617V6.18608H11.8343C12.1278 6.18608 12.3717 6.14583 12.5658 6.06534C12.7599 5.98485 12.9044 5.86411 12.9991 5.70312C13.0961 5.54214 13.1447 5.34209 13.1447 5.10298C13.1447 4.86151 13.0961 4.65791 12.9991 4.49219C12.9044 4.32647 12.7588 4.20099 12.5623 4.11577C12.3681 4.02817 12.1231 3.98438 11.8272 3.98438H10.7903V10H9.25261ZM13.1802 6.69034L14.9877 10H13.2903L11.5218 6.69034H13.1802ZM17.6151 10V2.72727H22.5157V3.99503H19.1528V5.72798H22.2635V6.99574H19.1528V8.73224H22.5299V10H17.6151ZM25.5382 10V2.72727H30.4387V3.99503H27.0758V5.72798H30.1866V6.99574H27.0758V8.73224H30.4529V10H25.5382Z"
          fill="currentColor"
        />
        <path
          d="M4.03556 18.4893L10.6472 21.3215L8 22.456L1.42681 19.6389C1.57461 19.4875 1.75562 19.3662 1.96153 19.287L4.03556 18.4893ZM5.37369 17.9746L6.92306 17.3787C7.61627 17.1121 8.38373 17.1121 9.07694 17.3787L14.0385 19.287C14.2444 19.3662 14.4254 19.4875 14.5732 19.6389L11.9167 20.7774L5.37369 17.9746ZM14.9935 20.5468L8.5 23.3297V30.7797C8.6958 30.7466 8.88909 30.6939 9.07694 30.6217L14.0385 28.7134C14.6178 28.4906 15 27.934 15 27.3134V20.687C15 20.6398 14.9978 20.5931 14.9935 20.5468ZM7.5 30.7797V23.3297L1.00653 20.5468C1.0022 20.5931 1 20.6398 1 20.687V27.3134C1 27.934 1.38224 28.4906 1.96153 28.7134L6.92306 30.6217C7.11091 30.6939 7.3042 30.7466 7.5 30.7797Z"
          fill="currentColor"
        />
        <path
          d="M20.0356 18.4893L26.6472 21.3215L24 22.456L17.4268 19.6389C17.5746 19.4875 17.7556 19.3662 17.9615 19.287L20.0356 18.4893ZM21.3737 17.9746L22.9231 17.3787C23.6163 17.1121 24.3837 17.1121 25.0769 17.3787L30.0385 19.287C30.2444 19.3662 30.4254 19.4875 30.5732 19.6389L27.9167 20.7774L21.3737 17.9746ZM30.9935 20.5468L24.5 23.3297V30.7797C24.6958 30.7466 24.8891 30.6939 25.0769 30.6217L30.0385 28.7134C30.6178 28.4906 31 27.934 31 27.3134V20.687C31 20.6398 30.9978 20.5931 30.9935 20.5468ZM23.5 30.7797V23.3297L17.0065 20.5468C17.0022 20.5931 17 20.6398 17 20.687V27.3134C17 27.934 17.3822 28.4906 17.9615 28.7134L22.9231 30.6217C23.1109 30.6939 23.3042 30.7466 23.5 30.7797Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Buy 1 Get 1 Free",
      status: "active",
      type: "bogo",
      discount_type: "percentage",
      discount_value: null,
      tiers: [
        {
          id: 1,
          buy_quantity: 1,
          get_quantity: 1,
        },
      ],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: true,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        show_bogo_message: true,
        bogo_banner_message_format: "Buy 1 Get 1 Free!",
      },
    },
    markdown:
      "**Best For:** Moving stock and increasing order value.\n**Description:** Buy 1, Get 1 Free on specific products.\n**Key Features:**\n\n- **Buy 1, Get 1** logic.\n- Applies to **Specific Products**.\n- Great for high-margin items.",
  },
  {
    id: "bulk_saver_quantity",
    title: "Bulk Purchase Saver",
    description: "Buy 5+ items, get 10% off. Bulk savings.",
    best_for: "Wholesalers or bulk purchases.",
    example: {
      text: "Buy 5+ items, get 10% off. Bulk savings.",
      list: [
        "Quantity Based.",
        "Tier: Buy 1-10, Get 10% Off.",
        "Applies Storewide.",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.28571 6.57132C2.28571 4.83557 3.69281 3.42847 5.42856 3.42847H18.5714C20.3072 3.42847 21.7143 4.83557 21.7143 6.57132V7.9999H24.2738C25.4841 7.9999 26.5869 8.69489 27.109 9.78675L29.4067 14.5909C29.6092 15.0143 29.7143 15.4776 29.7143 15.9469V23.1428C29.7143 24.8785 28.3072 26.2856 26.5714 26.2856H23.9595C23.6822 28.2241 22.0151 29.7142 20 29.7142C17.9849 29.7142 16.3178 28.2241 16.0405 26.2856H13.6738C13.3965 28.2241 11.7294 29.7142 9.71428 29.7142C7.69915 29.7142 6.03206 28.2241 5.75478 26.2856H5.42856C3.69281 26.2856 2.28571 24.8785 2.28571 23.1428V6.57132ZM17.7863 26.2856C18.04 27.2715 18.9349 27.9999 20 27.9999C21.065 27.9999 21.96 27.2715 22.2137 26.2856C22.2607 26.103 22.2857 25.9115 22.2857 25.7142C22.2857 24.4518 21.2624 23.4285 20 23.4285C18.7376 23.4285 17.7143 24.4518 17.7143 25.7142C17.7143 25.9115 17.7393 26.103 17.7863 26.2856ZM9.71428 27.9999C10.7793 27.9999 11.6742 27.2715 11.928 26.2856C11.975 26.103 12 25.9115 12 25.7142C12 24.4518 10.9766 23.4285 9.71428 23.4285C8.45191 23.4285 7.42856 24.4518 7.42856 25.7142C7.42856 25.9115 7.45356 26.103 7.50057 26.2856C7.75431 27.2715 8.64923 27.9999 9.71428 27.9999ZM28 20.5713H26C25.5266 20.5713 25.1428 20.9551 25.1428 21.4285C25.1428 21.9019 25.5266 22.2856 26 22.2856H28V20.5713ZM21.7143 14.857H27.6337L25.5625 10.5264C25.3252 10.0301 24.8239 9.71418 24.2738 9.71418H21.7143V14.857Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Bulk Saver - Buy More Save More",
      status: "active",
      type: "quantity",
      discount_type: "percentage",
      discount_value: null,
      tiers: [
        {
          id: 1,
          min: 1,
          max: 10,
          value: 10,
          type: "percentage",
        },
        {
          id: 2,
          min: 11,
          max: 20,
          value: 15,
          type: "percentage",
        },
        {
          id: 3,
          min: 21,
          max: 30,
          value: 20,
          type: "percentage",
        },
      ],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: false,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        enable_quantity_table: true,
        apply_as: "line_total",
      },
    },
    markdown:
      "**Best For:** Wholesalers or bulk purchases.\n**Description:** Buy 5+ items, get 10% off. Bulk savings.\n**Key Features:**\n\n- **Quantity Based**.\n- **Tier:** Buy 5-10, Get 10% Off.\n- Applies to **Specific Categories** or Storewide.",
  },
  {
    id: "early_bird_special",
    title: "Early Bird Pre-order",
    description: "First 50 buyers get 15% off new item.",
    best_for: "Launching new products with revenue.",
    example: {
      text: "First 50 buyers get 15% off new item.",
      list: [
        "EarlyBird Type.",
        "Limited to first 50 units.",
        "15% Discount.",
        "Applies to Specific Products (New Arrivals).",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.05996 17.6C8.94635 17.0931 8.8864 16.566 8.8864 16.0248C8.8864 12.0648 12.0967 8.85451 16.0567 8.85451C20.0168 8.85451 23.2271 12.0648 23.2271 16.0248C23.2271 16.566 23.1671 17.0931 23.0535 17.6H28C28.4418 17.6 28.8 17.9581 28.8 18.4C28.8 18.8418 28.4418 19.2 28 19.2H4C3.55817 19.2 3.2 18.8418 3.2 18.4C3.2 17.9581 3.55817 17.6 4 17.6H9.05996ZM16.216 28.8C16.1594 28.8126 16.1006 28.8193 16.0402 28.8193C15.9798 28.8193 15.921 28.8126 15.8644 28.8H16.216ZM8.12194 7.01039L8.01114 6.91782C7.69935 6.70183 7.26827 6.73269 6.99057 7.01039C6.67815 7.32281 6.67815 7.82934 6.99057 8.14176L8.36387 9.51507L8.47467 9.60764C8.78645 9.82363 9.21753 9.79277 9.49524 9.51507C9.80766 9.20265 9.80766 8.69612 9.49524 8.3837L8.12194 7.01039ZM25.1818 8.03097C25.3978 7.71918 25.3669 7.2881 25.0892 7.01039C24.7768 6.69797 24.2703 6.69797 23.9578 7.01039L22.5845 8.3837L22.492 8.49449C22.276 8.80628 22.3068 9.23736 22.5845 9.51507C22.897 9.82749 23.4035 9.82749 23.7159 9.51507L25.0892 8.14176L25.1818 8.03097ZM16.8326 3.89521C16.7648 3.52201 16.4382 3.23901 16.0455 3.23901C15.6036 3.23901 15.2455 3.59719 15.2455 4.03901V5.98116L15.2584 6.12496C15.3261 6.49816 15.6527 6.78116 16.0455 6.78116C16.4873 6.78116 16.8455 6.42298 16.8455 5.98116V4.03901L16.8326 3.89521ZM13.6 25.6C13.1582 25.6 12.8 25.9581 12.8 26.4C12.8 26.8418 13.1582 27.2 13.6 27.2H18.4C18.8418 27.2 19.2 26.8418 19.2 26.4C19.2 25.9581 18.8418 25.6 18.4 25.6H13.6ZM8 22.4C8 21.9581 8.35817 21.6 8.8 21.6H23.2C23.6418 21.6 24 21.9581 24 22.4C24 22.8418 23.6418 23.2 23.2 23.2H8.8C8.35817 23.2 8 22.8418 8 22.4Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Early Bird Special",
      status: "active",
      type: "earlybird",
      discount_type: "percentage",
      discount_value: null,
      tiers: [
        {
          id: 1,
          quantity: 50,
          value: 15,
          type: "percentage",
          total: 50,
        },
      ],
      target_type: "product",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: false,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: 50,
      conditions: { match_type: "all", rules: [] },
      settings: {
        message_format:
          "Early Bird: Get {discount_value} Off! before stock runs out",
      },
    },
    markdown:
      "**Best For:** Launching new products with revenue.\n**Description:** First 50 buyers get 15% off new item.\n**Key Features:**\n\n- **EarlyBird Type**.\n- **Limited to first 50 units**.\n- **15% Discount**.\n- Applies to **Specific Products** (New Arrivals).",
  },
  {
    id: "weekend_special_fixed",
    title: "Weekend Special",
    description: "Get $5.00 off specific items this weekend.",
    best_for: "Boosting sales during slow weekends.",
    example: {
      text: "Get $5.00 off storewide this weekend.",
      list: [
        "Fixed Amount ($5.00) discount.",
        // "Category based target.",
        "Encourages small impulse buys.",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.80003 8.00008C3.41772 4.95709 6.10806 2.66675 9.33334 2.66675H22.6667C25.892 2.66675 28.5823 4.95709 29.2 8.00008H2.80003ZM2.66667 10.6667V22.6667C2.66667 26.3486 5.65144 29.3334 9.33334 29.3334H22.6667C26.3486 29.3334 29.3333 26.3486 29.3333 22.6667V10.6667H2.66667ZM8.00001 14.6667C8.00001 13.9304 8.59696 13.3334 9.33334 13.3334C10.0697 13.3334 10.6667 13.9304 10.6667 14.6667C10.6667 15.4031 10.0697 16.0001 9.33334 16.0001C8.59696 16.0001 8.00001 15.4031 8.00001 14.6667ZM8.00001 20.0001C8.00001 19.2637 8.59696 18.6667 9.33334 18.6667C10.0697 18.6667 10.6667 19.2637 10.6667 20.0001C10.6667 20.7365 10.0697 21.3334 9.33334 21.3334C8.59696 21.3334 8.00001 20.7365 8.00001 20.0001ZM14.6667 13.3334C15.4031 13.3334 16 13.9304 16 14.6667C16 15.4031 15.4031 16.0001 14.6667 16.0001C13.9303 16.0001 13.3333 15.4031 13.3333 14.6667C13.3333 13.9304 13.9303 13.3334 14.6667 13.3334ZM13.3333 20.0001C13.3333 19.2637 13.9303 18.6667 14.6667 18.6667C15.4031 18.6667 16 19.2637 16 20.0001C16 20.7365 15.4031 21.3334 14.6667 21.3334C13.9303 21.3334 13.3333 20.7365 13.3333 20.0001ZM20 13.3334C20.7364 13.3334 21.3333 13.9304 21.3333 14.6667C21.3333 15.4031 20.7364 16.0001 20 16.0001C19.2636 16.0001 18.6667 15.4031 18.6667 14.6667C18.6667 13.9304 19.2636 13.3334 20 13.3334Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Weekend Blast - $5 Off",
      status: "active",
      type: "scheduled",
      discount_type: "fixed",
      discount_value: 5,
      tiers: [],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: true,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        display_as_regular_price: false,
        message_format: "Weekend Special: Save {amount_off} now!",
      },
    },
    markdown:
      "**Best For:** Boosting sales during slow weekends.\n**Description:** Get $5.00 off specific items this weekend.\n**Key Features:**\n\n- **Fixed Amount ($5.00)** discount.\n- **Category based** target.\n- Encourages small impulse buys.",
  },
  {
    id: "clearance_sale_30_off",
    title: "Stock Clearance Sale",
    description: "Clear stocks with 30% off storewide.",
    best_for: "Clearing out old inventory anytime.",
    example: {
      text: "Clear stocks with 30% off storewide.",
      list: [
        "30% Percentage Discount.",
        "Applies Storewide.",
        "Scheduled for immediate activation.",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.1305 5.26787C10.5059 4.64411 9.49408 4.64411 8.86943 5.26787L5.50415 8.62832C5.05332 9.07851 4.79999 9.68948 4.79999 10.3266V24.8C4.79999 26.1255 5.8745 27.2 7.19999 27.2H11.2V21.6C11.2 21.1582 11.5582 20.8 12 20.8H15.2V10.3266C15.2 9.68948 14.9467 9.07851 14.4958 8.62832L11.1305 5.26787ZM16.8 10.3266V20.8H20C20.4418 20.8 20.8 21.1582 20.8 21.6V27.2H24.8C26.1255 27.2 27.2 26.1255 27.2 24.8V10.3266C27.2 9.68948 26.9467 9.07851 26.4958 8.62832L23.1305 5.26787C22.5059 4.64411 21.4941 4.64411 20.8694 5.26787L17.5041 8.62832C17.0533 9.07851 16.8 9.68948 16.8 10.3266ZM16.8 22.4V27.2H19.2V22.4H16.8ZM15.2 27.2V22.4H12.8V27.2H15.2ZM11.2 12.4C11.2 13.0628 10.6627 13.6 9.99999 13.6C9.33725 13.6 8.79999 13.0628 8.79999 12.4C8.79999 11.7373 9.33725 11.2 9.99999 11.2C10.6627 11.2 11.2 11.7373 11.2 12.4ZM9.99999 18.4C9.33725 18.4 8.79999 17.8628 8.79999 17.2C8.79999 16.5373 9.33725 16 9.99999 16C10.6627 16 11.2 16.5373 11.2 17.2C11.2 17.8628 10.6627 18.4 9.99999 18.4ZM23.2 12.4C23.2 13.0628 22.6627 13.6 22 13.6C21.3372 13.6 20.8 13.0628 20.8 12.4C20.8 11.7373 21.3372 11.2 22 11.2C22.6627 11.2 23.2 11.7373 23.2 12.4ZM22 18.4C21.3372 18.4 20.8 17.8628 20.8 17.2C20.8 16.5373 21.3372 16 22 16C22.6627 16 23.2 16.5373 23.2 17.2C23.2 17.8628 22.6627 18.4 22 18.4Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Clearance Sale - 30% Off",
      status: "active",
      type: "scheduled",
      discount_type: "percentage",
      discount_value: 30,
      tiers: [],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: false,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        display_as_regular_price: false,
        message_format: "Clearance Sale: {amount_off} Off",
      },
    },
    markdown:
      "**Best For:** Clearing out old inventory anytime.\n**Description:** Clear stocks with 30% off specific categories.\n**Key Features:**\n\n- **30% Percentage Discount**.\n- Applies to **Specific Categories**.\n- **Scheduled** for immediate activation.",
  },
  {
    id: "tiered_spender_quantity",
    title: "Tiered Spender (Quantity)",
    description: "Buy 2 get 5%, Buy 5 get 15% off. Tiered deal.",
    best_for: "Incentivizing incremental purchases.",
    example: {
      text: "Buy 2 get 5%, Buy 5 get 15% off. Tiered deal.",
      list: [
        "Multi-Tier Quantity Discount.",
        "Tier 1: Buy 2, Get 5% Off.",
        "Tier 2: Buy 5, Get 15% Off.",
        "Entire Store.",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.4 8.00005C6.4 6.23274 7.83269 4.80005 9.6 4.80005H20.8C22.5673 4.80005 24 6.23274 24 8.00005V19.2H28.8V22.4C28.8 25.051 26.651 27.2 24 27.2H16V20C16 18.9551 15.3322 18.0661 14.4 17.7366V17.6C14.4 17.039 14.3038 16.5005 14.1269 16H18.4C18.8418 16 19.2 15.6419 19.2 15.2C19.2 14.7582 18.8418 14.4 18.4 14.4H13.1778C12.2989 13.418 11.0216 12.8 9.6 12.8C9.04048 12.8 8.50146 12.8964 8 13.0737C7.49854 12.8964 6.95952 12.8 6.4 12.8V8.00005ZM24 25.6C25.7673 25.6 27.2 24.1674 27.2 22.4V20.8H24V25.6ZM12 9.60005C11.5582 9.60005 11.2 9.95822 11.2 10.4C11.2 10.8419 11.5582 11.2 12 11.2H18.4C18.8418 11.2 19.2 10.8419 19.2 10.4C19.2 9.95822 18.8418 9.60005 18.4 9.60005H12ZM6.4 14.4C6.98286 14.4 7.52932 14.5559 8 14.8282C8.47068 14.5559 9.01714 14.4 9.6 14.4C11.3673 14.4 12.8 15.8327 12.8 17.6V19.2H13.6C14.0418 19.2 14.4 19.5582 14.4 20V27.2C14.4 28.9674 12.9673 30.4 11.2 30.4H4.8C3.03269 30.4 1.6 28.9674 1.6 27.2V20C1.6 19.5582 1.95817 19.2 2.4 19.2H3.2V17.6C3.2 15.8327 4.63269 14.4 6.4 14.4ZM8 19.2V17.6C8 16.7164 7.28365 16 6.4 16C5.51634 16 4.8 16.7164 4.8 17.6V19.2H8ZM9.20039 16.0504C9.45501 16.5095 9.6 17.0378 9.6 17.6V19.2H11.2V17.6C11.2 16.7164 10.4837 16 9.6 16C9.46202 16 9.32812 16.0175 9.20039 16.0504Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Spend More Save More",
      status: "active",
      type: "quantity",
      discount_type: "percentage",
      discount_value: null,
      tiers: [
        {
          id: 1,
          min: 2,
          max: 4,
          value: 5,
          type: "percentage",
        },
        {
          id: 2,
          min: 5,
          max: 20,
          value: 15,
          type: "percentage",
        },
      ],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: false,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        enable_quantity_table: true,
        apply_as: "line_total",
      },
    },
    markdown:
      "**Best For:** Incentivizing incremental purchases.\n**Description:** Buy 2 get 5%, Buy 5 get 15% off. Tiered deal.\n**Key Features:**\n\n- **Multi-Tier Quantity Discount**.\n- **Tier 1:** Buy 2, Get 5% Off.\n- **Tier 2:** Buy 5, Get 15% Off.\n- **Entire Store**.",
  },
  {
    id: "bogo_buy_3_get_1",
    title: "Buy 3 Get 1 Free (BOGO)",
    description: "Buy 3 items, get the 4th one free.",
    best_for: "Clearing inventory and significantly increasing cart size.",
    example: {
      text: "Buy 3 items, get the 4th one free.",
      list: [
        "Buy 3, Get 1 Free.",
        "Applies to Entire Store.",
        "Auto-adds the free product to the cart.",
      ],
    },
    svg: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 38 33"
        className="campaign-box-content"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.96718 8V2.01069H10.9328V3.05473H8.23347V4.48187H10.6696V5.5259H8.23347V8H6.96718ZM13.2669 8V2.01069H15.6298C16.0821 2.01069 16.4682 2.09161 16.7879 2.25343C17.1096 2.4133 17.3543 2.64043 17.522 2.93483C17.6916 3.22727 17.7764 3.57138 17.7764 3.96716C17.7764 4.36489 17.6906 4.70705 17.519 4.99365C17.3475 5.2783 17.0989 5.49666 16.7733 5.64873C16.4497 5.8008 16.0578 5.87684 15.5977 5.87684H14.0155V4.85912H15.3929C15.6347 4.85912 15.8355 4.82598 15.9954 4.75969C16.1553 4.6934 16.2742 4.59397 16.3522 4.4614C16.4321 4.32882 16.4721 4.16408 16.4721 3.96716C16.4721 3.7683 16.4321 3.60063 16.3522 3.46415C16.2742 3.32768 16.1543 3.22435 15.9925 3.15416C15.8326 3.08202 15.6308 3.04596 15.3871 3.04596H14.5332V8H13.2669ZM16.5013 5.2744L17.9899 8H16.592L15.1356 5.2744H16.5013ZM20.1536 8V2.01069H24.1894V3.05473H21.4199V4.48187H23.9817V5.5259H21.4199V6.95597H24.2011V8H20.1536ZM26.6785 8V2.01069H30.7142V3.05473H27.9448V4.48187H30.5066V5.5259H27.9448V6.95597H30.7259V8H26.6785Z"
          fill="currentColor"
        />
        <path
          d="M12.3668 15.1211C11.7143 14.8701 10.992 14.8701 10.3396 15.1211L7.08191 16.374C6.53669 16.5837 6.17694 17.1075 6.17694 17.6917V18.7271C6.7886 18.65 7.41467 18.7239 7.99873 18.9485L11.2564 20.2015C12.1651 20.551 12.7647 21.424 12.7647 22.3976V26.8963C12.7647 27.0884 12.7413 27.2766 12.6969 27.4576L15.6244 26.3316C16.1697 26.1219 16.5294 25.5981 16.5294 25.014V17.6917C16.5294 17.1075 16.1696 16.5837 15.6244 16.374L12.3668 15.1211ZM14.1252 17.149C14.3678 17.0557 14.64 17.1767 14.7333 17.4193C14.8266 17.6618 14.7056 17.9341 14.4631 18.0274L11.8599 19.0286C11.5337 19.1541 11.1725 19.1541 10.8463 19.0286L8.24313 18.0274C8.00056 17.9341 7.87955 17.6618 7.97284 17.4193C8.06614 17.1767 8.33842 17.0557 8.581 17.149L11.1842 18.1502C11.2929 18.192 11.4133 18.192 11.522 18.1502L14.1252 17.149ZM5.6337 19.8269C6.28613 19.576 7.00845 19.576 7.66088 19.8269L10.9186 21.0799C11.4638 21.2896 11.8235 21.8134 11.8235 22.3976V26.8963C11.8235 27.4805 11.4638 28.0043 10.9186 28.214L7.66088 29.4669C7.00845 29.7179 6.28613 29.7179 5.6337 29.4669L2.37602 28.214C1.83081 28.0043 1.47105 27.4805 1.47105 26.8963V22.3976C1.47105 21.8134 1.83081 21.2896 2.37602 21.0799L5.6337 19.8269ZM10.0275 22.5709C9.93417 22.3283 9.66189 22.2073 9.41931 22.3006L6.64721 23.3668L3.87511 22.3006C3.63254 22.2073 3.36026 22.3283 3.26696 22.5709C3.17366 22.8135 3.29468 23.0858 3.53725 23.1791L6.17662 24.1942V26.5375C6.17662 26.7974 6.38731 27.0081 6.64721 27.0081C6.90711 27.0081 7.1178 26.7974 7.1178 26.5375V24.1942L9.75717 23.1791C9.99975 23.0858 10.1208 22.8135 10.0275 22.5709Z"
          fill="currentColor"
        />
        <path
          d="M31.1903 15.1211C30.5379 14.8701 29.8155 14.8701 29.1631 15.1211L25.9054 16.374C25.3602 16.5837 25.0005 17.1075 25.0005 17.6917V18.7271C25.6121 18.65 26.2382 18.7239 26.8223 18.9485L30.0799 20.2015C30.9886 20.551 31.5882 21.424 31.5882 22.3976V26.8963C31.5882 27.0884 31.5649 27.2766 31.5204 27.4576L34.448 26.3316C34.9932 26.1219 35.3529 25.5981 35.3529 25.014V17.6917C35.3529 17.1075 34.9932 16.5837 34.448 16.374L31.1903 15.1211ZM32.9487 17.149C33.1913 17.0557 33.4636 17.1767 33.5569 17.4193C33.6502 17.6618 33.5292 17.9341 33.2866 18.0274L30.6834 19.0286C30.3572 19.1541 29.996 19.1541 29.6698 19.0286L27.0667 18.0274C26.8241 17.9341 26.7031 17.6618 26.7964 17.4193C26.8897 17.1767 27.162 17.0557 27.4045 17.149L30.0077 18.1502C30.1164 18.192 30.2368 18.192 30.3456 18.1502L32.9487 17.149ZM24.4572 19.8269C25.1097 19.576 25.832 19.576 26.4844 19.8269L29.7421 21.0799C30.2873 21.2896 30.6471 21.8134 30.6471 22.3976V26.8963C30.6471 27.4805 30.2873 28.0043 29.7421 28.214L26.4844 29.4669C25.832 29.7179 25.1097 29.7179 24.4572 29.4669L21.1996 28.214C20.6543 28.0043 20.2946 27.4805 20.2946 26.8963V22.3976C20.2946 21.8134 20.6543 21.2896 21.1996 21.0799L24.4572 19.8269ZM28.851 22.5709C28.7577 22.3283 28.4854 22.2073 28.2428 22.3006L25.4707 23.3668L22.6986 22.3006C22.4561 22.2073 22.1838 22.3283 22.0905 22.5709C21.9972 22.8135 22.1182 23.0858 22.3608 23.1791L25.0002 24.1942V26.5375C25.0002 26.7974 25.2108 27.0081 25.4707 27.0081C25.7306 27.0081 25.9413 26.7974 25.9413 26.5375V24.1942L28.5807 23.1791C28.8233 23.0858 28.9443 22.8135 28.851 22.5709Z"
          fill="currentColor"
        />
      </svg>
    ),
    campaign_data: {
      id: 0,
      title: "Buy 3 Get 1 Free",
      status: "active",
      type: "bogo",
      discount_type: "percentage",
      discount_value: null,
      tiers: [
        {
          id: 1,
          buy_quantity: 3,
          get_quantity: 1,
        },
      ],
      target_type: "entire_store",
      target_ids: [],
      is_exclude: false,
      exclude_sale_items: true,
      schedule_enabled: false,
      start_datetime: null,
      end_datetime: null,
      usage_limit: null,
      conditions: { match_type: "all", rules: [] },
      settings: {
        auto_add_free_product: true,
        show_bogo_message: true,
        bogo_banner_message_format: "Stock Up Event: Buy 3 Get 1 Free!",
      },
    },
    markdown:
      "**Best For:** Clearing inventory and significantly increasing cart size.\n**Description:** Buy 3 items, get the 4th one free.\n**Key Features:**\n\n- **Buy 3, Get 1 Free**.\n- Applies to **Specific Products**.\n- **Auto-adds** the free product to the cart.",
  },
];

export default templates;

export const getTemplate = (id: string) =>
  templates.find((template) => template.id === id);
