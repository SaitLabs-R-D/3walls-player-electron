import { Locale } from "../shared/types/general";
import { default as EStore } from "electron-store";

class Store {
  public store = new EStore();
  private _locale: Locale = "he-il";
  private listeners: {
    [key: string]: (locale: Locale) => void;
  } = {};

  get locale() {
    return this._locale;
  }

  set locale(locale: Locale) {
    this._locale = locale;
    Object.values(this.listeners).forEach((listener) => listener(locale));
  }

  constructor() {
    this.setLocale(this.store.get("locale") as Locale);
  }

  public setLocale(locale: Locale) {
    if (["he-il", "en-us"].includes(locale)) {
      this.store.set("locale", locale);
      this.locale = locale;
    }
  }

  public addListener(key: string, listener: (locale: Locale) => void) {
    this.listeners[key] = listener;
  }

  public removeListener(key: string) {
    delete this.listeners[key];
  }
}

export const store = new Store();
