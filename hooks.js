let fs = require("fs");

const env = process.env.NODE_ENV
console.log(env);

export const generate = async () => {
  fs.writeFileSync(
    'env.json',
    JSON.stringify({NODE_ENV: env})
  );
}