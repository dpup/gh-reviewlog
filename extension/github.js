
/**
 * @fileoverview Methods for accessing GitHub.  If the requests fail for any reason an empty
 * response is returned of the same type.
 */


/**
 * Verifies the login information has valid scopes.
 * @param {function (Error, boolean)} fn
 */
function verifyLogin(fn) {
  // Bypass local  cache to ensure background page loaded latest version.
  var username = fetch('username')
  var accessToken = fetch('accessToken')

  var xhr = new XMLHttpRequest()
  xhr.open('GET', 'https://api.github.com/users/' + username, true)
  xhr.setRequestHeader('Authorization', 'bearer ' + accessToken)
  xhr.onload = function () {
    fn(null, isSuccess(xhr))
  }
  xhr.onerror = function (e) {
    fn(e, false)
  }
  xhr.send(null)
}


/**
 * Gets a list of the user's organizations.
 * @param {function (Array.<string>)} fn
 * @param {boolean=} force Whether to bypass the cache
 */
function getOrgs(fn, force) {
  if (fetch('orgs') && !force) {
    log('Retrieved orgs from localStorage')
    fn(fetch('orgs'))
    return
  }

  log('Fetching orgs')
  var xhr = new XMLHttpRequest()
  xhr.open('GET', 'https://api.github.com/user/orgs?access_token=' + fetch('accessToken') + '&rnd=' + Date.now(), true)
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.onload = function () {
    log('Received orgs')
    var res = parseResponse(xhr)
    if (!res) return fn([])

    var orgs = res.map(function (obj) {
      return obj.login
    })
    store('orgs', orgs)
    fn(orgs)
  }
  xhr.onerror = function (e) {
    log('getOrgs failed', e)
    fn([])
  }
  xhr.send(null)
}


/**
 * Gets a repos of a specific type.
 * @param {string} type Used in the cache key.
 * @param {string} path GitHub path for requesting the repos.
 * @param {function (Array.<Object>)} fn
 * @param {boolean=} force Whether to bypass the cache
 */
function getRepos(type, path, fn, force) {
  var cacheKey = 'repos_' + type

  if (fetch(cacheKey) && !force) {
    log('Retrieved', cacheKey, 'from localStorage')
    fn(fetch(cacheKey))
    return
  }

  log('Fetching', cacheKey)
  var xhr = new XMLHttpRequest()
  xhr.open('GET', 'https://api.github.com/' + path + '?access_token=' + fetch('accessToken') + '&rnd=' + Date.now(), true)
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.onload = function () {
    var res = parseResponse(xhr)
    if (!res) return fn([])

    var repos = filterIgnored(res.map(function (obj) {
      return {
        owner: obj.full_name.split('/')[0],
        project: obj.full_name.split('/')[1],
      }
    }))
    store(cacheKey, repos)
    fn(repos)
  }
  xhr.onerror = function (e) {
    log('getRepos failed', e)
    fn([])
  }
  xhr.send(null)
}


/**
 * Gets all repos associated with a user, both personal and org repos.
 * @param {function (Array.<Object>)} fn
 * @param {boolean=} force Whether to bypass the cache
 */
function getAllRepos(fn, force) {
  var allRepos = []
  var userDone = false
  var orgsDone = false

  getOrgs(function (orgs) {
    function next() {
      var org = orgs.pop()
      if (org) {
        getRepos('orgs_' + org, 'orgs/' + org + '/repos', function (repos) {
          allRepos = allRepos.concat(repos)
          next()
        }, force)
      } else {
        if (userDone) fn(allRepos)
        else orgsDone = true
      }
    }
    next()
  }, force)

  getUserRepos(function (repos) {
    allRepos = allRepos.concat(repos)
    if (orgsDone) fn(allRepos)
    else userDone = true
  }, force)
}


/**
 * Gets a user's repositories.
 * @param {function (Array.<Object>)} fn
 * @param {boolean=} force Whether to bypass the cache
 */
function getUserRepos(fn, force) {
  getRepos('user', 'user/repos', fn, force)
}


/**
 * Gets the open pull requests for a repo.
 * @param {string} owner Project owner or organization.
 * @param {string} project Project name
 * @param {function (Array.<Object>)} fn
 * @param {boolean=} force Whether to bypass the cache
 */

function getPullRequests(owner, project, fn, force) {
  var cacheKey = ['pulls', owner, project].join('_')
  if (fetch(cacheKey) && !force) {
    log('Retrieved', cacheKey, 'from localStorage')
    fn(fetch(cacheKey))
    return
  }

  log('Fetching pull requests for', owner, project)
  var url = 'https://api.github.com/repos/' + owner + '/' + project + '/pulls?access_token=' + fetch('accessToken') + '&rnd=' + Date.now()
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.setRequestHeader('Accept', 'application/json')
  xhr.onload = function () {
    var res = parseResponse(xhr)
    if (!res) return fn([])

    var pulls = res.map(function (obj) {
      return {
        number: obj.number,
        title: obj.title,
        body: obj.body,
        url: obj.html_url,
        owner: owner,
        project: project,
        updatedAt: new Date(obj.updated_at).getTime(),
        user: obj.user.login,
        userAvatar: obj.user.avatar_url
      }
    })
    store(cacheKey, pulls)
    fn(pulls)
  }
  xhr.onerror = function (e) {
    log('getRepos failed', e)
    fn([])
  }
  xhr.send(null)
}


/**
 * Gets all pull requests for repositories the user has access to.
 * @param {function (Array.<Object>)} fn
 * @param {boolean=} force Whether to bypass the cache
 */
function getAllPullRequests(fn, force) {
  var allPulls = []
  getAllRepos(function (repos) {
    var repoCount = repos.length
    function next() {
      var repo = repos.pop()
      if (repo) {
        getPullRequests(repo.owner, repo.project, function (pulls) {
          allPulls = allPulls.concat(pulls)
          next()
        }, force)
      } else {
        allPulls.sort(function (a, b) {
          return b.updatedAt - a.updatedAt
        })
        console.log(allPulls)
        fn({
          repoCount: repoCount,
          pulls: allPulls
        })
      }
    }
    next()
  }, force)
}


function isSuccess(xhr) {
  return xhr.status == 200 || xhr.status == 304
}


function parseResponse(xhr) {
  if (!isSuccess(xhr)) {
    log('XHR failed', xhr.status)
    return null
  }
  try {
    return JSON.parse(xhr.responseText)
  } catch (e) {
    log('JSON parse error', e, xhr.responseText)
    return null
  }
}


function filterIgnored(list) {
  var filter = fetch('ignore_repos')
  if (!filter) return list
  var ignoreList = filter.split(',').map(function (repo) { return repo.trim() })

  return list.filter(function (repo) {
    return ignoreList.indexOf(repo.project) == -1
  })
}
