import "common/js/common";
// import "bulma-extensions/dist/js/bulma-extensions.min";
// import "style-loader!css-loader!bulma-extensions/dist/css/bulma-extensions.min.css";
// import "../../plugin/plugins/navbar";
//https://bulmajs.tomerbe.co.uk/    bulmajs 插件库 https://github.com/VizuaaLOG/BulmaJS
import Bulma from "@vizuaalog/bulmajs";
// import Navbar from "@vizuaalog/bulmajs/src/plugins/navbar";
// import Modal from "@vizuaalog/bulmajs/src/plugins/modal";
import "./bulmajs.css";
$(function() {
  document
    .querySelector("#example-modal-button-2")
    .addEventListener("click", function(e) {
      var modalTwo = Bulma.create("modal", {
        element: document.querySelector("#modal-example-2"),
        buttons: [
          {
            label: "Save changes",
            classes: ["button", "is-success"],
            onClick: function() {
              alert("Save button pressed");
            }
          },
          {
            label: "Close",
            classes: ["button", "is-danger", "is-outline"],
            onClick: function() {
              alert("Close button pressed");
            }
          }
        ]
      });

      modalTwo.open();
    });
});
