import * as env from './env.json';

export const APP_PREFIX = "threewalls-app";
export const APP_ICON_PATH = "public/icon.png";

var apiURL;
var websiteUrl;

switch (env.NODE_ENV) {
    case 'local':
        apiURL = "http://127.0.0.1:7000/api/v2";
        websiteUrl = "http://localhost:5173";
        break;
    case 'development':
        apiURL = "https://api.dev.3walls.org/api/v2";
        websiteUrl = "https://dev.3walls.org";
        break;
    default:
        apiURL = "https://api.app.3walls.org/api/v2";
        websiteUrl = "https://app.3walls.org";
        break;   
}

export const API_URL = apiURL;
export const WEBSITE_URL = websiteUrl
export const DEFAULT_SCREENS = 3;
export const MULTIPLE_SCREENS = [3, 4];