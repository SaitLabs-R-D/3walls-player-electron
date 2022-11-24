module.exports = {
  packagerConfig: {
    name: "3 walls app",
    icon: "/images/icon.png",
    protocols: [
      {
        name: "Threewalls App",
        schemes: ["threewalls-app"],
      },
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {},
    },
    // {
    //   name: "@electron-forge/maker-zip",
    //   platforms: ["darwin"],
    // },
    {
      name: "@electron-forge/maker-deb",
      config: {},
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {},
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO",
      },
    },
  ],
};
