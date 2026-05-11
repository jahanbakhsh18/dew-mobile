import axios, { AxiosError } from "axios";
import CookieManager from '@preeternal/react-native-cookie-manager';
import { API_URL } from '../config'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Do NOT rely on 'withCredentials' for cookie handling in React-Native
  xsrfCookieName: 'CSRF-TOKEN',
  xsrfHeaderName: 'X-CSRF-TOKEN'
});

apiClient.interceptors.request.use(async (config) => {
  const cookies = await CookieManager.get(API_URL);

  // Convert the cookies object into a string format for the header
  const cookieString = Object.entries(cookies)
    .map(([key, value]) => `${key}=${value}`)
    .join('; ');

  if (cookieString) {
    config.headers.Cookie = cookieString;
  }

  const nonSafeMethods = ['post', 'put', 'patch', 'delete'];
  const method = config.method?.toLowerCase() ?? '';
  if (nonSafeMethods.includes(method)) {
    const csrfToken = cookies['CSRF-TOKEN'];
    if (csrfToken?.value) {
      config.headers['X-CSRF-TOKEN'] = csrfToken.value;
      console.log('✅ Added X-CSRF-TOKEN header:', csrfToken.value.substring(0, 50) + '...');
    } else {
      console.warn('⚠️ CSRF-TOKEN cookie not found');
    }
  }

  console.log("Cookies", Object.entries(cookies));
  return config;
}, (error) => Promise.reject(error));

export function getErrorMessage(error: any): [string, string] {

  // Server unreachable
  if (!error.response)
    return ["Network", "Cannot connect to the server"];

  // Serenity error
  if (error.response?.data?.Error?.Message)
    return [error.response.data.Error.Code, error.response.data.Error.Message];

  // HTTP error
  if (error.response?.status)
    return ["HTTP", `Server error (${error.response.status})`];

  return ["Unexpected", error.message || "Unexpected error"];
}

apiClient.interceptors.response.use(async (response) => {
  const setCookieHeader = response.headers['set-cookie'];

  if (setCookieHeader) {
    const cookieString = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
    if (cookieString) {
      await CookieManager.setFromResponse(API_URL, cookieString);
    }
  }

  return response;
},
  (error: AxiosError) => {
    const [type, message] = getErrorMessage(error);

    // if (type != "HTTP") //Do not show HTTP errors
    console.error(message);

    return Promise.reject({
      type: type,
      message: message
    });
  }
);

/*
apiClient.interceptors.request.use(config => {

  //const token = getCsrfToken();
  const token = getCookie("CSRF-TOKEN");

  if (token)
    config.headers["X-CSRF-TOKEN"] = token;

  return config;
});

function getCookie(name: string) {
  const value = document.cookie.match(
    '(^|;)\\s*' + name + '\\s*=\\s*([^;]+)'
  );
  return value ? value.pop() : '';
}

export function getCsrfToken(): string | null {

  const match = document.cookie.match(/CSRF-TOKEN=([^;]+)/);

  return match ? decodeURIComponent(match[1]) : null;
}
*/
