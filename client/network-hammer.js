define({

  load: function(name, req, onload, config) {
    req([name], function (value) {
      onload(value)
    })
  },

  get: (url, type) => {
    return new Promise(function (resolve, reject) {
      let request = {url}
      if (type) {
        request.contentType = type
      }

      // Instead of returning the jquery object we resolve|reject a normal promise.
      $.ajax(request).done(response => {
        // TODO: maybe unpack it here?
        if (response.meta.response_type == "error") { 
          return reject(response)
        }
        return resolve(response)
      })
    })
  },

  post:  (url, type, data) => {
    return new Promise(function (resolve, reject) {
      let request = {url, data}
      if (type) {
        request.contentType = type
      }
      request.method = "POST"

      // Instead of returning the jquery object we resolve|reject a normal promise.
      $.ajax(request).done(response => {
        // TODO: maybe unpack it here?
        if (response.meta.response_type == "error") { 
          return reject(response)
        }
        return resolve(response)
      })
    })
  }
})

