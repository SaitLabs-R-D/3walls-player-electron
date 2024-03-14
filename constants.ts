export const APP_PREFIX = "threewalls-app";
export const APP_ICON_PATH = "public/icon.png";

// export const API_URL = "https://api.app.3walls.org/api/v2"; // * PROD
// export const WEBSITE_URL = "https://app.3walls.org"; // * PROD

// export const API_URL = "https://api.dev.3walls.org/api/v2"; // * DEV
// export const WEBSITE_URL = "https://dev.3walls.org"; // * DEV

export const API_URL = `${process.env.API_URL || "http://127.0.0.1:7000"}/api/v2`; // * LOCAL
export const WEBSITE_URL = process.env.WEBSITE_URL || "http://localhost:5173"; // * LOCAL

export const SCREENS_COUNT = 3;
