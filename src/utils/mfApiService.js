/**
 * MF API Service
 *
 * Two separate data sources:
 *   1. AdvisoryKhoj Scheme Master — AMC list + scheme metadata
 *      GET https://rkswealth.in/api/scheme-master/scheme-share?page=1&limit=2000&orderBy=id&order=ASC
 *      Response fields: AMC_Name, Scheme_Name, Scheme_Amfi_code, NAV, Nav_Date, Scheme_Category, etc.
 *
 *   2. MFAPI — historical NAV data per scheme
 *      GET https://api.mfapi.in/mf/{schemeCode}
 *      Scheme_Amfi_code from AdvisoryKhoj is the direct MFAPI schemeCode (confirmed).
 *
 * All network results are cached in-memory for the session lifetime.
 */

// ─── API endpoints ────────────────────────────────────────────────────────────

const SCHEME_MASTER_URL = import.meta.env.DEV
  ? '/api/scheme-master/scheme-share?page=1&limit=2000&orderBy=id&order=ASC'
  : 'https://rkswealth.in/api/scheme-master/scheme-share?page=1&limit=2000&orderBy=id&order=ASC';

const MFAPI_BASE_URL = 'https://api.mfapi.in/mf';

// ─── In-memory cache ──────────────────────────────────────────────────────────

const cache = {
  /** @type {Array<NormalizedScheme>|null} */
  allSchemes: null,
  /** @type {Record<string, MfapiSchemeDetail>} */
  navHistory: {},
};

// ─── Type shapes (JSDoc) ──────────────────────────────────────────────────────

/**
 * @typedef {Object} NormalizedScheme
 * @property {string} schemeCode   - AMFI scheme code (same as MFAPI schemeCode)
 * @property {string} schemeName   - Full scheme name from AdvisoryKhoj
 * @property {string} amcName      - Fund house name
 * @property {string} category     - Scheme category
 * @property {number|null} latestNav - Latest NAV from scheme master (may be stale)
 * @property {string} navDate      - Latest NAV date string
 * @property {number|null} sipMinAmount - Minimum SIP amount
 */

/**
 * @typedef {Object} MfapiSchemeDetail
 * @property {{ fund_house: string, scheme_type: string, scheme_category: string, scheme_code: number, scheme_name: string }} meta
 * @property {Array<{ date: string, nav: string }>} data  - Newest first, format "DD-Mon-YYYY"
 * @property {string} status
 */

// ─── Scheme Master (AdvisoryKhoj) ─────────────────────────────────────────────

/**
 * Fetch all mutual fund schemes from AdvisoryKhoj scheme master API.
 * Results are normalised to { schemeCode, schemeName, amcName, ... } shape
 * and cached in-memory after the first successful fetch.
 *
 * @returns {Promise<NormalizedScheme[]>}
 */
export const fetchAllSchemes = async () => {
  if (cache.allSchemes) {
    return cache.allSchemes;
  }

  const response = await fetch(SCHEME_MASTER_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch scheme master: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();

  // AdvisoryKhoj wraps records in a "data" array
  const records = Array.isArray(json) ? json : (json.data ?? []);

  if (records.length === 0) {
    throw new Error('Scheme master returned no records. Please try again later.');
  }

  // Normalise each record to a consistent internal shape
  const normalised = records
    .filter((r) => r.Scheme_Amfi_code) // skip entries without a valid AMFI code
    .map((r) => ({
      schemeCode: String(r.Scheme_Amfi_code).trim(),
      schemeName: (r.Scheme_Name || '').trim(),
      amcName: (r.AMC_Name || '').trim(),
      category: (r.Scheme_Category || '').trim(),
      latestNav: r.NAV ? parseFloat(r.NAV) : null,
      navDate: r.Nav_Date || '',
      sipMinAmount: r.Sip_minimum_amount ? parseFloat(r.Sip_minimum_amount) : null,
    }));

  cache.allSchemes = normalised;
  return normalised;
};

// ─── AMC helpers ──────────────────────────────────────────────────────────────

/**
 * Extract sorted unique AMC (Fund House) names from the normalised scheme list.
 *
 * @param {NormalizedScheme[]} schemes
 * @returns {string[]} Sorted array of unique AMC names
 */
export const extractAmcList = (schemes) => {
  const amcSet = new Set();
  for (const scheme of schemes) {
    if (scheme.amcName) amcSet.add(scheme.amcName);
  }
  return Array.from(amcSet).sort();
};

/**
 * Filter schemes belonging to a specific AMC.
 *
 * @param {NormalizedScheme[]} schemes
 * @param {string} amcName - Selected AMC name
 * @returns {NormalizedScheme[]}
 */
export const filterSchemesByAmc = (schemes, amcName) => {
  if (!amcName) return [];
  return schemes.filter((s) => s.amcName === amcName);
};

// ─── MFAPI — NAV history ──────────────────────────────────────────────────────

/**
 * Fetch full NAV history for a scheme from MFAPI.
 * Scheme_Amfi_code from AdvisoryKhoj is used directly as the MFAPI scheme code.
 * Results are cached per schemeCode for the session lifetime.
 *
 * @param {string|number} schemeCode - AMFI scheme code
 * @returns {Promise<MfapiSchemeDetail>} Object with { meta, data: [{date, nav}], status }
 */
export const fetchSchemeNavHistory = async (schemeCode) => {
  const key = String(schemeCode).trim();

  if (cache.navHistory[key]) {
    return cache.navHistory[key];
  }

  const response = await fetch(`${MFAPI_BASE_URL}/${key}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch NAV history for scheme ${key}: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (data.status !== 'SUCCESS' || !data.data || data.data.length === 0) {
    throw new Error(
      `No NAV data available for scheme ${key}. It may be inactive or delisted.`
    );
  }

  cache.navHistory[key] = data;
  return data;
};

/**
 * Fetch only the latest NAV for a scheme from MFAPI (lighter request).
 *
 * @param {string|number} schemeCode
 * @returns {Promise<{ nav: number, date: string }>}
 */
export const fetchLatestNav = async (schemeCode) => {
  const key = String(schemeCode).trim();
  const response = await fetch(`${MFAPI_BASE_URL}/${key}/latest`);
  if (!response.ok) {
    throw new Error(`Failed to fetch latest NAV for scheme ${key}: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'SUCCESS' || !data.data?.[0]) {
    throw new Error(`No latest NAV available for scheme ${key}.`);
  }
  return {
    nav: parseFloat(data.data[0].nav),
    date: data.data[0].date,
  };
};
