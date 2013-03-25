/**
 * @fileoverview Background event page that refreshes the local cache periodically.
 */

log('Event page loaded')

chrome.runtime.onInstalled.addListener(function() {
  log('Background page installed')
  chrome.browserAction.setBadgeText({text: '-'})
  chrome.browserAction.setBadgeBackgroundColor({color: '#eeaaaa'})
  refresh()
})


chrome.runtime.onSuspend.addListener(function() {
  log('Event page unloaded')
})


chrome.alarms.onAlarm.addListener(refresh)


// Listen for messages dispatched by the browser page.
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message == 'loggedin') {
    log('User is now logged in, refreshing')
    loadCallbacks.push(sendResponse)
    if (!loadInProgress) refresh()
    return true
  } else {
    return false
  }
})

var loadInProgress = false
var loadCallbacks = []

function refresh() {
  log('Refreshing @', new Date())
  localStorage.lastRefresh = Date.now()

  // Schedule alarm here so that it gets latest setting.
  chrome.alarms.create('refresh', {periodInMinutes: getRefreshRate()})

  // Force everything to bypass cache and be read from localStorage.
  localCache = {}

  if (loadInProgress) {
    log('Refresh already in progress')

  } else if (!hasLogin()) {
    log('No login credentials')

  } else {
    loadInProgress = true

    verifyLogin(function (err, valid) {
      loadInProgress = false

      // Probably a network failure.
      if (err) {
        log('Error verifying login details', err)

      // Force refresh local data.
      } else if (valid) {
        log('Valid login, requesting all pull requests')
        loadInProgress = true
        getAllPullRequests(function (result) {
          var lastLoad = fetch('lastView') || 0
          var lastNotification = fetch('lastNotification') || Date.now()
          store('lastNotification', Date.now())

          var hasUnread = false
          for (var i = 0; i < result.pulls.length && !hasUnread; i++) {
            var pull = result.pulls[i]
            if (pull.updatedAt > lastLoad) hasUnread = true
            if (pull.updatedAt > lastNotification) maybeShowNotification(pull)
          }
          chrome.browserAction.setBadgeText({text: String(result.pulls.length)})
          chrome.browserAction.setBadgeBackgroundColor({
            color: hasUnread ? '#990000' : '#aaaaaa'
          })
          while (loadCallbacks.length) {
            try {
              (loadCallbacks.pop())(true)
            } catch (e) {
              // Ignore, means popup has closed.
            }
          }
          loadInProgress = false
        }, true)

      // Credentials are invalid, so remove them.
      } else {
        log('Auth token invalid, clearing credentials')
        delete localStorage.accessToken

        // Remove cached pull requests, but leave repositories.
        Object.keys(localStorage).forEach(function (key) {
          if (key.substr(0, 6) == 'pulls_') delete localStorage[key]
        })

        chrome.browserAction.setBadgeText({text: '-'})
        chrome.browserAction.setBadgeBackgroundColor({color: '#660000'})
      }
    })
  }
}


function maybeShowNotification(pull) {
  if (matches(getAlertWords(), [pull.title, pull.body])) {
    var title = (pull.updatedAt == pull.createdAt ? 'New PR' : 'PR Updated') + ': ' + pull.title
    var notification = window.webkitNotifications.createNotification('assets/github_48.png', title, '')
    notification.onclick = function () {
      window.open(pull.url)
    }
    notification.show()
  }
}


function getRefreshRate() {
  var time = Number(fetch('refresh_rate'))
  if (isNaN(time) || time <= 0) return 2
  else return time
}
