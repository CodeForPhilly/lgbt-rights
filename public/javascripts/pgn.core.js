if (typeof PGN === 'undefined' || !PGN) {
  var PGN = {};
}

if (typeof PGN.core === 'undefined' || !PGN.core) {
  PGN.core = {};
}

PGN.core = (function ($) {
  var _self;

  _self = {
      nameToDisplayNameMap: {
          marriage: 'Marriage',
          workplace_sexual_orientation: 'Workplace discrimination protections (sexual orientation)',
          workplace_gender_identity: 'Workplace discrimination protections (gender identity)',
          housing_sexual_orientation: 'Housing discrimination protections (sexual orientation)',
          housing_gender_identity: 'Housing discrimination protections (gender identity)',
          hatecrime_sexual_orientation: 'Hate-crime protections (sexual orientation)',
          hatecrime_gender_identity: 'Hate-crime protections (gender identity)',
          civil_union: 'Civil unions',
          domestic_partner: 'Domestic-partner registry',
          outofstate_marriage_recognition: 'Out-of-state marriage recognition',
          adoption_single: 'Adoption (single-parent)',
          second_parent_adoption: 'Adoption (second-parent)',
          bullying_gender_identity: 'Bullying protections (gender identity)',
          bullying_sexual_orientation: 'Bullying protections (sexual orientation)'
      },

      injectRights: function (data) {
        $('.content ul.rights').append(_self.buildRightsTemplate(data));
      },

      cleanRight: function(right, value) {
          return _self.nameToDisplayNameMap[right];
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
                    list += '<li class="' + value2.value + '"><a href="/moreinfo?key=' + value.id + '&right=' + key2 + '" target="_blank">' + _self.cleanRight(key2) + '</a>';
	              } else {
                    list += '<li class="' + value2.value + '">' + _self.cleanRight(key2);
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
