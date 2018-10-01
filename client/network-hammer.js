define({

  load: function(name, req, onload, config) {
    req([name], function (value) {
      onload(value)
    })
  },

  getJson: (url) => {
    return network.get(url, "application/json").then(response => response.json())
  },

  getHtml: (url) => {
    return network.get(url, "text/html").then(response => response.text())
  },

  getText: (url) => {
    return network.get(url, "text/plain").then(response => response.text())
  },

  get: (url, type) => {
    let options = {}
    if (type) {
      options.contentType = type
    }

    return fetch(url, options)
  },

  postJson: (url, body) => {
    network.post(url, "application/json", body)
  },

  post:  (url, type, body) => {
    let options = {data}
    if (type) {
      options.headers["Content-Type"] = type
    }
    options.method = "POST"

    return fetch(url, options)
  }
})

