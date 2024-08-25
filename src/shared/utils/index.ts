export const functionize = (name: string) =>
  "on" + name.charAt(0).toUpperCase() + name.slice(1);

export const isYoutube = (URL: string) =>
  URL.includes("youtube") || URL.includes("youtu.be");

export const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "mkv", "webm"];
export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "svg", "webp"];

export const getGCPURLVideoOrImage = (URL: string) => {
  const fileType = URL.split("?")[0].split(".").pop();

  if (VIDEO_EXTENSIONS.includes(fileType)) {
    return "video";
  } else if (IMAGE_EXTENSIONS.includes(fileType)) {
    return "image";
  }

  return null;
};
