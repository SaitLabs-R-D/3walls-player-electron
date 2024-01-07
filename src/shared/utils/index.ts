export const functionize = (name: string) =>
  "on" + name.charAt(0).toUpperCase() + name.slice(1);

export const isYoutube = (URL: string) =>
  URL.includes("youtube") || URL.includes("youtu.be");
