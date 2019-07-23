const TAG = "Log"

var colors = require("colors")
var path = require("path")
var _ = require("lodash")
var moment = require("moment")
var last_error_send = new moment(new Date())
const separator = "‖ "
const logdir = path.dirname(path.dirname(require.main.filename)) + "/logs/"

//for (let i = 0; i < 256; i++) {
//  console.log("\x1b[38;5;" + i + "mCOLOR TEXT " + i + "\x1b[0m")
//}
//
//console.log("\x1b[0m")

var service = {
  app: null,
  last_log_location: -1,
  longest_line: 0,

  globalize: true,

  n: function () {
    let tag = ""
    let message = ""
    let session = false

    if (arguments.length > 1) {
      tag = arguments[0]
      _.each(arguments,
        function (arg, index) {
          if (arg.hasOwnProperty("session")) {
            session = arg.session.id
          } else {
            if (index > 1) {
              if (typeof(arg) == typeof({})) {
                arg = JSON.stringify(arg, null, 2)
              }
              message = message + " " + arg
            }
          }
        })
    }
    else {
      message = arguments[0]
    }
    let stamp = moment().format()
    require("fs").appendFile(`${logdir}${session}.log`, `${stamp}\t${tag}\t${message}\n`, {encoding: "utf8"}, (e) => {
      if (e) {
        console.error(e)
      }
    })
  },

  d: function () {
    var tag = ""
    var message = ""
    if (arguments.length > 1) {
      tag = arguments[0].yellow
      _.each(arguments,
        function (arg, index) {
          if (index > 0) {
            if (typeof(arg) == typeof({})) {
              arg = JSON.stringify(arg)
            }
            message = message + " " + arg
          }
      })
      message = message.bgBlack.green
    }
    else {
      message = arguments[0]
    }
    service.log(tag + "(" + service.location(tag) + "): " + message) 
  },
  a: function () {
    // TODO: Database
    var tag = ""
    var message = ""
    if (arguments.length > 1) {
      tag = arguments[0].yellow
      _.each(arguments,
        function (arg, index) {
          if (index > 0) {
            //if (typeof(arg) == typeof({})) {
            //  arg = JSON.stringify(arg)
            //}
            message = message + separator + arg
          }
      })
      message = message.blue
      if (arguments[0] == "GET") {
        service.log(tag + message)
      }
      else {
        service.log(tag + "(" + service.location(tag) + ")" + message) 
      }
    }
    else {
      message = arguments[0].blue
      service.log("(" + service.location(tag) + "): " + message) 
    }
  },
  i: function () {
    // TODO: Database
    var tag = ""
    var message = ""
    if (arguments.length > 1) {
      tag = arguments[0].yellow
      _.each(arguments,
        function (arg, index) {
          if (index > 0) {
            if (typeof(arg) == typeof({})) {
              arg = JSON.stringify(arg)
            }
            message = message + " " + arg
          }
      })
      message = message.cyan
      if (arguments[0] == "GET") {
        service.log(tag + message)
      }
      else {
        service.log(tag + "(" + service.location(tag) + "): " + message) 
      }
    }
    else {
      message = arguments[0].cyan
      service.log("(" + service.location(tag) + "): " + message) 
    }
  },
  w: function () {
    var tag = ""
    var message = ""
    let stack = ""
    let code = ""

    if (arguments.length > 1) {
      tag = arguments[0].magenta
      _.each(arguments,
        function (arg, index) {
          if (index > 0) {
            console.log(arg instanceof Error)
            if (arg instanceof Error) {
              if (arg.hasOwnProperty("stack") && arg.hasOwnProperty("message")) {
                stack = stack + arg.stack + "\n"
                arg = arg.message
                line = arg.line
                code = code + " " + arg.code
              }
              else {
                arg = JSON.stringify(arg)
              }
            }
            message = message + " " + arg
          }
      })

      let body = message 
      service.log(tag + "(" + service.location(tag) + "): " + message.red) 
      if (code) {
        console.log("\tERROR CODE: ".yellow + code.red)
        body = body + "\n" + "CODE: " + code
      }
      if (stack) {
        console.log("\tSTACKTRACE\n".yellow + stack.red)
        body = body + "\n" + "STACKTRACE\n" + stack
      }
      else {
        console.log("\tNO STACKTRACE")
        body = body + "\nNO STACKTRACE"
      }
    }
    else {
      message = arguments[0].red
      service.log("(" + service.location(tag) + "): " + message) 
    }
  },

  error: function (message) {
    console.error(message)
  },

  log: function (message) {
    var date = new Date()
    var tt = moment(date).format("YYYY-MM-DDTHH:mm:ss.s")
    console.log(tt + " " + message)
  },

  location: function (tag, colorize = true) {
    // NOTE: This is so ugly my grandmother feels bad.
    var err = new Error()
    var parts = err.stack.split("\n ")
    let result = "nil"

    if (parts.length >= 3) {
      var res = parts[3].trim()
      var file = path.basename(res)
      var dir = path.basename(res.replace(file, "")).replace(")", "")
      // TODO replace with regex
      let loc = (file).replace(")", "")

      let line = parseInt(loc.split(":")[1], 10)
      // console.log("bob", service.last_log_location, line, "[", Math.abs(service.last_log_location - line), "]")

      if (tag) {
        result = line.toString()

        let tooLong = false

        if (result.length > 4) {
          tooLong = true
        }

        if (service.longest_line < result.length) {
          service.longest_line = result.length
        }


        while (result.length < service.longest_line) {
          result = "·" + result
        }

        if (tooLong) {
          result = colorize ? result.red : result
        } else {
          result = colorize ? "\x1b[38;5;34m" + result + "\x1b[0m" : result
        }

      } else {
        result = (file).replace(")", "")
      }

      service.last_log_location = Math.abs(service.last_log_location - line)
    }
    return result
  },

  // Returns a handler to tell us where an unlinked exception has occurred with a
  // slightly less than useful stack trace.
  registerUnhandledExceptionDispatch: function (TAG) {
    return function (a, b) {
      var err = new Error()
      if (!_.isEmpty(a)) {
        log.w(TAG, a)
      }
      if (!_.isEmpty(b)) {
        log.w(TAG, b)
      }
      var stack = err.stack.split("\n")
      _.each(
        stack,
        function (s, index) {
          log.w(TAG, index, s)
      })
    }
  }
}

module.exports = service 
