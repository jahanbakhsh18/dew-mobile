const SERVER_IP = '10.61.243.3';

// Development vs Production configuration
const config = {
  development: {
    API_URL: `http://${SERVER_IP}:5000`,  // HTTP for dev
    USE_HTTPS: false,
  },
  production: {
    API_URL: `https://${SERVER_IP}:5001`, // HTTPS for prod
    USE_HTTPS: true,
  }
};

// __DEV__ is a React Native global that's true in development
const environment = __DEV__ ? 'development' : 'production';

console.log("config.js -> DEV:", __DEV__, environment);

export const API_URL = config[environment].API_URL;
export const USE_HTTPS = config[environment].USE_HTTPS;