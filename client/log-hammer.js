define({
  TAG: "Log General",
  debug: true,
  routes: {},

  load: function(name, req, onload, config) {
    return onload(name)
  },

  a: function (TAG, message) {
    this.print(message ? TAG : this.tag, message)
  },

  d: function (TAG, message) {
    if (this.debug) {
      this.print(message ? TAG : this.TAG, message ? message : TAG)
    }
  },

  print: function (TAG, message) {
    console.log(TAG, message)
  }

})
