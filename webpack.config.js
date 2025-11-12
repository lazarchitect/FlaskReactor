const path = require("path");
const glob = require('glob');

const delim = path.sep;
const scriptsDir = "src" + delim + "static" + delim + "scripts" + delim;

module.exports = {
  entry: () => {
      const entries = {};
      glob.sync("./src/**/*.js").forEach(file => {
        const name = file.replace(scriptsDir, "").replace(".js", "");   
        if(!name.includes("dist")) {
            entries[name] = "./" + file;
        }
      });
      return entries
  },
  mode: "development",
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: { 
    path: path.resolve("src/static/scripts", "dist"),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options:{
            presets: ["@babel/preset-env", "@babel/preset-react"],
          }
        },
      },
    ],
  }
};
