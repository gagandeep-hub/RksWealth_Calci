/**
 * MFAPI Service
 * Handles all network requests to https://api.mfapi.in
 * Uses in-memory caching to avoid redundant fetches during a session.
 */

const BASE_URL = 'https://api.mfapi.in/mf';

// In-memory cache store
const cache = {
  allSchemes: null,
  navHistory: {},
};

/**
 * Fetch all mutual fund schemes from MFAPI.
 * Results are cached in-memory after the first successful fetch.
 *
 * @returns {Promise<Array>} Array of scheme objects: [{ schemeCode, schemeName }]
 */
export const fetchAllSchemes = async () => {
  if (cache.allSchemes) {
    return cache.allSchemes;
  }

  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch schemes: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  cache.allSchemes = data;
  return data;
};

/**
 * Fetch NAV history for a specific scheme.
 * Results are cached per schemeCode in-memory.
 *
 * @param {string|number} schemeCode - The unique AMFI scheme code
 * @returns {Promise<Object>} Scheme detail object with { meta, data: [{date, nav}] }
 */
export const fetchSchemeNavHistory = async (schemeCode) => {
  const key = String(schemeCode);

  if (cache.navHistory[key]) {
    return cache.navHistory[key];
  }

  const response = await fetch(`${BASE_URL}/${key}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch NAV history for scheme ${key}: ${response.status}`);
  }

  const data = await response.json();
  cache.navHistory[key] = data;
  return data;
};

/**
 * Extract unique AMC (Fund House) names from the full scheme list.
 * Sorted alphabetically for easy dropdown navigation.
 *
 * @param {Array} schemes - Full scheme list from fetchAllSchemes()
 * @returns {Array<string>} Sorted array of unique AMC names
 */
export const extractAmcList = (schemes) => {
  const amcSet = new Set();
  for (const scheme of schemes) {
    // schemeName format: "AMC Name - Scheme Name - Option"
    // We extract the part before the first dash separator
    const parts = scheme.schemeName.split(' - ');
    if (parts.length > 0) {
      amcSet.add(parts[0].trim());
    }
  }
  return Array.from(amcSet).sort();
};

/**
 * Filter schemes belonging to a specific AMC.
 *
 * @param {Array} schemes - Full scheme list
 * @param {string} amcName - The selected AMC name
 * @returns {Array} Filtered scheme objects for the selected AMC
 */
export const filterSchemesByAmc = (schemes, amcName) => {
  if (!amcName) return [];
  return schemes.filter((s) => s.schemeName.startsWith(amcName));
};
