// src/admin/utils/api.js

import apiFetch from "@wordpress/api-fetch";
import { CbStore } from "../types";

declare global {
  interface Window {
    /**
     * The main data object localized from PHP by wp_localize_script.
     * Note: The name is `wpab_cb_Localize` in this file.
     */
    wpab_cb_Localize?: CbStore;
  }
}
// Get the nonce and root URL that we localized from PHP.
const { nonce, rest_url } = window?.wpab_cb_Localize || {};
if (nonce) apiFetch.use(apiFetch.createNonceMiddleware(nonce));
if (rest_url) apiFetch.use(apiFetch.createRootURLMiddleware(rest_url));
