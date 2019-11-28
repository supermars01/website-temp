import "common/js/common";
// import 'common/css/common.css';
import "./index.css";
// $(function () {

//     // $(".menu-link").click(function (e) {
//     //     e.preventDefault();
//     //     $(".menu").toggleClass("open");
//     //     $(".nav").toggleClass("open");
//     // });
//     $(".navbar-burger").click(function () {

//         // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
//         $(".navbar-burger").toggleClass("is-active");
//         $(".navbar-menu").toggleClass("is-active");

//     });

// });
$(function() {
  // Dropdowns
  var $dropdowns = getAll(".dropdown:not(.is-hoverable)");

  if ($dropdowns.length > 0) {
    $dropdowns.forEach(function($el) {
      $el.addEventListener("click", function(event) {
        event.stopPropagation();
        $el.classList.toggle("is-active");
      });
    });

    document.addEventListener("click", function(event) {
      closeDropdowns();
    });
  }

  function closeDropdowns() {
    $dropdowns.forEach(function($el) {
      $el.classList.remove("is-active");
    });
  }

  // navbar
  // Get all "navbar-burger" elements
  var $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  // Check if there are any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add a click event on each of them
    $navbarBurgers.forEach(function($el) {
      $el.addEventListener("click", function() {
        // Get the target from the "data-target" attribute
        var target = $el.dataset.target;
        var $target = document.getElementById(target);

        // Toggle the class on both the "navbar-burger" and the "navbar-menu"
        $el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }

  //get All()
  function getAll(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector), 0);
  }
});
