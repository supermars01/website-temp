// import 'lib-flexible';
import 'assets/js/loading'
(function (doc, win) {
    var docEl = win.document.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var clientWidth = window.screen && screen.width;
    console.log("in" + clientWidth)
    if (!metaEl && clientWidth < 768) {

        metaEl = doc.createElement('meta');
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no,viewport-fit=cover');
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }
})(document, window)