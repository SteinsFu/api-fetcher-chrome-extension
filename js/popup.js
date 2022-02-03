$(function() {
  const SPINNER = `
  <div class="d-flex justify-content-center m-3">
    <div class="spinner-border text-info" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  `

  async function fetchAPI(url, options={}) {
    try {
      const res = await fetch(url, options)
      return await res.json()
    } catch (error) {
      console.error(error)
      return {}
    }
  }

  function accessObj(obj, vstr) {
    // vstr="temperature.data[0].place" -> value of obj.temperature.data[0].place
    return vstr.replace(/\[([0-9]+)\]/g, '.$1').split('.').reduce((o, i) => o[i], obj)
  }

  function updateStorage(storageKey, obj, cb=()=>{}) {
    chrome.storage.sync.get(storageKey, (data) => {
      data = data[storageKey]
      const newData = Object.assign(data || {}, obj)
      chrome.storage.sync.set({[storageKey]: newData}, cb)
    })
  }

  function removeStorage(storageKey, key, cb=()=>{}) {
    chrome.storage.sync.get(storageKey, (data) => {
      data = data[storageKey]
      delete data[key]
      chrome.storage.sync.set({[storageKey]: data}, cb)
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
          const newHtml = html.replace(/{(.+?)}/g, (s, vstr) => {
            return accessObj(res, vstr)
          })
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
      chrome.storage.sync.get('card_info', (data) => {
        data = data['card_info']
        delete data[id]
        for (const nextId of nextIds)
          data[nextId].order -= 1
        chrome.storage.sync.set({'card_info': data}, () => {})
      })
    }
    $(`#${id}`).remove()
  }

  function editCard(id) {
    chrome.storage.sync.get('card_info', (data) => {
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
      chrome.storage.sync.get('card_info', (data) => {
        data = data['card_info']
        const tmp = data[id].order
        data[id].order = data[dstId].order
        data[dstId].order = tmp
        chrome.storage.sync.set({'card_info': data}, () => {})
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
    chrome.storage.sync.get('card_info', (data) => {
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
    chrome.storage.sync.get('card_info', (data) => {
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
      chrome.storage.sync.set({'card_info': data}, () => {})
    })
  }
  init()
})