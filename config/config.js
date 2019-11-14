/**
 * 全局配置文件
 */

// 项目中的html文件，不需要后缀
const HTMLDirs = [
  'test',
  "animations",
  "index1",
  "index"
]
const devServer = {
  port: 8080,
  contentBase: '../dist',
  open: true,
  openPage: `/${HTMLDirs[0]}.html`
}
module.exports = {
  HTMLDirs,
  devServer
}