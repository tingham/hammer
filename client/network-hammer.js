define({

  load: function(name, req, onload, config) {
    req([name], function (value) {
      onload(value)
    })
  },

  getJson: (url) => {
    return network.get(url, "application/json")
  },

  getHtml: (url) => {
    return network.get(url, "text/html")
  },

  getText: (url) => {
    return network.get(url, "text/plain")
  },

  get: (url, type) => {
    return new Promise(function (resolve, reject) {
      let options = {}
      if (type) {
        options.contentType = type
      }

      fetch(url, options)
        .then(response => response.json())
        .then(packet => {
          if (packet.meta.response_type == "error") { 
            return reject(packet)
          }
          return resolve(packet)
        })
        .catch(e => {
          reject(e)
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

