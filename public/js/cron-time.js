'use strict';
riot.tag2('cron-time', '  <select onchange="{onChange}">\n    <option each="{hours}" value="{hour}" __selected="{selected}">{hour}</option>\n  </select>\n', '', '', function(opts) {
    const self = this;

    function range(start, end) {
      return Array.apply(Array, Array(1 + end - start)).map((_, i) => {
        return i + start;
      });
    }

    function modRange(start, mod) {
      return Array.apply(Array, Array(mod)).map((_, i) => {
        return (i + start) % mod;
      });
    }
    function createHours(dayStart) {
      return  modRange(dayStart + 1, 24).map((hour) => {
        return {hour: hour};
      });
    }

    function setSelected(selected, hours) {
      return hours.map((hour) => {
        hour.selected = selected == hour.hour ? true : false;
        return hour;
      });
    }

    this.hours = setSelected(opts.cronTime, createHours(opts.dayStart));

    let url = '/users/update';

    this.onChange = function(e) {
      this.hours = setSelected(e.target.value, this.hours);
      $.post(url,
        {
          cronTime: e.target.value
        },
        (data, status) => {
          console.log(data);
          console.log(status);
        }
      );
    }.bind(this)
});