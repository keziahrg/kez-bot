const tsConfig = require("./tsconfig.json");

require("tsconfig-paths").register({
  baseUrl: tsConfig.compilerOptions.baseUrl,
  paths: tsConfig.compilerOptions.paths,
});
