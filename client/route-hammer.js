
define({
  TAG: "Route",
  routes: {},

  load: function(name, req, onload, config) {
    req([name], function (value) {
      onload(value)
    })
  },

  get: function (string_route, method) {
    this.routes[string_route] = method
  },

  route: function (params) {
    let string_route = document.location.pathname

    console.log(this.TAG, string_route)

    // Currently supports static routes
    if (this.routes.hasOwnProperty(string_route)) {
      this.routes[string_route](params)
    }
    else {
      this.no_route(params)
    }
  },

  no_route: (params) => {
    console.log("No Route", params)
  },

})
