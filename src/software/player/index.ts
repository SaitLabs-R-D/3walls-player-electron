import axios from "axios";
import log from "electron-log";
import { API_URL, SCREENS_COUNT } from "../../../constants";
import {
  Action,
  FunctionizedAction,
  LessonData,
  LessonRawData,
} from "../../shared/types";
import { Part } from "./part";
import { FloatingMenu } from "./floatingMenu";
import { globalShortcut } from "electron";
import { functionize } from "../../shared/utils";
import { actions } from "./config";

export class Player {
  private data: LessonData = [];
  private rawData: LessonRawData = [];
  private screens: Part[] = [];
  private devMode: boolean;
  private floatingMenu: FloatingMenu;
  private idx = 0;
  private showQuestionnaire: () => void;

  constructor(showQuestionnaire: () => void) {
    this.showQuestionnaire = showQuestionnaire;
  }

  public async loadLesson(token: string, devMode: boolean) {
    this.devMode = devMode;

    await this.fetchData(token);
    this.formatData();
    this.loadScreens();
  }

  public reset() {
    for (const screen of this.screens) {
      screen.destroy();
    }

    this.floatingMenu.destroy();
    this.rawData = [];
    this.data = [];
  }

  private init() {
    // this.floatingMenu = new FloatingMenu(this.fireAction.bind(this));
    this.registerKeybinds();
  }

  private loadScreens() {
    let windowsLoadedCount = 0;

    for (let idx = 0; idx < SCREENS_COUNT; idx++) {
      const screen = new Part(idx, this.devMode);
      this.screens.push(screen);

      screen.window.on("ready-to-show", () => {
        if (++windowsLoadedCount === SCREENS_COUNT) {
          this.init();
        }
      });
    }
  }

  private formatData(rawData: LessonRawData = this.rawData) {
    for (const rawLesson of rawData) {
      const content =
        rawLesson.type === "normal"
          ? rawLesson.screens
          : { url: rawLesson.gcp_path };

      this.data.push({
        _id: rawLesson._id,
        order: rawLesson.order,
        title: rawLesson.title,
        type: rawLesson.type,
        content,
      });
    }
  }

  private async fetchData(token: string) {
    try {
      const res = await axios.get(`${API_URL}/watch/data?token=${token}`);
      this.rawData = res.data.content as LessonRawData;
    } catch (e) {
      log.error("failed to load data", e);
    }
  }

  //==================//
  //       Events     //
  //==================//

  private registerKeybinds() {
    actions.forEach((action) => {
      globalShortcut.register(action.keybinds, () =>
        this.fireAction(action.name)
      );
    });
  }

  private fireAction(action: Action) {
    const func = functionize(action) as FunctionizedAction;

    this[func]();
  }

  //==================//
  //      Actions     //
  //==================//

  private onEscape() {
    this.reset();
  }

  private onNext() {
    if (++this.idx === this.data.length) {
      this.reset();
      this.showQuestionnaire();
    }
  }

  private onPrev() {
    if (this.idx > 0) {
      this.idx--;
    }
  }

  private onVideoPauseOrContinue() {
    console.log("onVideoPauseOrContinue");
  }

  private onVideoRewind() {
    console.log("onVideoRewind");
  }

  private onVideoForward() {
    console.log("onVideoForward");
  }

  private onVideoFullscreen() {
    console.log("onVideoFullscreen");
  }
}
