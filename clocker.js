var event_type = 'arcs';                        // 'lines', 'arcs' or 'both'. 'pie' is also available, but it's highly unuseful.
var start_lines_only = true;                    // When 'lines' or 'both' are displayed, display lines only for start times.
var events_txt = 'events.txt';                  // File containing your events in semicolon-separated format.
var clock_container = '.clocker';               // Element in which to place EventClocker McClockyFace itself.
var hide_past_events = false;                   // Hide event from clockface when event has ended.
var refresh_interval = 15;                      // Interval in minutes, in which events_txt is reloaded & events on clockface updated.

var display_descriptions = true;                // Display lists of ongoing & upcoming events.
var hide_wrappers_when_empty = true;            // Hide wrappers when empty. Wrappers may contain titles and other content.
var ongoing_wrapper = '.ongoings.wrapper';      // Wrapper for ongoing events (parent of ongoing_container).
var upcoming_wrapper = '.upcomings.wrapper';    // Wrapper for upcoming events (parent of upcoming_container).
var ongoing_container = '.ongoing.events';      // Element in which to list descriptions of ongoing events.
var upcoming_container = '.upcoming.events';    // Element in which to list descriptions of upcoming events.
var show_upcoming_before = 1500;                // Show upcoming event this many minutes before it starts. 1500 = list all today's events. 

// Arch settings
var default_color = 'rgba(1255,255,255,.5)';    // Default color of events on clocker (arcs, lines, etc).
var distance = .6;                              // Max distance of event from clock center. For aesthetics.
var separation = .1;                            // Radial distance between arcs. .03 = overlap; .07 = small gap; .1 = large gap.
var width = .02;                                // Radial width of arcs.
// ---------------------------------------------------------------------------------------------------------

const analog_template = `
  <div class="analog clock">
      <div class="events"></div>
      <div class="outer-clock-face">
        <div class="inner-clock-face">
          <div class="marking marking-one"></div>
          <div class="marking marking-two"></div>
          <div class="marking marking-three"></div>
          <div class="marking marking-four"></div>
          <div class="inner-clock-face">
          <div class="hand hour-hand"></div>
          <div class="hand min-hand"></div>
          <div class="hand second-hand"></div>
          </div>
      </div>
  </div>
`;

var clock_updater;
var ongoing_minute = -1;
var ongoing_len = 0;
var upcoming_len = 0;

refresh_interval = refresh_interval * 1000 * 60;
show_upcoming_before = (show_upcoming_before + 1) * 1000 * 60;

if(events_txt.indexOf('www.dropbox.com') > -1){
  events_txt = events_txt.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
}

function updateAnalog(el, timestamps) {
  const now = new Date();
  const seconds = now.getSeconds();
  const seconds_degrees = ((seconds / 60) * 360) + 90;
  $(el).find('.second-hand').css('transform', 'rotate('+seconds_degrees+'deg)');

  const mins = now.getMinutes();
  const mins_degrees = ((mins / 60) * 360) + ((seconds/60)*6) + 90;
  $(el).find('.min-hand').css('transform', 'rotate('+mins_degrees+'deg)');

  const hour = now.getHours();
  const hour_degrees = ((hour / 12) * 360) + ((mins/60)*30) + 90;
  $(el).find('.hour-hand').css('transform', 'rotate('+hour_degrees+'deg)');

  const timestamp = +new Date();
  if(mins != ongoing_minute){
    timestamps.forEach((stamp) => {
      const id = stamp[0];
      const event = stamp[1];
      const start = stamp[2];
      const end = stamp[3];
      if(display_descriptions){
        // Display upcoming event
        if(!$(upcoming_container).find('.eu'+id).length && timestamp >= start-show_upcoming_before && timestamp < start) {
          $(upcoming_container).prepend('<div class="event-description eu'+id+'" style="color:'+event.color+'">'+event.description+'</div>');
        }
        if($(upcoming_container).find('.eu'+id).length && timestamp >= start) {
          $(upcoming_container).find('.eu'+id).remove();
        }
        // Display ongoing event
        if(!$(ongoing_container).find('.eo'+id).length && timestamp >= start && timestamp < end) {
          $(ongoing_container).prepend('<div class="event-description eo'+id+'" style="color:'+event.color+'">'+event.description+'</div>');
        }
        if($(ongoing_container).find('.eo'+id).length && timestamp < start || timestamp >= end) {
          $(ongoing_container).find('.eo'+id).remove();
        }
      }
    });

    // If no upcoming or ongoing events to display, hide wrappers accordingly.
    if(display_descriptions && hide_wrappers_when_empty) {
      $(upcoming_container).find('.event-description').length ? $(upcoming_wrapper).show() : $(upcoming_wrapper).hide();
      $(ongoing_container).find('.event-description').length ? $(ongoing_wrapper).show() : $(ongoing_wrapper).hide();
    }

    // Recreate clockface if events changed.
    if(hide_past_events && ($(upcoming_container).find('.event-description').length != upcoming_len || $(ongoing_container).find('.event-description').length || ongoing_len)) {
      initClocker(clock_container);
    }
  }
  ongoing_minute = mins;
  upcoming_len = $(upcoming_container).find('.event-description').length;
  ongoing_len = $(ongoing_container).find('.event-description').length;
}

