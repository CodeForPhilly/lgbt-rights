if (typeof PGN === 'undefined' || !PGN) {
  var PGN = {};
}

if (typeof PGN.core === 'undefined' || !PGN.core) {
  PGN.core = {};
}

PGN.core = (function ($) {
  var _self;

  _self = {
      injectRights: function (data) {
        $('.content ul.rights').append(_self.buildRightsTemplate(data));
      },

      cleanRight: function(right, value) {
        switch(right) {
          case 'marriage':
            return 'Marriage';
          case 'discrimination':
            return 'Discrimination protections';
          case 'domestic_partnership':
            return 'Domestic-partner registry';
          case 'civil union':
            return 'Civil Union';
          case 'employment':
            return 'Employment discrimination protections';
          case 'adoption':
            return 'Adoption rights';
          case 'legal_gender_change':
            return 'Legal gender change';
          case 'hate_crimes':
            return 'Hate crimes protections';
          case 'bullying_protection':
            return 'Bullying protection';
          case 'housing':
            return 'Housing discrimination protections';
	  default:
	    return right;
        }
      },

      buildRightsTemplate: function (data) {
        var list = '';

        $.each(data, function (key, value) {
          if (value) {
            var id = value.id.split(':');
            var name = id[id.length - 1];
            list += '<li class="header">' + name + ' (' + key + ')<ul>';
            $.each(value.rights, function (key2, value2) {
	      if (value2.more_info) {
                list += '<li class="' + value2.value + '"><a href="/moreinfo?key=' + value.id + '&right=' + key2 + '" target="_blank">' + value2.display_name + '</a>';
	      } else {
                list += '<li class="' + value2.value + '">' + value2.display_name;
	      }

	      if (value.condition) {
                list += ' (' + value.condition + ')';
	      }
	      list += '</li>';
            });
            list += '</ul></li>';
          }
        });

        return list; //_.template(template, {result: data})
      },

      getData: function (params) {
        $.ajax({
          url: '/rights?state=' + params.state + '&city=' + params.city + '&county=' + params.county,
          dataType: 'json',
          success: function (data) {
            console.log(data);
            _self.injectRights(data);
          },
          error: function (data) {
            console.log(data);
          }
        });
      },

      getDescription: function(key) {
        var values = key.split(':')
        var state = '';
        var city = '';
        var county = '';

        if (value.length == 3) {
          state = values[0];
          city = values[1];
          county = values[2];
        } else if (value.length == 2) {
          state = values[0];
          city = values[1];
        } else if (value.length == 1) {
          state = values[0];
        }

        var redis = require('redis').createClient();
        var data = {};

        redis.get(state, function(err, val) {
          data.state = JSON.parse(val);
          redis.get(state + ':' + city, function(err, val) {
            data.county = JSON.parse(val);
            redis.get(state + ':' + city + ':' + county, function(err, val) {
              data.city = JSON.parse(val);
              fn(null, data);
            });
          });
        });
      },

      clear: function () {
        $('h2.user-location').removeClass('visible');
        $('p.address').html('');
        $('ul.rights li').remove();
      }

      /*getTitle: function(key) {
        var redis = require('redis').createClient();
        redis.get(key, function(err, val) {
          return JSON.parse(val)
        });
      }*/
  };

  return _self;
})(jQuery);
