/**
 * @fileoverview Common helpers.
 */


// Parsed copy of data stored in localStorage
var localCache = {}


/**
 * Stores a value in localStorage as JSON.  Updates local cache as well.
 */
function store(key, value) {
  localCache[key] = value
  localStorage[key] = JSON.stringify(value)
}


/**
 * Fetches a value from localStorage, deserializing it.  Reads from local cache
 * if possible.
 */
function fetch(key, bypass) {
  if (!bypass && localCache[key]) {
    return localCache[key]
  } else {
    var json = localStorage[key]
    if (typeof json != 'undefined') {
      try {
        localCache[key] = JSON.parse(json)
        return localCache[key]
      } catch (e) {
        log('Error parsing json', json, e)
      }
    }
    return null
  }
}


/**
 * Returns true if there is an accessToken and username stored in localStorage.
 */
function hasLogin() {
  return !!fetch('accessToken') && !!fetch('username')
}


/**
 * Shorthand for logging.
 */
function log() {
  console.log.apply(console, arguments)
}


/**
 * Returns a date in relative form, e.g. 1 hour ago.
 */
function relativeDate(dateMs, opt_nowMs) {
  // Make NaN bugs less embarassing.
  if (isNaN(dateMs)) return 'some time ago'

  var now = opt_nowMs || Date.now()
  var delta = Math.floor((now - dateMs) / (60 * 1000))

  if (delta === 0) return 'just now'

  if (delta < 60) return formatAgoString('min', delta)

  delta = Math.floor(delta / 60)
  if (delta < 24) return formatAgoString('hour', delta)

  // Start comparing against midnight so that we don't say 2-days ago when it
  // was still yesterday.
  var midnight = new Date(now)
  midnight.setHours(0)
  midnight.setMinutes(0)
  midnight.setSeconds(0)
  midnight.setMilliseconds(0)

  var msInDay = 24 * 60 * 60 * 1000
  var deltaDays = Math.ceil((midnight.getTime() - dateMs) / (msInDay))

  if (deltaDays < 14) return formatAgoString('day', deltaDays)

  var deltaWeeks = Math.floor(deltaDays / 7)
  if (deltaWeeks <= 4) return formatAgoString('week', deltaWeeks)

  var deltaMonths = Math.floor(deltaDays / 30)
  if (deltaMonths <= 23) return formatAgoString('month', deltaMonths)

  var deltaYears = Math.round(deltaDays / 365)
  return formatAgoString('year', deltaYears)
}


/**
 * Formats a string to say "N somethings ago"
 * @param {string} period Time period, e.g. "month"
 * @param {number} delta Number of time periods.
 * @return {string} Formatted string
 */
function formatAgoString(period, delta) {
  return delta + ' ' + pluralize(period, delta) + ' ago'
}


/**
 * Performs naive pluralization of a word, adding 's' if the count is not 1.
 *
 * Note: this will perform incorrectly for many words, e.g. "deer", "dishes",
 * "heroes", "ladies".
 *
 * @param {string} word
 * @param {number} count
 * @return {string}
 */
function pluralize(word, count) {
  if (count == 1) return word
  else if (word.charAt(word.length - 1) == 's') return word + 'es'
  else return word + 's'
}


/**
 * Jumples up the characters in a string, making it look similar to how it did
 * before but obfuscating its contents.
 *
 * Used for obfuscating screen shots.
 *
 * @param {string} str
 * @return {string}
 */
function jumbleString(str) {
  str = str.replace(/[a-z]/g, function (a) {
    return String.fromCharCode(Math.round(Math.random() * 26) + 97)
  })
  str = str.replace(/[A-Z]/g, function (a) {
    return String.fromCharCode(Math.round(Math.random() * 26) + 65)
  })
  return str
}
