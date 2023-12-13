import axios from "axios";
import log from "electron-log";
import { API_URL, SCREENS_COUNT } from "../../../constants";
import {
  Action,
  FunctionizedAction,
  LessonData,
  LessonPart,
  LessonRawData,
} from "../../shared/types";
import { Part } from "./part";
import { FloatingMenu } from "./floatingMenu";
import { globalShortcut } from "electron";
import { functionize } from "../../shared/utils";
import { actions } from "./config";

export class Player {
  private isPlaying = false;

  private data: LessonData = [];
  private rawData: LessonRawData = [];
  private screens: Part[] = [];
  private devMode: boolean;
  private floatingMenu: FloatingMenu;
  private showQuestionnaire: () => void;

  private idx = 0;
  get getIdx() {
    return this.idx;
  }
  set setIdx(idx: number) {
    this.idx = idx;
    this.play();
  }

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
    this.isPlaying = false;

    for (const screen of this.screens) {
      screen.destroy();
    }

    if (this.floatingMenu) {
      this.floatingMenu.destroy();
      this.floatingMenu = null;
    }

    this.screens = [];
    this.rawData = [];
    this.data = [];
    this.idx = 0;
  }

  private init() {
    this.isPlaying = true;

    this.floatingMenu = new FloatingMenu(this.fireAction.bind(this));
    this.registerKeybinds();
    this.play();
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
  //       Play       //
  //==================//

  private play() {
    const part = this.data[this.idx];

    this.screens.forEach((screen, screenIdx) => {
      switch (part.type) {
        case "normal":
          screen.paint(
            part.type,
            (part as LessonPart<"normal">).content[screenIdx]
          );
          break;
        case "panoramic":
          screen.paint(part.type, (part as LessonPart<"panoramic">).content);
          break;
        default:
          break;
      }
    });
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
    this.showQuestionnaire();
  }

  private onNext() {
    console.log("onNext", this.idx);

    if (this.idx === this.data.length - 1) {
      // this.showQuestionnaire();
      return;
    }

    this.setIdx = this.idx + 1;
  }

  private onPrev() {
    console.log("onPrev", this.idx, this.idx > 0);

    if (this.idx > 0) {
      this.setIdx = this.idx - 1;
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
