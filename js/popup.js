$(function() {
  const SPINNER = `
  <div class="d-flex justify-content-center m-3">
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  `
  const FNS = {
    "add": (...args) => args.reduce((acc, cur) => Number(acc) + Number(cur), 0),
    "sub": (a, b) => Number(a) - Number(b),
    "mul": (...args) => args.reduce((acc, cur) => Number(acc) * Number(cur), 1),
    "div": (a, b) => Number(a) / Number(b),
    "mod": (a, b) => Number(a) % Number(b),
    "int": (x) => parseInt(x), 
    "and": (...args) => args.reduce((acc, cur) => Boolean(acc) && Boolean(cur), true),
    "or": (...args) => args.reduce((acc, cur) => Boolean(acc) || Boolean(cur), false),
    "randomInt": (max) => Math.floor(Math.random() * parseInt(max)),
    "JSONstringify": (...args) => JSON.stringify(...args),
    "JSONparse": (...args) => JSON.parse(...args),
    "timestampToLocale": (ts) => (new Date(Number(ts) * 1000)).toLocaleDateString(),
  }

  async function fetchAPI(url, options={}) {
    try {
      const res = await fetch(url, options)
      return await res.json()
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  function isObj(x) {
    return typeof x === 'object' && !Array.isArray(x) && x !== null
  }
  
  function isArray(x) {
    return Array.isArray(x) && x !== null
  }
  
  function isJsonStr(str) {
    var x
    try { x = JSON.parse(str) } 
    catch (e) { return false }
    if ((typeof x === "object" || Array.isArray(x)) && x !== null) return true
    return false
  }

  function accessObj(obj, str) {
    // vstr="temperature.data[0].place" -> value of obj.temperature.data[0].place
    return str.replace(/\[([0-9]+)\]/g, '.$1').split('.').reduce((o, i) => {
      if (isJsonStr(o[i])) return JSON.parse(o[i])
      else return o[i]
    }, obj)
  }

  function preprocObjPath(vars, data, str) {
    return str.replace(/\[(.+?)\]/g, (m, g1) => {
      return `[${parseDollarData(vars, data, g1)}]`
    })
  }

  function parseDollarData(vars, data, str) {
    str = str.replace(/\$([a-zA-Z_][a-zA-Z_0-9]*?)\.(.+)/g, (m, g1, g2) => {
      g2 = preprocObjPath(vars, data, g2)
      if (g1 == 'data') {           // access data/vars obj
        var x = accessObj(data, g2)
        if (isObj(x) || isArray(x)) x = JSON.stringify(x)
        return x
      }
      else if (g1 == 'vars') {
        var x = accessObj(vars, g2)
        if (isObj(x) || isArray(x)) x = JSON.stringify(x)
        return x
      }
      return m  // return orginal matched string if not above
    })	
    if (str == '$data') return data	// if only $data, return data
    else return str
  }

  function parseVarsStr(vars, data, strs) {
    strs.forEach(declare => {
      const [name, value] = declare.split('=')
      vars[name] = parseEval(vars, data, value)
    })
    return vars
  }

  function parseEval(vars, data, str) {
    if ((str.match(/\(/g) || []).length != (str.match(/\)/g) || []).length) {
      console.log(`${str}: Number of ( and ) does not match`)
      return
    }
    // regex = /(\((?:\1??[^\(]*?\)))+/g                    // (add, 1, 2)
    regex = /([a-zA-Z_][a-zA-Z_0-9]*\((?:\1??[^\(]*?\)))+/g // add(1, 2)
    var newStr = str.replace(regex, (matched) => {
      const fn = matched.split(/[\(\),\s]/).filter(x => x)
      const fnName = fn[0]
      const fnParams = fn.slice(1)
      // parse params if have access to $data/$vars
      for (let i = 0; i < fnParams.length; i++) {
        fnParams[i] = parseDollarData(vars, data, fnParams[i])
        // console.log(`\tparam[${i}]: ${fnParams[i]}`)
      }
      var result = FNS[fnName](...fnParams)
      if (isObj(result) || isArray(result)) 
        result = JSON.stringify(result)
      return result
    })
    // console.log("eval:", newStr)
    if (newStr.includes('(')) {
      newStr = parseEval(vars, data, newStr)
    }
    return parseDollarData(vars, data, newStr)
  }

  function parseLoop(data, str, forvars={}) {
    // ([\S\n\t\v ]+): match group that contains anything including tabs and newline
    var newHtml = str.replace(/<for (.+)>([\S\n\t\v\s]+)<\/for>/g, (m, g1, g2) => {
      // 1. parse for loop args
      var args = {"from": 0, "step": 1}
      g1.split(' ').forEach(arg => {
        let [name, value] = arg.split('=')
        value = value.replace(/^"(.+)"$/, (m, g1) => g1)	// remove quotes
  
        if (name == "of") {
          // parse $for in nested <for> tag, $vars=forvars in parseLoop() is storing $for variables
          value = value.replace(/\$for/g, '$vars')	
          const x = JSON.parse(parseEval(forvars, data, value))
          args.items = isObj(x)? Object.entries(x) : x
          args.to = args.items.length
        }
        else if (name == "from")
          args.from = Number(parseEval(forvars, data, value))
        else if (name == "to")
          args.to = Number(parseEval(forvars, data, value))
        else if (name == "step")
          args.step = Number(parseEval(forvars, data, value))
      })
      // 2. for loop
      var subHtml = ''
      for (let i=args.from; i<args.to; i+=args.step) {
        let nestedVars = {"i": i, "item": args.items? args.items[i] : null}
        let curSubHtml = parseLoop(data, g2, nestedVars)
        // 3. parse $for inside the html content
        // [\w\.]+ : match any words and numbers and dots
        // (\[[^\]]+\])* : match square brackets if any
        // [\w\.]* : match any words and numbers and dots after square brackets if any
        subHtml += curSubHtml.replace(/\$for\.([\w\.]+(\[[^\]]+\])*[\w\.]*)/g, (m, g1) => accessObj(nestedVars, g1))
      }
      return subHtml
    })
    return newHtml
  }

  function updateStorage(storageKey, obj, cb=()=>{}) {
    chrome.storage.local.get(storageKey, (data) => {
      data = data[storageKey]
      const newData = Object.assign(data || {}, obj)
      chrome.storage.local.set({[storageKey]: newData}, cb)
    })
  }

  function removeStorage(storageKey, key, cb=()=>{}) {
    chrome.storage.local.get(storageKey, (data) => {
      data = data[storageKey]
      delete data[key]
      chrome.storage.local.set({[storageKey]: data}, cb)
    })
  }

  function loadCard(id, data, cardElem=null) {
    let {name, url, html, options} = data
    if (!cardElem)
      cardElem = $(`<div id="${id}" class="card mb-2"></div>`).appendTo('#card-container')
    else
      cardElem.empty()

    var editBtn = ''
    if (window.location.toString().startsWith(chrome.runtime.getURL("html/main.html"))) {
      editBtn = `
      <button id="${id}-edit" type="button" class="btn btn-sm btn-light">
        <i class="bi bi-pencil-square"></i>
      </button>
      `
    }
    cardElem.append(`
    <div class="card-header">
      <div class="d-flex align-items-center">
        <div id="${id}-name" class="me-auto">${name || ''}</div>
        <div>
          ${editBtn}
          <button id="${id}-up" type="button" class="btn btn-light btn-sm">
            <i class="bi bi-caret-up-fill"></i>
          </button>
          <button id="${id}-down" type="button" class="btn btn-light btn-sm">
            <i class="bi bi-caret-down-fill"></i>
          </button>
          <button id="${id}-refresh" type="button" class="btn btn-light btn-sm">
            <i class="bi bi-arrow-clockwise"></i>
          </button>
          <button id="${id}-remove" type="button" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
    </div>
    `)
    var cardBodyElem = $('<div class="card-body overflow-auto"></div>').appendTo(cardElem)
    cardBodyElem.append(SPINNER)

    function fn() {
      if (url && url.replaceAll(' ', '')) {
        fetchAPI(url, options)
        .then(res => {          
          // 1. parse loop statements
          var newHtml = parseLoop(res, html)
          // console.log("newHtml", newHtml)
          var vars = {} // local vars for this card
          newHtml = newHtml.replace(/{(.+?)}/g, (m, g1) => {
            var evalStr = g1
            // 2. declare variables
            if (g1.includes(';')) {
              const splited = g1.split(';').map(x => x.trim())
              const varsStrs = splited.slice(0, -1)
              evalStr = splited[splited.length-1]
              vars = Object.assign(vars, parseVarsStr(vars, res, varsStrs))
            }
            // 3. evaluate statement
            return parseEval(vars, res, evalStr)
          })
          console.log("final vars:", vars)
          cardBodyElem.empty().append(newHtml)
        })
      } else {  // url is empty
        cardBodyElem.empty().append(html)
      }
    }
    $(`#${id}-refresh`).off("click")
    $(`#${id}-refresh`).on('click', fn)
    $(`#${id}-remove`).on('click', () => removeCard(id))
    $(`#${id}-edit`).on('click', () => editCard(id))
    $(`#${id}-up`).on('click', () => moveCard(id, true))
    $(`#${id}-down`).on('click', () => moveCard(id, false))
    fn()
  }

  function addCard(data) {
    const id = `id-${Date.now()}`
    data.html = data.html.replace(/id="(.+)"/g, `id="${id}-$1"`) // id="abc" -> id="id-123123-abc"
    data.order = $('#card-container').children().length
    updateStorage('card_info', {[id]: data})
    loadCard(id, data)
  }

  function updateCard(id, data) {
    data.order = $(`#${id}`).index()
    updateStorage('card_info', {[id]: data})
    loadCard(id, data, $(`#${id}`))
  }

  function removeCard(id) {
    var nextIds = []
    var nextCard = $(`#${id}`).next()
    while (nextCard.length == 1) {
      nextIds.push(nextCard.attr('id'))
      nextCard = nextCard.next()
    }
    
    console.log(nextIds)
    if (nextIds) {
      chrome.storage.local.get('card_info', (data) => {
        data = data['card_info']
        delete data[id]
        for (const nextId of nextIds)
          data[nextId].order -= 1
        chrome.storage.local.set({'card_info': data}, () => {})
      })
    }
    $(`#${id}`).remove()
  }

  function editCard(id) {
    chrome.storage.local.get('card_info', (data) => {
      data = data['card_info'][id]
      $('#edit-card-id').val(id)
      $('#in-name').val(data.name)
      $('#in-api-url').val(data.url)
      $('#in-api-method').val(data.options.method)
      $('#in-api-mode').val(data.options.mode)
      $('#in-api-cache').val(data.options.cache)
      $('#in-api-cred').val(data.options.credentials)
      $('#in-api-redir').val(data.options.redirect)
      $('#in-api-refpol').val(data.options.referrerPolicy)
      $('#in-api-headers').val(JSON.stringify(data.options.headers, null, '  '))
      $('#in-api-body').val(data.options.body)
      $('#in-html').val(data.html)
      setEditBtns(true)
    })
  }

  function moveCard(id, up=true) {
    var src = $(`#${id}`)
    var dst, dstId
    if (up) {
      dst = src.prev()
      if (dst.length == 1) dst.insertAfter(src)
    } else {
      dst = src.next()
      if (dst.length == 1) src.insertAfter(dst)
    }
    if (dst.length == 1) {
      dstId = dst.attr('id')
      chrome.storage.local.get('card_info', (data) => {
        data = data['card_info']
        const tmp = data[id].order
        data[id].order = data[dstId].order
        data[dstId].order = tmp
        chrome.storage.local.set({'card_info': data}, () => {})
      })
    }
  }

  function setEditBtns(show=true) {
    if (show) {
      $('#btn-edit').show()
      $('#btn-cancel-edit').show()
      $('#btn-add').hide()
      $('button[id$="-up"]').hide()
      $('button[id$="-down"]').hide()
      $('button[id$="-refresh"]').hide()
      $('button[id$="-remove"]').hide()
    } else {
      $('#btn-edit').hide()
      $('#btn-cancel-edit').hide()
      $('#btn-add').show()
      $('button[id$="-up"]').show()
      $('button[id$="-down"]').show()
      $('button[id$="-refresh"]').show()
      $('button[id$="-remove"]').show()
    }
  }

  function parseJSON(str) {
    return str && JSON.parse(str) || {}
  }

  function validate(data) {
    try { 
      if (data.options.headers && data.options.headers.replaceAll(' ', ''))
        JSON.parse(data.options.headers) 
      $('#in-api-headers').removeClass('is-invalid')
      return true
    } catch { 
      $('#in-api-headers').addClass('is-invalid')
      return false
    }
  }

  function exportCards() {
    chrome.storage.local.get('card_info', (data) => {
      const str = JSON.stringify(data['card_info'], null, '  ')
      const vLink = document.createElement('a')
      const vBlob = new Blob([str], {type: "octet/stream"})
      const vName = 'card_info.json'
      const vUrl = window.URL.createObjectURL(vBlob)
      vLink.setAttribute('href', vUrl)
      vLink.setAttribute('download', vName)
      vLink.click();
    })
  }

  function importCards() {
    // create file reader
    const reader = new FileReader()
    reader.onload = function(e){
      const cardInfoData = JSON.parse(e.target.result)
      updateStorage('card_info', cardInfoData, init)
    }
    // create file input & click
    const fileElem = $('<input type="file">')
    fileElem.on('change', function() {
      const file = $(this).prop('files')[0]
      reader.readAsText(file)
    })
    fileElem.click()
  }

  // EVENTS
  $('#btn-export').on('click', exportCards)
  $('#btn-import').on('click', importCards)
  $('#btn-main-page').on('click', () => {
    chrome.tabs.create({url: chrome.runtime.getURL("html/main.html")})
  })
  $('#btn-cancel-edit').on('click', () => {
    $('#create-card-form')[0].reset()
    setEditBtns(false)
  })
  $('#create-card-form').on('submit', function(event) {
    event.preventDefault()
    var data = {
      'url': '', 
      'html': '<p>empty</p>', 
      'options': {},
    }
    $(this).serializeArray().forEach(x => {
      const cardInfoKeys = ['name', 'url', 'html']
      if (x.value) {
        if (cardInfoKeys.includes(x.name)) 
          data[x.name] = x.value
        else
          data.options[x.name] = x.value
      } else {
        if (!cardInfoKeys.includes(x.name)) 
          delete data.options[x.name]
      }
    })
    if (!validate(data)) return

    data.options.headers = parseJSON(data.options.headers)
    console.log(data)
    const id = $('#edit-card-id').val()
    if (id) {
      updateCard(id, data)
      setEditBtns(false)
    } else {
      addCard(data)
    }
    $(this)[0].reset()
  })

  function init() {
    $('#card-container').empty()
    chrome.storage.local.get('card_info', (data) => {
      console.log("loading cards...")
      data = data['card_info']
      var arr = Object.entries(data)
      arr.sort((a, b) => a[1].order - b[1].order)
      console.log(arr)
      for (let i = 0; i < arr.length; i++) {
        const [id, d] = arr[i]
        loadCard(id, d)
        data[id].order = i
      }
      // make sure order are contiguous for all data
      chrome.storage.local.set({'card_info': data}, () => {})
    })
  }
  init()
})