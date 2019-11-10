var loading = document.querySelector(".app-shell-loading");
var loaded = document.querySelector(".app-shell-loaded");
var error = document.querySelector(".app-shell-error");
document.onreadystatechange = function () {
    if (document.readyState == "complete") { //当页面加载状态 
        var ua = navigator.userAgent;
        if (ua.indexOf('compatible') > -1 && ua.indexOf('MSIE') > -1) {
            if (loading !== null) {
                loading.className += ' app-shell-hide';
                // window.location.reload()
            }
            error.className = "app-shell-error";
        } else {
            loading.className += ' app-shell-hide';
            console.log(loaded.className);
            loaded.className = "app-shell-loaded";
        }
    }
}