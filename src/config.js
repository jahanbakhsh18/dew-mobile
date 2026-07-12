import { DEV_API_URL, PROD_API_URL } from '@env';

// Development vs Production configuration
const config = {
  development: {
    API_URL: DEV_API_URL,
    USE_HTTPS: false,
  },
  production: {
    API_URL: PROD_API_URL,
    USE_HTTPS: true,
  }
};

const environment = __DEV__ ? 'development' : 'production';

console.log(
  "config.js -> DEV:" + __DEV__,
  __DEV__ == true ? config.development.API_URL : config.production.API_URL
);

export const API_URL = config[environment].API_URL;
export const USE_HTTPS = config[environment].USE_HTTPS;