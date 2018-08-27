const TAG = "HAMMER"
const Hammer = require("./hammer.js")
const express = require("express")
const http = require("http")
const port = 10000
const ejs = require("ejs")

const app = express()

// Configure with options.
const hammer = new Hammer({
  app: app,
  viewerAcquisition: (req) => {
    return new Promise (function (resolve, reject) {
      // reject(new Error("Nobody here."))
      resolve({})
    })
  },
  viewerAcquisitionFailed: (res) => {
    res.end("nope")
  }
})

app.set('view engine', 'ejs')

app.use(Hammer.expressMiddleware(hammer))
app.use(Hammer.errorSupport(hammer))
app.use(Hammer.layoutSupport(hammer))
app.use(Hammer.dataSupport(hammer))
app.use(Hammer.viewerSupport(hammer))

app.route("/not-found")
  .get((req, res) => {
    log.a(TAG, "A")
    log.d(TAG, "D")
    log.i(TAG, "I")
    res.handleError(new Errors.NotFoundError())
  })

app.route("/layout")
  .get((req, res) => {
    res.present("test", {data: "This is a test."})
  })

app.route("/missing-layout")
  .get((req, res) => {
    res.layout = "bob"
    res.present("test", {data: "This is a test."})
  })

app.route("/missing-subview")
  .get((req, res) => {
    res.present("bob", {data: "This is a test."})
  })

app.route("/data")
  .get((req, res) => {
    res.data([{"test": "This is some data."}])
  })

app.route("/data-error")
  .get((req, res) => {
    res.data(new Errors.NotFoundError())
  })

app.route("/")
  .get((req, res) => {
    res.end("/")
  })

app.route("/partial")
  .get((req, res) => {
    res.present("partial", {data: "This is some data."})
  })

app.listen(port)
