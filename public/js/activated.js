'use strict';
riot.tag2('activated', '  <input type="checkbox" __checked="{activated}" onchange="{onChange}">\n', '', '', function(opts) {
    this.activated = opts.activated;

    let url = '/users/update';

    this.onChange = function(e) {
      $.post(url,
        {
          activated: e.target.checked
        },
        (data, status) => {
          console.log(data);
          console.log(status);
        }
      );
    }.bind(this)
});