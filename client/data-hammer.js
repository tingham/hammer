define({
  debug: true,
  empty: function (f) {
    if (typeof f == "undefined") {
      return true
    }
    if (!(f instanceof Array) && f.length == 0) {
      return true
    }
    return false
  },
})
