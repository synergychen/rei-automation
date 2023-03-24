const fs = require('fs')
const path = require('path')

const jsFiles = getAllJsFiles('./src')
replacePaths('src/app.js', 'paths', jsFiles)

function getAllJsFiles(dirPath) {
  if (typeof fs.readdirSync !== 'function') return []
  const files = fs.readdirSync(dirPath, { withFileTypes: true })
  const jsFiles = files
    .filter((file) => file.isFile() && path.extname(file.name) === '.js')
    .map((file) => path.join(dirPath, file.name))
  const subDirs = files.filter((file) => file.isDirectory())
  for (const subDir of subDirs) {
    const subDirFiles = getAllJsFiles(path.join(dirPath, subDir.name))
    jsFiles.push(...subDirFiles)
  }
  return jsFiles
}

function replacePaths(filePath, variableName, paths) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err

    const regex = new RegExp(variableName + '\\s*=\\s*\\[([\\s\\S]*?)\\]', 'g')
    const match = regex.exec(data)
    if (match) {
      data = data.replace(
        match[0],
        `${variableName} = ${JSON.stringify(paths, null, 2)}`
      )
    } else {
      throw new Error(`Variable ${variableName} not found`)
    }

    fs.writeFile(filePath, data, 'utf8', (err) => {
      if (err) throw err
      console.log(`Variable ${variableName} replaced successfully`)
    })
  })
}
