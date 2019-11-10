/**
 * postcss配置文件
 */
module.exports = {
  plugins: {
    'autoprefixer': {
      //是否美化属性值 默认：true
      cascade: true,
      //是否去掉不必要的前缀 默认：true
      remove: true
    },
    //"postcss-import": {},
    //"postcss-url": {},
    //"postcss-aspect-ratio-mini": {},
    // "postcss-write-svg": {
    //   utf8: false
    // },
    // "postcss-preset-env": {},
    // "postcss-px-to-viewport": {
    //   viewportWidth: 750, // (Number) The width of the viewport.
    //   viewportHeight: 1334, // (Number) The height of the viewport.
    //   unitPrecision: 3, // (Number) The decimal numbers to allow the REM units to grow to.
    //   viewportUnit: 'vw', // (String) Expected units.
    //   selectorBlackList: ['.ignore', '.hairlines'], // (Array) The selectors to ignore and leave as px.
    //   minPixelValue: 1, // (Number) Set the minimum pixel value to replace.
    //   mediaQuery: false // (Boolean) Allow px to be converted in media queries.
    // },
    "postcss-plugin-px2rem": {
      rootValue: 75, //换算基数， 默认100  ，这样的话把根标签的字体规定为1rem为50px,这样就可以从设计稿上量出多少个px直接在代码中写多上px了。
      //unitPrecision: 5, //允许REM单位增长到的十进制数字。
      //propWhiteList: [], //默认值是一个空数组，这意味着禁用白名单并启用所有属性。
      //propBlackList: [], //黑名单
      mediaQuery: false, ////（布尔值）允许在媒体查询中转换px。
      exclude: "/node_modules/i", //默认false，可以（reg）利用正则表达式排除某些文件夹的方法，例如/(node_module)/ 。如果想把前端UI框架内的px也转换成rem，请把此属性设为默认值
      selectorBlackList: ['html'] //比如selectorBlackList: ['.icon-'] // 过滤掉.icon-开头的class，不进行rem转换
      //selectorBlackList: ['html', 'mint-', 'mt-', 'mpvue-', 'calendar', 'iconfont'], //要忽略并保留为px的选择器
      //ignoreIdentifier: false, //（boolean/string）忽略单个属性的方法，启用ignoreidentifier后，replace将自动设置为true。
      //minPixelValue: 3 //设置要替换的最小像素值(3px会被转rem)。 默认 0
    },
    "postcss-viewport-units": {},
    "cssnano": {
      preset: "advanced",
      autoprefixer: false,
      "postcss-zindex": false
    }
  }
}