var clipboard = null
var TAG = "Application"

requirejs.config({
  baseUrl: "bag",
})

requirejs(["main"])
requirejs(["data", "clipboard", "log"], function (config, clipboard, log) {

  log.debug = config.debug

  window.clipboard = clipboard
  window.log = log

  log.a(TAG, "Application Startup")
  log.d(TAG, "Applicaiton Debug")

})
