const TAG = "String Service"
const service = {
  globalize: true,

  // Replaces all instances of b, in a, with c.
  //
  replace: (a, b, c) => {
    if (typeof a != "undefined") {
      let r = new RegExp("/" + b + "/g")
      return a.replace(r, c)
    }
    return ""
  },

  // Fetches a string safely as to not return "undefined"
  // Additionally will fetch a named property `b` from an object `a` in a similar fashion.
  //
  safe: (a, b) => {
    if (b) {
      if (typeof a != "undefined" && a.hasOwnProperty(b)) {
        return a[b]
      }
    }
    else {
      if (typeof a != "undefined") {
        return a
      }
    }

    return ""
  }
}
module.exports = service


