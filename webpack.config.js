const path = require("path");

module.exports = {
  // Entry point for the bundle
  entry: "./public/js/index.js", // Adjust the entry point if needed

  // Output configuration
  output: {
    path: path.resolve(__dirname, "public/dist"), // Output directory
    filename: "bundle.js", // Output file name
  },

  // Module rules for loaders
  module: {
    rules: [
      {
        test: /\.js$/, // Apply to .js files
        exclude: /node_modules/, // Exclude node_modules
        use: {
          loader: "babel-loader", // Use babel-loader
          options: {
            presets: ["@babel/preset-env"], // Use @babel/preset-env
          },
        },
      },
    ],
  },
  devtool: "cheap-module-source-map",
  // Mode configuration
  mode: "development", // Set to 'production' for production builds
};
