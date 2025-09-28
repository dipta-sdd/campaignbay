import App from "./App";
import domReady from "@wordpress/dom-ready";

// 1. IMPORT REACT DIRECTLY
// While not always strictly necessary with modern Babel, it's a best practice for clarity.
import React from "react";

// 2. IMPORT createRoot FROM THE OFFICIAL "react-dom/client" LIBRARY
// This is the core change. We no longer use the WordPress wrapper.
import { createRoot } from "react-dom/client";

// 3. (Optional but Recommended) Add a console log to verify React is loaded
console.log("React version:", React.version);

domReady(() => {
  const el = document.getElementById("campaignbay");

  // 4. (Optional but Recommended) Add a check to ensure the root element exists
  // This prevents errors if your script is ever loaded on a page without that div.
  if (el) {
    const root = createRoot(el);
    root.render(<App />);
  }
});
