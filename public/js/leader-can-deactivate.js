'use strict';
riot.tag2('leader-can-deactivate', '  <input type="checkbox" __checked="{leaderCanDeactivate}" onchange="{onChange}">\n', '', '', function(opts) {
    this.leaderCanDeactivate = opts.leaderCanDeactivate;

    let url = '/users/update';

    this.onChange = function(e) {
      $.post(url,
        {
          leaderCanDeactivate: e.target.checked
        },
        (data, status) => {
          console.log(data);
          console.log(status);
        }
      );
    }.bind(this)
});