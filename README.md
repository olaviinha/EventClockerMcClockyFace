# EventClocker McClockyFace 500 Turbo Deluxe

EventClocker McClockyFace 500 Turbo Deluxe is a web widget for an analogue clock that displays today's events from a delimiter-separated txt fle as arcs in the clockface. It can also display a list of upcoming and ongoing events.

Live demo: https://inha.asia/dmo/clocker/

Due to the maintainability, it is probably best suited for daily or weekly recurring events, but can also be used with one time events using dates.

I.e. it takes your data like this:
```
# Day & Time             Color   Description
daily 13:00-14:00;       #993;   Lunch
mon-fri 10:00-18:20;     #393;   Helsinki stock exchange is open
mon-fri 16:30-24:00;     -;      NYSE is open
tue-wed 14:00-18:00;     #99f;   Eduskunnan täysistunto
thu 16:00-20:00;         #99f;   Eduskunnan täysistunto
fri 13:00-17:00;         #99f;   Eduskunnan täysistunto
mon 18:00-19:00;         white;  Monday sauna
2020-08-22 18:30-20:00;  yellow; Ruusut @ Allas
2020-09-04 20:00-22:00;  yellow; The Hearing @ G Livelab
2020-11-23 19:00-23:00;  yellow; Igorrr @ Tavastia
``` 

...and turns it into this:

![Black McClockyFace](https://user-images.githubusercontent.com/50331907/122751984-193a1c00-d299-11eb-8657-26f9a3355378.png)

...or perhaps into something like this:
![White McClockyFace](https://storage.googleapis.com/olaviinha/github/clocker/white.jpg)

---

### Prerequisites
- jQuery

### Setup

1. Place all files on a server.
2. Import required files to your website. Naturally you may compile the LESS file into a CSS file, or do your own styling.
```
  <link rel="stylesheet/less" type="text/css" href="clocker.less" />
  <script src="//cdnjs.cloudflare.com/ajax/libs/less.js/3.9.0/less.min.js" ></script>
  <script src="//ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
```
```
  <script src="clocker.js"></script>
```

3. Place EventClocker McClockyFace 500 Turbo Deluxe somewhere on your website.
```
  <div class="clocker"></div>
``` 
4. If you want to display the events as text, add also the following wrappers somewhere in your website. These templates are freely editable, just keep the class names the same as defined in `clocker.js`. By default these are `upcomings wrapper` and `ongoings wrapper` for the wrappers and `upcoming events` and `ongoing events` for the containers. Wrappers can contain any kind of content, such as titles in this example. Containers will list only the events. Wrappers can be hidden altogether if there is nothing in the container, and that will happen by default.
```
  <div class="upcomings wrapper">
    <strong>Coming up</strong>
    <div class="upcoming events"></div>
  </div>

  <div class="ongoings wrapper">
    <strong>Happening now</strong>
    <div class="ongoing events"></div>
  </div>
```
5. Replace events in `events.txt` with your own. You may also [host events.txt in Dropbox](#protip-host-eventstxt-in-dropbox-for-easy-updating) for easy updating.
6. Done.

### Settings

You can edit any of the settings in `clocker.js`:
```
var event_type = 'arcs';                        // 'lines', 'arcs' or 'both'. 'pie' is also available, but it's highly unuseful.
var start_lines_only = true;                    // When 'lines' or 'both' are displayed, display lines only for start times.
var events_txt = 'events.txt';                  // File containing your events in semicolon-separated format.
var clock_container = '.clocker';               // Element in which to place EventClocker McClockyFace itself.

var display_descriptions = true;                // Display ongoing events.
var hide_wrappers_when_empty = true;            // Hide wrappers when empty. Wrappers may contain titles and other content.
var ongoing_wrapper = '.ongoings.wrapper';      // Wrapper for ongoing events (parent of ongoing_container).
var upcoming_wrapper = '.upcomings.wrapper';    // Wrapper for upcoming events (parent of upcoming_container).
var ongoing_container = '.ongoing.events';      // Element in which to list descriptions of ongoing events.
var upcoming_container = '.upcoming.events';    // Element in which to list descriptions of upcoming events.
var show_upcoming_before = 60;                  // Show upcoming events this many minutes before it start. 1500 = list all today's events. 

var default_color = 'rgba(255, 255, 255, .5)';  // Default color of events on clocker (arcs, lines, etc).
var refresh_interval = 15;                      // Interval in minutes, in which events_txt is reloaded.
var distance = .6;                              // Max distance of event from clock center. For aesthetics.
``` 

### Events Data

In your events txt file, events should be separated by line-breaks, and event details by semicolon (;) as shown in the examples.
The first detail is the event time. It should always have both day and time of day separated by whitespace. For the day, you can use 
- a date, e.g. _2021-06-21_
- shortened weekday names, e.g. _mon_, _fri-sat_
- value _daily_ if the event occurs every day.

Event color can be specified in any CSS-accepted format (color name, hex, rgb, rgba, etc.). If you don't want to specify a color, always input a hyphen instead.

#### #protip: Host events.txt in [Dropbox](https://www.dropbox.com) for easy updating.

1. Place `events.txt` somewhere in your Dropbox.
2. Right-click it and select _Copy Dropbox Link_.
3. Edit `clocker.js` and locate line 3 `var events_txt = 'events.txt';`.
4. Replace `events.txt` with the Dropbox Link from your clipboard and save.

End result should look something like this:
```
var events_txt = 'https://www.dropbox.com/s/b666pwrytk1pepm/events.txt?dl=0';
```
