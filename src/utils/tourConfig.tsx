import { TOUR_STEPS } from "./tourSteps";
export interface TourConfig {
  [key: number]: TourStepConfig;
}
interface TourStepConfig {
  text: string | React.ReactNode;
  position: string;
  showNext: boolean;
  showPrev: boolean;
  autoFocus?: boolean;
  nextOnEnter?: boolean;
  nextOnSelect?: boolean;
  onNext?: (actions: GuideActions) => void;
  onPrev?: (actions: GuidePrevActions) => void;
}
export interface GuideActions {
  next: () => void;
  setStep: (step: number) => void;
  navigate: (to: string) => void;
}
export interface GuidePrevActions {
  prev: () => void;
  setStep: (step: number) => void;
  navigate: (to: string) => void;
}
export const campaignTourConfig: TourConfig = {
  // ===========================================================================
  // BASE STEPS
  // ===========================================================================
  [TOUR_STEPS.START]: {
    text: (
      <span className="">
        Click <b>Add Campaign</b> to create a new promotion.
      </span>
    ),
    position: "bottom-left",
    showNext: false,
    showPrev: false,
    autoFocus: true,
  },
  [TOUR_STEPS.BLANK_CAMPAIGN]: {
    text: (
      <span className="">
        Select <b>Blank Campaign</b> to create your custom campaign.
      </span>
    ),
    position: "bottom",
    showNext: true,
    showPrev: false,
    autoFocus: true,
  },
  [TOUR_STEPS.CREATE]: {
    text: (
      <span className="">
        Click <b>Create</b> to start creating.
      </span>
    ),
    position: "bottom",
    showNext: false,
    showPrev: true,
    autoFocus: true,
  },

  [TOUR_STEPS.TITLE]: {
    text: "Start by giving your campaign a descriptive title (e.g., 'Summer Flash Sale').",
    position: "bottom",
    showNext: true,
    showPrev: false,
    autoFocus: true,
  },
  [TOUR_STEPS.TYPE]: {
    text: (
      <span>
        Choose your campaign strategy here. Options include
        <br />
        <ul className="campaignbay-list-disc campaignbay-list-inside">
          <li>'Buy X Get X' (BOGO)</li>
          <li>'Quantity' (Bulk discounts)</li>
          <li>'Scheduled' (Time-based sales)</li>
          <li>'Early Bird' (Limited offers for first buyers)</li>
        </ul>
      </span>
    ),
    position: "bottom",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnSelect: true,
  },
  [TOUR_STEPS.STATUS]: {
    text: (
      <span>
        Set the status:
        <ul className="campaignbay-list-disc campaignbay-list-inside">
          <li>
            <b>Active</b>: Runs immediately.
          </li>
          <li>
            <b>Scheduled</b>: Waits for the specified start date.
          </li>
        </ul>
      </span>
    ),
    position: "bottom",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnSelect: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.TARGET_TYPE),
  },
  // ===========================================================================
  // COMMON: TARGETING
  // ===========================================================================
  [TOUR_STEPS.TARGET_TYPE]: {
    text: "Choose where this discount applies: The entire store, specific categories, or specific products.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.BOGO_BUY),
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.STATUS),
  },
  [TOUR_STEPS.TARGET_IDS]: {
    text: "Search and select the specific Products, Categories, or Tags here.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.BOGO_BUY),
  },
  [TOUR_STEPS.EXCLUDE_CHECK]: {
    text: "Check this if you want to exclude the selected items instead of including them.",
    position: "right",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnSelect: true,
  },
  // ===========================================================================
  // TYPE: SCHEDULED DISCOUNT
  // ===========================================================================
  [TOUR_STEPS.SCHED_TYPE]: {
    text: "Choose whether to apply a percentage discount (e.g., 20%) or a fixed currency amount (e.g., $10).",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.TARGET_TYPE),
  },
  [TOUR_STEPS.SCHED_VALUE]: {
    text: "Enter the value of the discount here.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.USAGE_TOGGLE),
  },

  // ===========================================================================
  // TYPE: QUANTITY BASED DISCOUNT
  // ===========================================================================
  [TOUR_STEPS.QTY_RANGE]: {
    text: "Define the quantity range. For example, 'Buy from 5 to 10 items'.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.TARGET_TYPE),
  },
  [TOUR_STEPS.QTY_VALUE]: {
    text: "Set the discount reward for this range (e.g., get 10% off).",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
  },
  [TOUR_STEPS.QTY_TOGGLE]: {
    text: "Choose between a Percentage (%) discount or a Fixed Currency amount for this tier.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onNext: ({ setStep }) => {
      setStep(TOUR_STEPS.QTY_ADD_BTN);
      setTimeout(() => {
        setStep(TOUR_STEPS.USAGE_TOGGLE);
      }, 1000);
    },
  },
  [TOUR_STEPS.QTY_ADD_BTN]: {
    text: "Click here to add more tiers for higher quantities (e.g., Buy 11+ get 20% off).",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.USAGE_TOGGLE),
  },

  // ===========================================================================
  // TYPE: EARLY BIRD DISCOUNT
  // ===========================================================================
  [TOUR_STEPS.EB_QUANTITY]: {
    text: "Set the number of initial sales that qualify for this discount (e.g., First 50 buyers).",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.TARGET_TYPE),
  },
  [TOUR_STEPS.EB_VALUE]: {
    text: "Set the discount value those early buyers will receive.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
  },
  [TOUR_STEPS.EB_TOGGLE]: {
    text: "Choose between a Percentage (%) discount or a Fixed Currency amount for this tier.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onNext: ({ setStep }) => {
      setStep(TOUR_STEPS.EB_ADD_BTN);
      setTimeout(() => {
        setStep(TOUR_STEPS.USAGE_TOGGLE);
      }, 1000);
    },
  },
  [TOUR_STEPS.EB_ADD_BTN]: {
    text: "You can add more tiers for the next batch of buyers.But for now we will skip that.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onNext: ({ setStep }) => {
      setStep(TOUR_STEPS.USAGE_TOGGLE);
    },
  },

  // ===========================================================================
  // TYPE: BOGO (BUY X GET X)
  // ===========================================================================
  [TOUR_STEPS.BOGO_BUY]: {
    text: "Set the 'Buy' quantity. How many items must the customer purchase?",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.TARGET_TYPE),
  },
  [TOUR_STEPS.BOGO_GET]: {
    text: "Set the 'Get' quantity. How many items do they get for free?",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.USAGE_TOGGLE),
  },

  // ===========================================================================
  // COMMON: OTHER CONFIGURATIONS
  // ===========================================================================
  [TOUR_STEPS.USAGE_TOGGLE]: {
    text: "Enable this to limit how many times this campaign can be used in total.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.SCHED_TOGGLE),
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.BOGO_BUY),
  },
  [TOUR_STEPS.USAGE_INPUT]: {
    text: "Enter the maximum number of uses (e.g., 100 total orders).",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnSelect: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.SCHED_TOGGLE),
  },
  [TOUR_STEPS.SCHED_TOGGLE]: {
    text: "Enable scheduling to run this campaign automatically during a specific time range.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.SAVE_BTN),
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.USAGE_TOGGLE),
  },
  [TOUR_STEPS.START_TIME]: {
    text: "Select the start date and time.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.END_TIME),
  },
  [TOUR_STEPS.END_TIME]: {
    text: "Select the end date and time. Leave blank for an indefinite campaign.",
    position: "top",
    showNext: true,
    showPrev: true,
    autoFocus: true,
    nextOnEnter: true,
    onNext: ({ setStep }) => setStep(TOUR_STEPS.SAVE_BTN),
  },

  // ===========================================================================
  // FOOTER
  // ===========================================================================
  [TOUR_STEPS.SAVE_BTN]: {
    text: "You're done! Click here to save and activate your campaign.",
    position: "bottom-left",
    showNext: false,
    showPrev: true,
    autoFocus: true,
    onPrev: ({ setStep }) => setStep(TOUR_STEPS.SCHED_TOGGLE),
  },
};
