import { Lang } from "../shared/types/general";
import { default as EStore } from "electron-store";

class Store {
  public store = new EStore();
  private _lang: Lang = "he-il";
  private listeners: {
    [key: string]: (lang: Lang) => void;
  } = {};

  get lang() {
    return this._lang;
  }

  set lang(lang: Lang) {
    this._lang = lang;
    Object.values(this.listeners).forEach((listener) => listener(lang));
  }

  constructor() {
    this.setLang(this.store.get("lang") as Lang);
  }

  public setLang(lang: Lang) {
    if (["he-il", "en-us"].includes(lang)) {
      this.store.set("lang", lang);
      this.lang = lang;
    }
  }

  public addListener(key: string, listener: (lang: Lang) => void) {
    this.listeners[key] = listener;
  }

  public removeListener(key: string) {
    delete this.listeners[key];
  }
}

export const store = new Store();
