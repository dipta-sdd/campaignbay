// src/admin/utils/api.js

import apiFetch from "@wordpress/api-fetch";

// Get the nonce and root URL that we localized from PHP.
const { nonce, rest_url } = window.wpab_cb_Localize || {};
console.log("adding middlewire");
apiFetch.use(apiFetch.createNonceMiddleware(nonce));
apiFetch.use(apiFetch.createRootURLMiddleware(rest_url));
console.log(nonce);
console.log(rest_url);
