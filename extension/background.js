/**
 * @fileoverview Background event page that refreshes the local cache periodically.
 */

log('Event page loaded')

chrome.runtime.onInstalled.addListener(function() {
  log('Background page installed')
  chrome.browserAction.setBadgeText({text: '-'})
  chrome.browserAction.setBadgeBackgroundColor({color: '#660000'})
  chrome.alarms.create('refresh', {periodInMinutes: 2})
  refresh()
})


chrome.runtime.onSuspend.addListener(function() {
  log('Event page unloaded')
})


chrome.alarms.onAlarm.addListener(refresh)


var loadInProgress = false

function refresh() {
  log('Refreshing @', new Date())
  localStorage.lastRefresh = Date.now()

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
          var hasUnread = false
          for (var i = 0; i < result.pulls.length && !hasUnread; i++) {
            if (result.pulls[i].updatedAt > lastLoad) hasUnread = true
          }
          chrome.browserAction.setBadgeText({text: String(result.pulls.length)})
          chrome.browserAction.setBadgeBackgroundColor({
            color: hasUnread ? '#990000' : '#aaaaaa'
          })
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
