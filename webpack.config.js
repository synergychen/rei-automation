// Import the necessary modules
const path = require('path')
const glob = require('glob')

// Export the webpack configuration
module.exports = {
  // Set the entry point to all JavaScript files in the `src` directory and its subdirectories
  entry: {
    app: glob.sync('./src/**/*.js').map((file) => `./${file}`)
  },
  // Define the output settings for the compiled JavaScript code
  output: {
    // Name the compiled JavaScript file `app.min.js`
    filename: 'app.min.js',
    // Set the output directory to the `dist` directory
    path: path.resolve(__dirname, 'dist'),
    // Specify that the compiled JavaScript code should be attached to the `window` object
    libraryTarget: 'window'
  }
}
