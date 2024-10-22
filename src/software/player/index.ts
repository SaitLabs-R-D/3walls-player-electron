import axios from "axios";
import log from "electron-log";
import { API_URL, MULTIPLE_SCREENS, DEFAULT_SCREENS } from "../../../constants";
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
import { displaysCount } from "../helpers";
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
  private showThankYou: () => void;

  private video = new Video();

  private idx = 0;

  private set setIdx(idx: number) {
    this.idx = idx;
    this.play();
  }

  constructor(showThankYou: () => void) {
    this.showThankYou = showThankYou;
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
    const DISPLAYS_COUNT = displaysCount()
    const SCREEN_COUNT = MULTIPLE_SCREENS.includes(DISPLAYS_COUNT) ? DISPLAYS_COUNT : DEFAULT_SCREENS ;
    
    for (let idx = 0; idx < SCREEN_COUNT; idx++) {
      const screen = new Part(idx, this.devMode);
      this.screens.push(screen);

      screen.window.on("ready-to-show", () => {
        if (SCREEN_COUNT === ++windowsLoadedCount) {          
          this.init();
        }
      });

      screen.window.on("closed", () => {
        this.showThankYou();
      });
    }
  }

  private formatData(rawData: LessonRawData = this.rawData) {
    for (const rawLesson of rawData.sort((a, b) => a.order - b.order)) {
      const content =
        rawLesson.type !== "panoramic"
          ? rawLesson.screens
          : { url: rawLesson.gcp_path || rawLesson.panoramic_url, panoramic_type: rawLesson.panoramic_type };
      
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

    if (!part) return;

    this.screens.forEach((screen, screenIdx) => {
      switch (part.type) {
        case "normal":
          screen.paint(
            part.type,
            (part as LessonPart<"normal">).content[screenIdx]
          );
          break;
        case "four_screens":
          screen.paint(
            part.type,
            (part as LessonPart<"four_screens">).content[screenIdx]
          )
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

    console.log(`\nfireAction: ${func}\n`);

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
    this.showThankYou();
  }

  private onNext() {
    if (this.idx === this.data.length - 1) {
      this.showThankYou();
      return;
    }
    this.cancelRequests()
    this.setIdx = this.idx + 1;
  }

  private onPrev() {
    if (this.idx > 0) {
    this.cancelRequests()
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

  private cancelRequests() {
    this.screens.forEach((screen) => {
      screen.window.webContents.stop();
    });
  }
}
