define(function (require) {
  let network = require("network")

  let router = require("route")

  router.get("/layout", () => {

    network.get("/data").then(response => {
      $("body").append($("<div>" + JSON.stringify(response.data) + "</div>"));
    }).catch(err => {
      $("body").append($("<div>" + JSON.stringify(err.data) + "</div>"));
    })

    network.post("/data").then(response => {
      $("body").append($("<div>" + JSON.stringify(response.data) + "</div>"));
    }).catch(err => {
      $("body").append($("<div>" + JSON.stringify(err.data) + "</div>"));
    })

    network.get("/data-error").then(response => {
      $("body").append($("<div>" + JSON.stringify(response.data) + "</div>"));
    }).catch(err => {
      $("body").append($("<div>" + JSON.stringify(err.data) + "</div>"));
    })

    network.post("/data-error").then(response => {
      $("body").append($("<div>" + JSON.stringify(response.data) + "</div>"));
    }).catch(err => {
      $("body").append($("<div>" + JSON.stringify(err.data) + "</div>"));
    })

    $("[data-toggle=clipboard]").each(function () {
      var control = $(this);
      control.click(function () {
        clipboard.copy("bobjones");
      });
    });
  })

  router.route()

  return network
})
