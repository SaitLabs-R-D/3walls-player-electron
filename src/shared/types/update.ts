
export type updateAPI = {
  update: () => void;
};

export type updaterWindow = Window &
  typeof globalThis & {
    ipcRenderer: updateAPI;
  };
