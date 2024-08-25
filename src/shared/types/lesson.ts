export type LessonRawData = {
  _id: string;
  order: number;
  gcp_path: null | string;
  panoramic_url: null | string;
  type: LessonPartType;
  title: string;
  screens: LessonRawDataScreen[];
}[];

export type LessonRawDataScreen = {
  url: string;
  type_: LessonPartNormalScreenType;
  mime_type: string;
  comment: string;
};

export type LessonData = LessonPart[];

export type LessonPart<T = LessonPartType> = {
  _id: string;
  order: number;
  title: string;
  type: T;
  content: LessonContent<T>;
};

export type LessonContent<T = LessonPartType> = T extends "panoramic"
  ? LessonPartPanoramicContent  
  : LessonPartNormalContent[];

export type LessonPartNormalContent = {
  url: string;
  type_: LessonPartNormalScreenType;
  mime_type: string;
  comment: string;
};

export type LessonPartPanoramicContent = {
  url: string;
  panoramic_type: LessonPartNormalScreenType;
};

export type LessonPartType = "normal" | "panoramic" | "four_screens";
export type LessonPartNormalScreenType = "img" | "video" | "browser";
