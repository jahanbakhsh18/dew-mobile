import { SERVER_IP, DEV_API_PORT, PROD_API_PORT } from '@env';

// Development vs Production configuration
const config = {
  development: {
    API_URL: `http://${SERVER_IP}:${DEV_API_PORT}`,  // HTTP for dev
    USE_HTTPS: false,
  },
  production: {
    API_URL: `https://${SERVER_IP}:${PROD_API_PORT}`, // HTTPS for prod
    USE_HTTPS: true,
  }
};

const environment = __DEV__ ? 'development' : 'production';

console.log(
  "config.js -> DEV:"+__DEV__, 
  __DEV__ == true ? config.development.API_URL: config.production.API_URL
);

export const API_URL = config[environment].API_URL;
export const USE_HTTPS = config[environment].USE_HTTPS;