function addEvent(el, start, end, description, color, event_index=0, type=event_type) {
  var e_distance = distance;
  var center = $(el).width() / 2;
  var radius = type=='pie' ? center * e_distance : center * e_distance - center * separation * event_index;

  var start_hour = Number(start.split(':')[0]);
  var start_mins = Number(start.split(':')[1]);
  var end_hour = Number(end.split(':')[0]);
  var end_mins = Number(end.split(':')[1]);
  var pie_hour = (Math.PI/6);

  if(start_hour >= 12) start_hour-12;
  if(end_hour >= 12) end_hour-12;

  var hours_duration = end_hour - start_hour;
  var mins_duration = (end_mins - start_mins) / 60;
  var duration = hours_duration + mins_duration;

  if(type!='lines'){
    var start = pie_hour * (start_hour+(start_mins/60)) - (3 * pie_hour);
    var end = start + duration * pie_hour;
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'event'+event_index);
    canvas.setAttribute('width', $(el).width());
    canvas.setAttribute('height', $(el).height());
    var ctx = canvas.getContext("2d");
    ctx.arc(center, center, radius, start, end);
    ctx.strokeStyle = color=='-' ? default_color : color;
    ctx.lineWidth = type=='pie' ? center * .7 : center * width;
    ctx.stroke();
    $(el).find('.events').append(canvas);
  }
  
  if(type!='arcs' && type!='pie'){
    var times = start_lines_only ? [[start_hour, start_mins]] : [[start_hour, start_mins], [end_hour, end_mins]];
    times.forEach((hm) => {
      hour = hm[0];
      mins = hm[1];
      var hour_degrees = (360 / 12) * hour;
      var min_deg = ((360 / 12) ) * (mins / 60);
      var rotation = hour_degrees + min_deg;
      var event_el = '<div class="event" style="transform: rotate('+rotation+'deg); border-right-color: '+color+'"></div>';
      $(el).find('.events').append(event_el);
    });
  }

  event_index++;
}

function parseEvents(data) {
  var events = data.split(/\n\s*\n/);
  events = events[0].split('\n').filter(function(line){return line.indexOf('#') != 0});
  eventDetails = [];
  events.forEach(function(line, i){
    var itm = line.split(';');
    if(itm.length > 1){
      var details = {
        date: itm[0].trim().split(' ')[0].trim(),
        start: itm[0].trim().split(' ')[1].split('-')[0].trim(),
        end: itm[0].trim().split(' ')[1].split('-')[1].trim(),
        color: itm[1].trim(),
        description: itm[2].trim(),
      }
    }
    eventDetails.push(details);
  });
  return eventDetails;

}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

function initClocker(el, type='analog') {
  const template = type=='digital' ? digi_template : analog_template;
  $(el).empty().html(template);
  clearInterval(clock_updater);

  $.get({
    url: events_txt + '?' + new Date().getTime(),
    async: false,
    success: function(data) {

      const events = parseEvents(data);

      setTimeout(() => {
        // Fix layout
        el_w = $(el).width();
        el_h = $(el).height();
        if(el_h > el_w) $(el).css('height', $(el).width()+'px');
        if(el_h < el_w) $(el).css('width', $(el).height()+'px');
    
        // Add events
        let this_day = new Date();
        let offset = this_day.getTimezoneOffset();
        today = new Date(this_day.getTime() - (offset*60*1000));
        today = today.toISOString().split('T')[0];
        var today_name = this_day.toString().split(' ')[0].toLowerCase();
        var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
        days.push(...days);
        let event_index = 0;
        let timestamps = [];
        events.forEach((event, index) => {
          if(event.date == 'daily') event.date = today;
          var regexp = /[a-zA-Z]/g;
          if(regexp.test(event.date)){
            var event_days = [];
            var start_day = end_day = event.date;
            if(event.date.includes('-')){
              start_day = event.date.split('-')[0];
              end_day = event.date.split('-')[1];
            }
            var pushing = stop_pushing = false;
            days.forEach((day) => {
              if(day == start_day && stop_pushing == false) pushing = true;
              if(pushing) event_days.push(day);
              if(day == end_day) {
                pushing = false;
                stop_pushing = true;
              }
            });
            if(event_days.includes(today_name)) event.date = today;
          }

          const nix_today = +new Date();
          const nix_start = +new Date(today+' '+event.start+':00');
          const nix_end = +new Date(today+' '+event.end+':00');

          let pass = hide_past_events ? nix_end > nix_today : true ;

          if(event.date == today && pass) {
            timestamps.push([event_index, event, nix_start, nix_end]);
            addEvent(el, event.start, event.end, event.description, event.color, event_index);
            event_index++;
          }

        });

        if(!display_descriptions) {
          $(ongoing_wrapper).remove();
          $(upcoming_wrapper).remove();
        }

        updateAnalog(el, timestamps);
        clock_updater = setInterval(function(){
            updateAnalog(el, timestamps);
        }, 1000);

      });
    }
  });

}

$(document).ready(function(){
  setTimeout(() => {
    initClocker(clock_container);
  }, 300);
  var refresh = setInterval(() => {
    initClocker(clock_container);
  }, refresh_interval);
});
