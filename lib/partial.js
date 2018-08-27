const TAG = "Partial"
const ejs = require("ejs")
const fs = require("fs")

module.exports = (hammer) => {
  return function partial (viewname, data) {
    this.globalize = true

    if (viewname.indexOf(".ejs") == -1) {
      viewname += ".ejs"
    }

    let templatepath = `${hammer.options.viewsDirectory}${viewname}`
    if (fs.existsSync(templatepath)) {
      let template = fs.readFileSync(templatepath, 'utf8').toString()
      return ejs.render(template, data)
    }
    else {
      return JSON.stringify(data)
    }
  }
}
