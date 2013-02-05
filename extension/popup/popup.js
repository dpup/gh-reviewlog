
function getEl(id) {
  return document.getElementById(id)
}

function setContent(id, content) {
  getEl(id).innerHTML = content
}

function setupAuthView() {
  log('Setting up auth view')
  var loggingIn = false

  // Use the stored username, if available.
  getEl('username').value = fetch('username') || '';

  // Listen for the form being submitted.
  getEl('frm').addEventListener('submit', function (e) {
    log('here')
    e.preventDefault()
    if (!loggingIn) {
      loggingIn = true
      getEl('button').disabled = true

      var username = getEl('username').value
      var password = getEl('password').value

      var postData = {
        scopes: ['repo'],
        note: 'GitHub ReviewLog Chrome Extension'
      }

      log('Fetching auth token')
      var xhr = new XMLHttpRequest()
      xhr.open('POST', 'https://api.github.com/authorizations', true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader('Authorization', 'Basic ' + btoa(username + ':' + password))
      xhr.onload = onload
      xhr.onerror = onerror
      xhr.send(JSON.stringify(postData))

      function onload() {
        if (xhr.status == 201) {
          try {
            log('Log in successful')
            var resp = JSON.parse(xhr.responseText)
            store('accessToken', resp.token)
            store('username', username)
            setupListView()
          } catch (e) {
            log(e)
            onerror()
          }
        } else {
          onerror()
        }
        loggingIn = false
        getEl('button').disabled = false
      }

      function onerror() {
        log('Login failed')
        var el = getEl('msg')
        el.className = 'error'
        el.innerHTML = 'Failed to authenticate, please try again.'
        loggingIn = false
        getEl('button').disabled = false
      }
    }
  }, true)

  getEl('list').style.display = 'none'
  getEl('auth').style.display = 'block'
}


function setupListView() {
  log('Setting up list view')

  var lastLoad = fetch('lastView') || 0
  store('lastView', Date.now())

  getAllPullRequests(function (result) {
    setContent('status', result.repoCount + ' repositories, ' + result.pulls.length + ' pull requests')

    var pullsEl = getEl('pull_table')
    result.pulls.forEach(function (pull) {
      var tr = document.createElement('tr')

      if (pull.updatedAt > lastLoad) tr.className = 'new'

      var avatar = document.createElement('td')
      avatar.className = 'avatar'
      avatar.title = pull.user
      var img = document.createElement('img')
      img.src = pull.userAvatar
      avatar.appendChild(img)
      tr.appendChild(avatar)

      // var repo = document.createElement('td')
      // repo.className = 'repo'
      // repo.title = pull.owner + '/' + pull.project
      // repo.appendChild(document.createTextNode(pull.project))
      // tr.appendChild(repo)

      var title = document.createElement('td')
      title.className = 'title'
      var anchor = document.createElement('a')
      anchor.href = pull.url
      anchor.target = '_new'
      anchor.appendChild(document.createTextNode(pull.title))
      title.appendChild(anchor)
      var span = document.createElement('span')
      span.appendChild(document.createTextNode(' in ' + pull.project))
      title.appendChild(span)
      tr.appendChild(title)

      var date = document.createElement('td')
      date.className = 'date'
      date.appendChild(document.createTextNode(relativeDate(pull.updatedAt)))
      tr.appendChild(date)

      // number: obj.number,
      // title: obj.title,
      // url: obj.html_url,
      // owner: owner,
      // project: project,
      // updatedAt: obj.updated_at,
      // user: obj.user.login,
      // userAvatar: obj.user.avatar_url

      pullsEl.appendChild(tr)
    })

    chrome.browserAction.setBadgeText({text: String(result.pulls.length)})
    chrome.browserAction.setBadgeBackgroundColor({color: '#aaaaaa'})
  })

  getEl('auth').style.display = 'none'
  getEl('list').style.display = 'block'
}

document.body.addEventListener('click', function (e) {
  var target = e.target
  while (target && target.tagName != 'TD') target = target.parentNode

  if (target) {
    window.open(target.getElementsByTagName('a')[0].href)
    e.preventDefault()
  }
}, true)


if (hasLogin()) setupListView()
else setupAuthView()
