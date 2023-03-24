// const fs = require('fs')
// const path = require('path')

// // Recursively read a directory and return all JavaScript files
// function getJavaScriptFiles(dir, filelist = []) {
//   const files = fs.readdirSync(dir)

//   files.forEach((file) => {
//     const filePath = path.join(dir, file)
//     if (fs.statSync(filePath).isDirectory()) {
//       getJavaScriptFiles(filePath, filelist)
//     } else if (path.extname(filePath) === '.js') {
//       filelist.push(filePath)
//     }
//   })

//   return filelist
// }

// // Dynamically require all JavaScript files in the current and subfolders
// const files = getJavaScriptFiles(__dirname)
// files.forEach((file) => {
//   const name = path.parse(file).name
//   module.exports[name] = require(file)
//   require(file)
// })

