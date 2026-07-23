import axios from "axios";
import CookieManager from '@preeternal/react-native-cookie-manager';
import { API_URL } from '../config'
import authStore from "./authStore";

let csrfRequestToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

apiClient.interceptors.request.use(async (config) => {
  const cookies = await CookieManager.get(API_URL);

  const cookieString = Object.entries(cookies)
    .map(([key, cookieData]) => {
      const value = typeof cookieData === 'object' ? cookieData.value || cookieData : cookieData;
      return `${key}=${value}`;
    })
    .join('; ');
  if (cookieString) {
    config.headers.Cookie = cookieString;
  }

  const unsafeMethods = ['post', 'put', 'patch', 'delete'];
  if (unsafeMethods.includes(config.method?.toLowerCase() || '')) {
    try {
      const token = await ensureCsrfToken();
      config.headers['X-CSRF-TOKEN'] = token;
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }

  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
  (response) => {
    const setCookieHeader = response.headers['set-cookie'];
    if (setCookieHeader) {
      const cookieString = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
      if (cookieString) {
        CookieManager.setFromResponse(API_URL, cookieString);
        console.log('Cookies updated from response');
      }
    }
    return response;
  },
  async (error) => {

    console.log({
      message: error.message, code: error.code,
      config: error.config, request: error.request,
      response: {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
      },
    });

    // Server unreachable
    if (!error.response)
      return Promise.reject({   //return ["Network", "Cannot connect to the server"];
        isNotLoggedIn: true,
        message: 'Cannot connect to the server...',
      });

    // Serenity error
    if (error.response?.data?.Error?.Code == "NotLoggedIn") {
      authStore.triggerResetLocalAuth();
      return Promise.reject({
        isNotLoggedIn: true,
        message: 'Session expired. Please login again.',
      });
    }

    // Antiforgery
    if (error?.response?.status === 400 &&
      (String(error?.response?.data)?.toLowerCase().includes('antiforgery') ||
        String(error?.response?.data)?.toLowerCase().includes('token'))
    ) {
      console.log('Antiforgery error detected, retrying request after clearing cookies');
      await clearCookies();
      const config = error.config;
      delete config.headers['X-CSRF-TOKEN'];
      return apiClient.request(config);
    }

    if (error.response?.data?.Error?.Message)
      return Promise.reject({  //return [error.response.data.Error.Code, error.response.data.Error.Message];
        isNotLoggedIn: false,
        message: error.response.data.Error.Message,
      });

    // HTTP error
    if (error.response?.status)
      return Promise.reject({  //return ["HTTP", `Server error (${error.response.status})`];
        isNotLoggedIn: true,
        message: `Server error (${error.response.status})`,
      });

    //return ["Unexpected", error.message || "Unexpected error"];
    return Promise.reject(error);
  }
);

const clearCookies = async (): Promise<void> => {
  try {
    await CookieManager.clearAll();
    csrfRequestToken = null;
    console.log('Cookies and token cleared');
  } catch (e) {
    console.warn('Failed to clear cookies:', e);
  }
};

// Core token fetcher (with retry)
const fetchCsrfToken = async (): Promise<string> => {

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async (): Promise<string> => {
    try {
      const response = await axios.get(`${API_URL}/Account/RefreshCsrfToken`, {
        withCredentials: true,
      });

      const token = response.data?.requestVerificationToken || response.data?.token;
      if (!token) {
        throw new Error('No token in response');
      }

      csrfRequestToken = token;
      console.log('CSRF token fetched and stored');
      return token;
    } catch (error: any) {
      const isAntiforgeryError = error?.response?.status === 400 &&
        (String(error?.response?.data)?.toLowerCase().includes('antiforgery') ||
          String(error?.response?.data)?.toLowerCase().includes('token'));

      if (isAntiforgeryError) {
        console.warn('Token fetch failed (cold start). Clearing cookies and retrying...');
        await clearCookies();
        tokenPromise = null;
        return fetchCsrfToken();
      }

      throw error;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
};

export const ensureCsrfToken = async (): Promise<string> => {
  if (csrfRequestToken) {
    return csrfRequestToken;
  }
  return fetchCsrfToken();
};

export const clearCsrfToken = (): void => {
  csrfRequestToken = null;
  tokenPromise = null;
};

export const refreshCsrfToken = async (): Promise<string> => {
  csrfRequestToken = null;
  tokenPromise = null;

  return fetchCsrfToken();
};