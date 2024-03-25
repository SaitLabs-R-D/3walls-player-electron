export const APP_PREFIX = "threewalls-app";
export const APP_ICON_PATH = "public/icon.png";

const { env } = require('./env.json');

var _API_URL;
var _WEBSITE_URL;

switch (env.NODE_ENV) {
    case 'local':
        _API_URL = "http://127.0.0.1:7000/api/v2"; // * LOCAL
        _WEBSITE_URL = "http://localhost:5173"; // * LOCAL
        break;
    case 'development':
        _API_URL = "https://api.dev.3walls.org/api/v2"; // * DEV
        _WEBSITE_URL = "https://dev.3walls.org"; // * DEV
        break;
    default:
        _API_URL = "https://api.app.3walls.org/api/v2"; // * PROD
        _WEBSITE_URL = "https://app.3walls.org"; // * PROD
        break;   
}

export const API_URL = _API_URL;
export const WEBSITE_URL = _WEBSITE_URL
export const SCREENS_COUNT = 3;
