import 'common/js/common';
import 'common/css/common.css';
import './index.css';
$(function () {

    $(".menu-link").click(function (e) {
        e.preventDefault();
        $(".menu").toggleClass("open");
        $(".nav").toggleClass("open");
    });

});