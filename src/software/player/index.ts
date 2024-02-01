import axios from "axios";
import log from "electron-log";
import { API_URL, SCREENS_COUNT } from "../../../constants";
import {
  Action,
  FunctionizedAction,
  LessonData,
  LessonPart,
  LessonRawData,
  RendererAction,
} from "../../shared/types";
import { Part } from "./part";
import { FloatingMenu } from "./floatingMenu";
import { globalShortcut } from "electron";
import { functionize } from "../../shared/utils";
import { actions } from "./config";
import { Video } from "./adapters";

export class Player {
  public token: string;
  public isPlaying = false;

  private data: LessonData = [];
  private rawData: LessonRawData = [];
  private screens: Part[] = [];
  private devMode: boolean;
  private floatingMenu: FloatingMenu;
  private showQuestionnaire: () => void;

  private video = new Video();

  private idx = 0;

  private set setIdx(idx: number) {
    this.idx = idx;
    this.play();
  }

  constructor(showQuestionnaire: () => void) {
    this.showQuestionnaire = showQuestionnaire;
  }

  public async loadLesson(token: string, devMode: boolean) {
    this.devMode = devMode;
    this.token = token;

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
      console.log(`\nreset floatingMenu\n`);
      this.floatingMenu.destroy();
      this.floatingMenu = null;
    }

    this.token = null;
    this.video.reset();
    this.screens = [];
    this.rawData = [];
    this.data = [];
    this.idx = 0;

    actions.forEach((action) => {
      globalShortcut.unregister(action.keybinds);
    });

    globalShortcut.unregister("CommandOrControl+1+2");
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

      screen.window.on("closed", () => {
        this.showQuestionnaire();
      });
    }
  }

  private formatData(rawData: LessonRawData = this.rawData) {
    for (const rawLesson of rawData.sort((a, b) => a.order - b.order)) {
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
      console.log(this.rawData);
    } catch (e) {
      log.error("failed to load data", e);
    }
  }

  //==================//
  //       Play       //
  //==================//

  private play() {
    console.log(this.data, this.idx, this.data[this.idx]);

    const part = this.data[this.idx];

    if (!part) return;

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

    globalShortcut.register("CommandOrControl+1+2", () => {
      this.screens.forEach((screen) => {
        screen.window.webContents.openDevTools();
      });
    });
  }

  private fireAction(action: Action) {
    const func = functionize(action) as FunctionizedAction;

    this[func]();
  }

  private sendAction(action: RendererAction, payload?: any) {
    this.screens.forEach((screen) => {
      screen.window.webContents.send(action, payload);
    });
  }

  //==================//
  //      Actions     //
  //==================//

  private onEscape() {
    this.showQuestionnaire();
  }

  private onNext() {
    if (this.idx === this.data.length - 1) {
      this.showQuestionnaire();
      return;
    }

    this.setIdx = this.idx + 1;
  }

  private onPrev() {
    if (this.idx > 0) {
      this.setIdx = this.idx - 1;
    }
  }

  private onVideoPauseOrContinue() {
    this.sendAction("videoPauseOrContinue", this.video.togglePlay());
  }

  private onVideoRewind() {
    // this.sendAction("videoSeekTo", this.video.skipBy(-10));
    this.sendAction("videoSeekTo", -10);
  }

  private onVideoForward() {
    // this.sendAction("videoSeekTo", this.video.skipBy(10));
    this.sendAction("videoSeekTo", 10);
  }

  private onVideoToggleFullscreen() {
    this.sendAction("videoToggleFullscreen");
  }
}
