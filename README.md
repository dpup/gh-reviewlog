GitHub ReviewLog
================

**A Chrome Extension for making it easier to keep track of all your projects' pull requests.**

This extension orignated from needing to keep track of pull requests on 50+ projects that I have
access to; both open source and work projects. I wanted ambient information about the total count
and to see when there was activity on those PRs.

![Screen shot](https://raw.github.com/dpup/gh-reviewlog/master/screenshots/Screen%20Shot%202013-02-04%20at%206.54.02%20PM.png)

This extension provides a [browser action](http://developer.chrome.com/extensions/browserAction.html)
that shows you how many open pull requests there are on projects you have access to. Clicking the
button gives a drop down with quick access to each PR and their last updated time. An
[event page](http://developer.chrome.com/extensions/event_pages.html) refreshes the data every 2
minutes, changing the icon badge to red if there is new activity.


Installation
------------

The best bet is to get the latest published version from the [Chrome Web Store](https://chrome.google.com/webstore/detail/github-reviewlog/cmlmlaigghcfegnfoenahanhhhehpeca?hl=en-US&gl=US).

You can also download the source and "Load unpacked extension" from `chrome://extensions/`


To do list
----------

This is a work in progress.

- Improve first log in experience (loading... can take a while).
- Mute a PR until it is updated.
- Ignore repositories and organizations.
- Manual refresh.
- Notifications / visual call out when you are explicitly mentioned in a PR.
- Settings for refresh frequency.

Author
------

[Dan Pupius](https://github.com/dpup) ([personal website](http://pupius.co.uk)).


Contributing
------------

Questions, comments, bug reports, and pull requests are all welcome. Submit them at
[the project on GitHub](https://github.com/dpup/dh-reviewlog/).

Bug reports that include steps-to-reproduce (including code) are the best. Even better, make them in
the form of pull requests.


License
-------

The MIT License (MIT)

Copyright (c) 2013 Daniel Pupius, http://pupius.co.uk

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute,
sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial
portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


Other Licences
--------------

Icons by [Nadja Hallfahrt](http://blog.artcore-illustrations.de/) used under
Creative Commons (Attribution-Noncommercial-No Derivative Works 3.0 Unported)
