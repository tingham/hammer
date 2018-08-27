const TAG = "Hammer"
const default_options = {
  errorsDirectory: `${__dirname}/errors/`,
  viewsDirectory: `${__dirname}/views/`,
  viewerAcquisition: null,
  viewerAcquisitionFailed: null
}

const fs = require("fs")
const path = require("path")
const colors = require("colors")
const moment = require("moment")
const _ = require("lodash")

class Hammer {

  constructor (options) {
    // this.options = Object.assign(default_options, options)
    this.options = default_options
    Object.keys(default_options).forEach(key => {
      if (options.hasOwnProperty(key)) {
        this.options[key] = options[key]
        console.log(TAG, "Set", key)
      }
    })

    const libDir = `${__dirname}/lib/`
    fs.readdirSync(libDir).filter(file => ".js").forEach(file => {
      let obj = require(`${libDir}${file}`)
      let name = path.basename(file, ".js")

      if ((typeof obj === "function") || (obj.globalize)) {

        // Always globalize function libs
        if (typeof obj === "function") {
          obj = obj(this)
        }

        global[name] = obj
      }
      else {
        this.options[name] = obj
      }
    })
  }

  static expressMiddleware (_instance) {
    return (req, res, next) => {
      console.log(TAG, "Middleware Initialized")
      console.log(_instance)
      next()
    }
  }

  static viewerSupport (_instance) {
    return (req, res, next) => {

      if (_instance.options.viewerAcquisition == null ||
          !req.hasOwnProperty("session")) {
        log.a(TAG, "No viewerAcquisition or session")
        return next()
      }

      _instance.options.viewerAcquisition().then(viewer => {
        req.session.viewer = viewer
        next()
      }).catch(e => {
        log.w(TAG, e)
        if (_instance.options.viewerAcquisitionFailed) {
          _instance.options.viewerAcquisitionFailed(res)
        }
      })

    }
  }

  // Provides support for specifying a locals.layout
  // Provides `present()` method
  static layoutSupport (_instance) {
    return (req, res, next) => {
      const localRender = res.render


      res.present = function (view, locals, callback) {
        let _locals = Object.assign({}, locals)
        _locals = Object.assign(_locals, res.locals)
        _locals.layout = res.layout || "layout"

        if (_locals.layout.indexOf(".ejs") == -1) {
          _locals.layout += ".ejs"
        }

        if (view.indexOf(".ejs") == -1) {
          view += ".ejs"
        }

        let layoutPath = `${_instance.options.viewsDirectory}${_locals.layout}`
        if (!fs.existsSync(layoutPath)) {
          return res.end("Cannot find layout. " + layoutPath)
        }

        let viewPath = `${_instance.options.viewsDirectory}${view}`
        if (!fs.existsSync(viewPath)) {
          return res.end("Cannot find view. " + viewPath)
        }

        _locals.res = res
        _locals.req = req

        localRender.call(res, view, _locals, (err, str) => {
          if (err) {
            log.w(TAG, err)
          }
          _locals.body = str
          localRender.call(res, _locals.layout, _locals, callback)
        })
      }

      console.log(TAG, "Layout Support Initialized")
      next()
    }
  }

  // Handles typed errors
  static errorSupport (_instance) {
    console.log(_instance)

    let errors = {}
    let errorsDirectory = `${_instance.options.errorsDirectory}`

    fs.readdirSync(errorsDirectory).filter(dir => dir.indexOf(".js") > -1).forEach(errfile => {
      errors[path.basename(errfile, ".js")] = require(`${errorsDirectory}${errfile}`)
      console.log("Loaded",`${errorsDirectory}${errfile}`) 
    })

    global['Errors'] = errors

    return (req, res, next) => {


      res.handleError = (err) => {
        let error_class = Object.keys(Errors).filter(error_class => err instanceof Errors[error_class])
        if (error_class.length == 1) {
          return res.status(err.code).present(err.code.toString(), {err})
        }
        return res.status(500).present("500", {err})
      }

      console.log(TAG, "Error Support Initialized")
      next()
    }
  }

  // Encapsulates responses
  // Data can be an instance or an array.
  // Error is singular
  static dataSupport (_instance) {
    return (req, res, next) => {
      res.data = (data) => {
        let meta = {}

        if (data instanceof Error) {
          meta.response_type = "error"
          data = {
            code: data.code ? data.code : 0,
            message: data.message
          }
        }
        else {
          meta.response_type = "data"
        }

        if (data instanceof Array) {
          meta.content = "array"
        }
        else {
          meta.content = "object"
        }

        return res.json({meta, data})
      }
      next()
    }
  }
}

module.exports = Hammer
