
var selected = 'settings'

document.body.addEventListener('click', function (e) {
  if (e.target.tagName == 'A' && !e.target.getAttribute('target')) {
    document.getElementById(selected).classList.remove('selected')
    document.querySelector('[href="#' + selected + '"]').parentNode.classList.remove('selected')
    selected = e.target.hash.substr(1) || 'settings'
    document.getElementById(selected).classList.add('selected')
    document.querySelector('[href="#' + selected + '"]').parentNode.classList.add('selected')
  }
}, true)


function bindStorage(id) {
  var element = document.getElementById(id)
  if (!element) throw Error('missing element for ' + id)
  element.value = fetch(id) || ''
  element.addEventListener('change', function (e) {
    store(id, element.value)
  }, this)
}


bindStorage('refresh_rate')
bindStorage('alert_words')
bindStorage('ignore_repos')


document.getElementById('version').innerHTML = chrome.runtime.getManifest().version
