$(function() {
  async function fetchAPI(url, options={}) {
    try {
      console.log(options)
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

  function updateStorage(storageKey, obj) {
    chrome.storage.sync.get(storageKey, (data) => {
      data = data[storageKey]
      const newData = Object.assign(data || {}, obj)
      chrome.storage.sync.set({[storageKey]: newData}, () => {})
    })
  }

  function removeStorage(storageKey, key) {
    chrome.storage.sync.get(storageKey, (data) => {
      data = data[storageKey]
      delete data[key]
      chrome.storage.sync.set({[storageKey]: data}, () => {})
    })
  }

  function loadCard(id, data, cardElem=null) {
    let {url, html, options} = data
    if (!cardElem)
      cardElem = $(`<div id="${id}" class="card mt-1"></div>`).appendTo('#card-container')
    else
      cardElem.empty()

    var editBtn = ''
    if (window.location.toString().startsWith(chrome.runtime.getURL("html/main.html"))) {
      editBtn = `
      <button id="${id}-edit" type="button" class="btn btn-light">
        <i class="bi bi-pencil-square"></i>
      </button>
      `
    }
    cardElem.append(`
    <div class="card-header">
      <div class="float-end">
        ${editBtn}
        <button id="${id}-refresh" type="button" class="btn btn-light btn-sm">
          <i class="bi bi-arrow-clockwise"></i>
        </button>
        <button id="${id}-remove" type="button" class="btn btn-outline-danger btn-sm">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>
    `)
    var cardBodyElem = $('<div class="card-body"></div>').appendTo(cardElem)
    cardBodyElem.append(html)

    function fn() {
      if (url && url.replaceAll(' ', '')) {
        fetchAPI(url, options)
        .then(res => {
          $(cardBodyElem).find("v").each(function () {
            const vstr = $(this).attr('val')
            console.log(vstr)
            $(this).text(accessObj(res, vstr))
          })
        })
      }
    }
    $(`#${id}-refresh`).prop("onclick", null).off("click")
    $(document).on('click', `#${id}-refresh `, fn)
    $(document).on('click', `#${id}-remove`, () => removeCard(id))
    $(document).on('click', `#${id}-edit`, () => editCard(id))
    fn()
  }

  function addCard(data) {
    const id = `id-${Date.now()}`
    data.html = data.html.replace(/id="(.+)"/g, `id="${id}-$1"`) // id="abc" -> id="id-123123-abc"
    updateStorage('card_info', {[id]: data})
    loadCard(id, data)
  }

  function updateCard(id, data) {
    if (!data.html || !data.html.replaceAll(' ', '')) {
      alert("html field is empty")
      return
    }
    updateStorage('card_info', {[id]: data})
    loadCard(id, data, $(`#${id}`))
  }

  function removeCard(id) {
    $(`#${id}`).remove()
    removeStorage('card_info', id)
  }

  function editCard(id) {
    chrome.storage.sync.get('card_info', (data) => {
      data = data['card_info'][id]
      $('#edit-card-id').val(id)
      $('#in-api-url').val(data.url)
      $('#in-api-method').val(data.options.method)
      $('#in-api-mode').val(data.options.mode)
      $('#in-api-cache').val(data.options.cache)
      $('#in-api-cred').val(data.options.credentials)
      $('#in-api-redir').val(data.options.redirect)
      $('#in-api-refpol').val(data.options.referrerPolicy)
      $('#in-api-headers').val(JSON.stringify(data.options.headers))
      $('#in-api-body').val(data.options.body)
      $('#in-html').val(data.html)
      $('#btn-edit').show()
      $('#btn-add').hide()
    })
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


  $(document).on('click', '#btn-main-page', () => {
    chrome.tabs.create({url: chrome.runtime.getURL("html/main.html")})
  })
  $('#create-card-form').on('submit', function(event) {
    event.preventDefault()
    var data = {
      'url': '', 
      'html': '<p>empty</p>', 
      'options': {}
    }
    $(this).serializeArray().forEach(x => {
      if (x.value) {
        if (['url', 'html'].includes(x.name)) 
          data[x.name] = x.value
        else
          data.options[x.name] = x.value
      } else {
        if (!['url', 'html'].includes(x.name)) 
          delete data.options[x.name]
      }
    })
    if (!validate(data)) return

    data.options.headers = parseJSON(data.options.headers)
    console.log(data)
    const id = $('#edit-card-id').val()
    if (id) {
      updateCard(id, data)
      $('#btn-edit').hide()
      $('#btn-add').show()
    } else {
      addCard(data)
    }
    $(this)[0].reset()
  })

  chrome.storage.sync.get('card_info', (data) => {
    console.log("loading cards...")
    data = data['card_info']
    for (const id in data) {
      console.log(data[id])
      loadCard(id, data[id])
    }
  })
})