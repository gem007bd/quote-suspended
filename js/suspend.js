
let suspendUrl = new URL(location.href);
let pageUrl = suspendUrl.searchParams.get('url');
let favIconUrl = suspendUrl.searchParams.get('favIconUrl');
let title = suspendUrl.searchParams.get('title');
let darkMode = suspendUrl.searchParams.get('dark_mode') === 'true';

// compatibility with previous version
// will be removed in the next version
if (!pageUrl) {
  let suspendUrl = new URL(location.href);
  let hash = suspendUrl.hash ? suspendUrl.hash.replace('#', '') : '';

  let hashParams = {};
  let e,
      a = /\+/g,  // Regex for replacing addition symbol with a space
      r = /([^&;=]+)=?([^&;]*)/g,
      d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
      q = hash;

  while (e = r.exec(q))
     hashParams[d(e[1])] = d(e[2]);

  pageUrl = hashParams.uri;
  title = hashParams.title;
}
// end compatibility section


document.onclick = () => {
    this.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      tabs.forEach((tab) => {
        this.chrome.runtime.sendMessage({command: "ts_restore_tab", tabId: tab.id});
      });
    });
}


if (pageUrl) {
  document.querySelector('.title .description').setAttribute('href', pageUrl);
  document.querySelector('.title .url').setAttribute('href', pageUrl);
  document.querySelector('.title .url').textContent = pageUrl;
}


if (favIconUrl) {
  var icon = document.createElement('img');
  icon.setAttribute('src', favIconUrl);
  document.querySelector('.title .icon').appendChild(icon);

  var link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = favIconUrl;
  document.getElementsByTagName('head')[0].appendChild(link);
}

if (title) {
  document.title = title;
  document.querySelector('.title .description').textContent = title;
}

if (darkMode) {
  document.body.classList.add('dark-mode');
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log(changes, namespace)
  if (changes.dark_mode && changes.dark_mode.newValue) {
    document.body.classList.add('dark-mode');
  }
  else {
    document.body.classList.remove('dark-mode');
  }
});

let quotes =  {
    "time":[
      { "name":"Benjamin Franklin", "quote": "You may delay, but time will not."},
      { "name":"Bruce Lee", "quote": "If you love life, don't waste time, for time is what life is made up of."},
      { "name":"Jim Rohn", "quote": "Time is more value than money. You can get more money, but you cannot get more time."},
      { "name":"Robert H. Schuller","quote": "Tough times never last, but tough people do."},
      { "name":"Jim Rohn","quote": "Time is more value than money. You can get more money, but you cannot get more time."}
      ]
  };
let commingDates = {
  "upCommingDate" : [
      {
        'date' : '15-August-2018',
        'eventType' : 'localEvent',
        'eventName' : 'Assumption (Mariä Himmelfahrt, closures in Bavaria and Saarland)'
      },
      {
        'date' : '15 to 19 August-2018',
        'eventType' : 'localEvent',
        'eventName' : 'Weindorf wine festival, Rothenburg ob der Tauber'
      },
      {
        'date' : '25 August-2018',
        'eventType' : 'calendarEvent',
        'eventName' : 'Doctor Appoinment'
      }
  ]
};
  var randomQuote = quotes.time[Math.floor(Math.random()*quotes.time.length)];
  //document.querySelector('.quote-message').textContent = randomQuote.quote;
//  document.querySelector('.name-message').textContent = randomQuote.name;

// for upcoming events
var randomUpcommigEvents = commingDates.upCommingDate[Math.floor(Math.random()*commingDates.upCommingDate.length)];
document.querySelector('.event-date').textContent = randomUpcommigEvents.date;
document.querySelector('.event-message').textContent = randomUpcommigEvents.eventName;
