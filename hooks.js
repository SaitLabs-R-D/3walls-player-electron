export const generateAssets = async () => {
  const env = process.env.NODE_ENV
  const fs = require("fs");
  
  console.log(env);

  fs.writeFileSync(
    'env.json',
    JSON.stringify({NODE_ENV: env})
  );
  console.log("Created env.json file");
};