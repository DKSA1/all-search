export function getQueryString (name, url) {
  url = url || window.location.href
  const r = new RegExp('(\\?|#|&)' + name + '=([^&#]*)(&|#|$)')
  const m = url.match(r)
  return decodeURIComponent(!m ? '' : m[2])
}

export function getKeyword () {
  const el = document.querySelector('input[type=\'search\'],input[type=\'text\'][autocomplete=\'off\'],input[autocomplete=\'off\']:not([type])') ||
    document.querySelector('input[type=\'text\'][name][value],input[name][value]:not([type])')
  if (el) {
    if (el.nodeName === 'INPUT' || el.localName === 'textarea') {
      return el.value
    } else {
      return el.textContent
    }
  }
  return ''
}

const el = document.createElement('a')

export function parseUrl (url) {
  let val = url
  if (val.indexOf('//') < 0) {
    val = `//${val}`
  } else if (val.indexOf('//') > -1) {
    const lowerCaseVal = val.toLowerCase()
    if (
      !lowerCaseVal.startsWith('http://') &&
      !lowerCaseVal.startsWith('https://') &&
      !lowerCaseVal.startsWith('ftp://') &&
      !lowerCaseVal.startsWith('files://')
    ) {
      val = val.replace(/.*\/\//, '//')
    }
  } else {
    return el
  }
  el.href = val
  return {
    href: el.href, // '包含完整的url'
    origin: el.origin, // '包含协议到pathname之前的内容'
    protocol: el.protocol, //  'url使用的协议，包含末尾的:'
    host: el.host, //  '完整主机名，包含:和端口'
    hostname: el.hostname, //  '主机名，不包含端口'
    port: el.port, //  '端口号'
    pathname: el.pathname, //  '服务器上访问资源的路径/开头'
    search: el.search, //  'query string，?开头'
    hash: el.hash //  '#开头的fragment identifier'
  }
}

export function checkBody () {
  let time = 0
  return new Promise((resolve, reject) => {
    if (document && document.body) {
      resolve()
    } else {
      const id = setInterval(function () {
        time += 1
        if (document && document.body) {
          clearInterval(id)
          resolve()
        }
        if (time === 50) {
          clearInterval(id)
          reject(new Error('timeOut'))
        }
      }, 200)
    }
  })
}

function getName (name) {
  if (name) {
    return `__allSearch__${name}`
  }
  return null
}

export function getSession (name) {
  const formatName = getName(name)
  // eslint-disable-next-line
  if (window.GM_getValue) {
    // eslint-disable-next-line
    return window.GM_getValue(formatName)
  }
  const item = window.localStorage.getItem(formatName)
  if (item) {
    return JSON.parse(item)
  }
  return null
}

export function setSession (name, value) {
  const formatName = getName(name)
  // eslint-disable-next-line
  if (window.GM_setValue) {
    // eslint-disable-next-line
    window.GM_setValue(formatName, value)
  } else {
    const item = JSON.stringify(value)
    if (item) {
      window.localStorage.setItem(formatName, item)
    }
  }
}

export function addStyle (styleContent) {
  if (!styleContent) {
    return
  }
  const style = document.createElement('style')
  style.innerHTML = styleContent
  style.class = 'all-search-style'
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(style)
}

// 监听head的节点移除，防止style被干掉
export function domObserve () {
  const targetNode = document.getElementsByTagName('head')[0]
  const config = { childList: true }
  const callback = function (mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.removedNodes.length &&
        mutation.removedNodes[0].nodeName === 'STYLE' &&
        mutation.removedNodes[0].class === 'all-search-style'
      ) {
        addStyle(mutation.removedNodes[0].innerText)
      }
    }
  }
  let observer
  if (MutationObserver) {
    observer = new MutationObserver(callback)
    observer.observe(targetNode, config)
  }
}

export function addLink (url) {
  if (!url) {
    return
  }
  const link = document.createElement('link')
  link.href = url
  link.rel = 'stylesheet'
  link.type = 'text/css'
  link.crossorigin = 'anonymous'
  const head = document.getElementsByTagName('head')[0]
  head.appendChild(link)
}

export function addStyleResource (name, link) {
  let styleContent
  if (window.GM_getResourceText) {
    styleContent = window.GM_getResourceText(name)
  }
  if (styleContent) {
    addStyle(styleContent)
  } else {
    addLink(link)
  }
}
