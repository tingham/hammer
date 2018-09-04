const TAG = "Hammer"
const default_options = {
  errorsDirectory: `${__dirname}/errors/`,
  viewsDirectory: `${__dirname}/views/`,
  viewerAcquisition: null,
  viewerAcquisitionFailed: null,
  app: null,
  log_level: 1
}

const fs = require("fs")
const path = require("path")
const colors = require("colors")
const moment = require("moment")
const _ = require("lodash")
const express = require("express")

class Hammer {

  constructor (options) {
    this._bag = {}
    // this.options = Object.assign(default_options, options)
    this.options = default_options

    Object.keys(default_options).forEach(key => {
      if (options.hasOwnProperty(key)) {
        this.options[key] = options[key]
        console.log(TAG, "Set", key)
      }
    })

    let errors = {}
    let errorsDirectory = `${this.options.errorsDirectory}`

    fs.readdirSync(errorsDirectory).filter(dir => dir.indexOf(".js") > -1).forEach(errfile => {
      errors[path.basename(errfile, ".js")] = require(`${errorsDirectory}${errfile}`)
      console.log("Loaded",`${errorsDirectory}${errfile}`) 
    })

    global['Errors'] = errors

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

    // About to auto-route some stuff.
    if (!options.hasOwnProperty("app")) {
      log.w(TAG, new Errors.HammerRequiresError())
      process.exit(1)
    }

    this.options.app.use(Hammer.errorSupport(this))
    this.options.app.use(Hammer.layoutSupport(this))
    this.options.app.use(Hammer.dataSupport(this))
    this.options.app.use(Hammer.viewerSupport(this))
    this.bag()

    log.a(TAG, "Setup Complete", this)
  }

  // Provisions access to the /bag directory for js|css
  bag () {
    let bag_router = express.Router()
    bag_router.get("/:file", (req, res) => {
      let path = `${__dirname}/client/${req.params.file.replace(/\.js/g, '')}-hammer.js`

      if (this._bag.hasOwnProperty(path)) {
        return res.end(this._bag[path])
      }

      if (fs.existsSync(path)) {
        log.i(TAG, req.params.file, "Exists")
        fs.readFile(path, 'utf8', (err, data) => {
          if (err) {
            log.w(TAG, err)
          }
          this._bag[path] = data
          return res.end(data)
        })
      }
      else {
        res.handleError(new Errors.NotFoundError())
      }
    })

    this.options.app.use("/bag", bag_router)
    log.a(TAG, "Bag Enabled")
  }

  static viewerSupport (_instance) {
    log.a(TAG, "Viewer Support")
    return (req, res, next) => {

      if (_instance.options.viewerAcquisition == null ||
          !req.hasOwnProperty("session")) {
        if (_instance.log_level > 1) {
          log.d(TAG, "No viewerAcquisition or session")
        }
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
    log.a(TAG, "Layout Support")
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

        let consumerLayoutPath = `${_instance.options.app.get("views")}/${_locals.layout}`
        let layoutPath = `${_instance.options.viewsDirectory}${_locals.layout}`

        let consumerViewPath = `${_instance.options.app.get("views")}/${view}`
        let viewPath = `${_instance.options.viewsDirectory}${view}`

        if (!fs.existsSync(layoutPath)) {
          return res.end("Cannot find layout. " + layoutPath)
        }

        if (!fs.existsSync(viewPath)) {
          return res.end("Cannot find view. " + viewPath)
        }

        _locals.res = res
        _locals.req = req

        let previousViewsPath = _instance.options.app.get("views")

        if (!fs.existsSync(consumerViewPath)) {
          _instance.options.app.set("views", _instance.options.viewsDirectory)
        }
        localRender.call(res, view, _locals, (err, str) => {
          if (err) {
            log.w(TAG, err)
          }
          _locals.body = str
          if (!fs.existsSync(consumerLayoutPath)) {
            _instance.options.app.set("views", _instance.options.viewsDirectory)
          }
          localRender.call(res, _locals.layout, _locals, callback)
          _instance.options.app.set("views", previousViewsPath)
        })
      }
      next()
    }
  }

  // Handles typed errors
  static errorSupport (_instance) {
    log.a(TAG, "Error Support")
    return (req, res, next) => {
      res.handleError = (err) => {
        let error_class = Object.keys(Errors).filter(error_class => err instanceof Errors[error_class])
        if (error_class.length == 1) {
          return res.status(err.code).present(err.code.toString(), {err})
        }
        return res.status(500).present("500", {err})
      }
      next()
    }
  }

  // Encapsulates responses
  // Data can be an instance or an array.
  // Error is singular
  static dataSupport (_instance) {
    log.a(TAG, "Data Support")
    return (req, res, next) => {
      res.data = (data) => {
        let meta = {}

        if (data instanceof Error) {
          meta.response_type = "error"
          data = {
            name: data.constructor.name,
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
