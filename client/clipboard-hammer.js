
define({
  TAG: "Clipboard",

  load: function(name, req, onload, config) {
    req([name], function (value) {
      onload(value)
    })
  },

  copy: (strVal) => {
    console.log(strVal);
    let aux = document.createElement("input");
    aux.setAttribute("id", "bob");
    aux.setAttribute("value", strVal);
    document.body.appendChild(aux);
    aux.select();
    document.execCommand("copy");
    document.body.removeChild(aux);
  }
})
