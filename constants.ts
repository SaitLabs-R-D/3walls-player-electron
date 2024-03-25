export const APP_PREFIX = "threewalls-app";
export const APP_ICON_PATH = "public/icon.png";

var apiURL;
var websiteUrl;

switch (process.env.NODE_ENV) {
    case 'local':
        apiURL = "http://127.0.0.1:7000/api/v2"; // * LOCAL
        websiteUrl = "http://localhost:5173"; // * LOCAL
        break;
    case 'development':
        apiURL = "https://api.dev.3walls.org/api/v2"; // * DEV
        websiteUrl = "https://dev.3walls.org"; // * DEV
        break;
    default:
        apiURL = "https://api.app.3walls.org/api/v2"; // * PROD
        websiteUrl = "https://app.3walls.org"; // * PROD
        break;   
}

export const API_URL = apiURL;
export const WEBSITE_URL = websiteUrl
export const SCREENS_COUNT = 3;
