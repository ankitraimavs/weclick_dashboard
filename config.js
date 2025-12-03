export const ENV_CONFIG = {
  dev: {
    API_BASE: process.env.NEXT_PUBLIC_API_BASE_DEV,
    AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_DEV,
    USER_ID: process.env.NEXT_PUBLIC_USER_ID_DEV,
  },
  prod: {
    API_BASE: process.env.NEXT_PUBLIC_API_BASE_PROD,
    AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_PROD,
    USER_ID: process.env.NEXT_PUBLIC_USER_ID_PROD,
  },
  staging: {
    API_BASE: process.env.NEXT_PUBLIC_API_BASE_STAGING,
    AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_STAGING,
    USER_ID: process.env.NEXT_PUBLIC_USER_ID_STAGING,
  }, 
};
