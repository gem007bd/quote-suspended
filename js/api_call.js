// {"web":
//   {"client_id":"582945226198-4i8254388h4tco3p7luktm8rk09ts0dh.apps.googleusercontent.com",
//     "project_id":"light-team-206920","auth_uri":"https://accounts.google.com/o/oauth2/auth",
//     "token_uri":"https://accounts.google.com/o/oauth2/token",
//     "auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs",
//     "client_secret":"HlHu3eYvy3rAyP1Nti6t93pr"
//   }
// }
// Client ID and API key from the Developer Console
var CLIENT_ID = '582945226198-4i8254388h4tco3p7luktm8rk09ts0dh.apps.googleusercontent.com';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

var numCalendarsCaught = 0;
var numCalendarsToCatch = 0;

// set today's date, if it has been modified by the settings
if (typeof (Storage) !== "undefined" && typeof (localStorage["settings"]) !== 'undefined') {
    var settings = JSON.parse(localStorage["settings"]);
    if (typeof (settings['today']) !== 'undefined') {
        var val = settings['today'];
        if (val !== null && val.trim() !== '') {
            today = moment(val, "YYYY-MM-DD")['_d'];
            minDay = today;
            maxDay = new Date(today.addDays(amountOfDays));
        }
    }
}

/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
    gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

// Called when the signed in status changes, to update the UI
// appropriately. After a sign-in, the API is called.
function updateSigninStatus(isSignedIn) {
    if (isSignedIn)
        findCalendars();
    else
        popup('Google Calendar API', $('#setup-menu-2'));
}

// Sign in the user upon button click.
function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

// Sign out the user upon button click.
function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
    alert("Done");
}

// see https://developers.google.com/google-apps/calendar/v3/reference/calendarList/list
function findCalendars() {
    gapi.client.calendar.calendarList.list({
        //showHidden: true
    }).then(function (response) {
        calendars = response.result.items;
        console.log(calendars);
        numCalendarsToCatch = response.result.items.length;
        numCalendarsCaught = 0;
        for (var i = 0; i < calendars.length; i++)
            listUpcomingEvents(calendars[i].id, calendars[i].summary);
    });
}

// Print the summary and start datetime/date of the next ten events in
// the authorized user's calendar. If no events are found an
// appropriate message is printed.
function listUpcomingEvents(calendarId, calendarName) {
    gapi.client.calendar.events.list({
        'calendarId': calendarId,
        'timeMin': minDay.toISOString(),
        'timeMax': maxDay.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 250,
        'orderBy': 'startTime'
    }).then(function (response) {
        var items = response.result.items;
        events[calendarName] = items;
        for (var i = 0; i < items.length; i++) {
            // enrich item
            items[i]['calendarId'] = calendarId;
            items[i]['calendarName'] = calendarName;

            // add to array
            eventsArray.push(items[i]);

            // Insert into eventsByDay object
            var start = moment(items[i].start.dateTime).millisecond(0).second(0).minute(0).hour(0);
            var _today = moment(today).millisecond(0).second(0).minute(0).hour(0);
            var diff = start.diff(_today, "days") + ''; // as a string
            if (typeof (eventsByDay[diff]) === 'undefined')
                eventsByDay[diff] = [];
            eventsByDay[diff].push(items[i]);

            // Calculate time difference
            var startTime = moment(items[i].start.dateTime);
            var endTime = moment(items[i].end.dateTime);
            var duration = endTime.diff(startTime, 'hours');
            items[i]['durationInHours'] = duration;
            try {
                hoursByDay[diff][calendarName] += duration;
            } catch (e) { } // catches exceptions from days that are not on our picture
        }

        // check if this was the last calendar
        numCalendarsCaught++;
        if (numCalendarsCaught === numCalendarsToCatch)
            startApplication();
        else if (numCalendarsCaught > numCalendarsToCatch)
            alert("Retrieved more calendars than expected!"); // cannot happen (or can it?)
    });
}
