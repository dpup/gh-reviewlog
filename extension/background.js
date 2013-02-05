/**
 * @fileoverview Background event page that refreshes the local cache periodically.
 */

chrome.alarms.create('refresh', {periodInMinutes: 2})
chrome.alarms.onAlarm.addListener(refresh)
chrome.browserAction.setBadgeText({text: '-'})
chrome.browserAction.setBadgeBackgroundColor({color: '#660000'})
refresh()

var loadInProgress = false

function refresh() {
  log('Refreshing @', new Date())

  // Force everything to bypass cache.
  localCache = {}

  if (loadInProgress) {
    log('Refresh already in progress')

  } else if (!hasLogin()) {
    log('No login credentials')

  } else {
    loadInProgress = true
    verifyLogin(function (err, valid) {
      loadInProgress = false

      // Probably a network failure
      if (err) {
        log('Error verifying login details', err)

      // Force refresh local cache.
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
