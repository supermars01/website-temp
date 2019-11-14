// import {
//     WOW
// } from 'wowjs'
var loading = document.querySelector(".app-shell-loading");
var loaded = document.querySelector(".app-shell-loaded");
var error = document.querySelector(".app-shell-error");
document.onreadystatechange = function () {
    if (document.readyState == "complete") { //当页面加载状态 
        var ua = navigator.userAgent;
        if (ua.indexOf('compatible') > -1 && ua.indexOf('MSIE') > -1) {
            if (loading !== null) {
                loading.className += ' app-shell-hide';
                new WOW({
                    offset: 0, //到元件距离触发动画时（默认值为0） 
                    live: true, //对异步加载的内容执行操作（默认为true）
                    callback: function (box) {
                        console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
                    },
                    // scrollContainer: '#main' //可选的滚动容器选择器，否则使用window 
                }).init()
                // window.location.reload()
            }
            error.className = "app-shell-error";
        } else {
            loading.className += ' app-shell-hide';
            console.log(loaded.className);
            loaded.className = "app-shell-loaded";
            new WOW({
                offset: 0, //到元件距离触发动画时（默认值为0） 
                live: true, //对异步加载的内容执行操作（默认为true）
                callback: function (box) {
                    console.log("WOW: animating <" + box.tagName.toLowerCase() + ">")
                },
                // scrollContainer: '#main' //可选的滚动容器选择器，否则使用window 
            }).init()
        }
    }
}