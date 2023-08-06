module.exports = {
  packagerConfig: {
    icon: "public/icon",
    protocols: [
      {
        name: "Threewalls App",
        schemes: ["threewalls-app"],
      },
    ],
  },
  // rebuildConfig: {},
  makers: [
    // {
    //   name: "@electron-forge/maker-squirrel",
    //   setupIcon: "public/icon",
    // },
    // {
    //   name: "@electron-forge/maker-zip",
    //   platforms: ["darwin"],
    // },
    // {
    //   name: "@electron-forge/maker-deb",
    //   config: {},
    // },
    // {
    //   name: "@electron-forge/maker-rpm",
    //   config: {},
    // },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        format: "ULFO",
      },
    },
  ],
};
