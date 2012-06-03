if (typeof PGN === 'undefined' || !PGN) {
  var PGN = {};
}

if (typeof PGN.core === 'undefined' || !PGN.core) {
  PGN.core = {};
}

PGN.core = (function ($) {
  var _self;
  var dt = new Date();
  var hashPW = 'sara' + dt.getFullYear() + ("0" + (dt.getMonth() + 1)).slice(-2);

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

      buildRightsList: function () {
        var list = '';
        var rights = _self.nameToDisplayNameMap;

        $.each(rights, function (key, value) {
          if (value) {
            //var id = value.id.split(':');
            //var name = id[id.length - 1];
            list += '<option value="' + key + '">' + value + '</option>';
          }          
        });

        list += '</select>';
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

      getState: function (state, desc, right) {
        $.ajax({
          url: '/rights?state=' + state,
          dataType: 'json',
          success: function (data) {
            //alert(right);
            //console.log(data);
            if (data['state']['rights'][right]['more_info']) {
              data['state']['rights'][right]['more_info']['description'] = desc;
            } else {
              data['state']['rights'][right]['more_info'] = { 'description' : desc };
            }
            _self.saveData(data);
          },
          error: function (data) {
            console.log(data);
          }
        });
      },

      saveData: function (items) {
        $.ajax({
          type: 'POST',
          url: '/load',
          data: items.state,
          dataType: 'json',
          success: function (data) {
            console.log(items);
            _self.injectRights(items);
          },
          error: function (data) {
            console.log(data);
          }
        });
      },

      getDescription: function(key, right) {
        var state = '';
        var city = '';
        var county = '';
        var split = key.split(':');

        if (split.length >= 1) {
          state = split[0];
        }

        if (split.length >= 2) {
          county = split[1];
        }

        if (split.length == 3) {
          city = split[2];
        }

        $.ajax({
          url: '/rights?state=' + state + '&city=' + city + '&county=' + county,
          dataType: 'json',
          success: function (data) {
            var html = 'Test';
            if (data) {
              var dataToUse = '';
              if (split.length == 1) {
                dataToUse = data.state;
              } else if (split.length == 2) {
                dataToUse = data.county;
              } else if (split.length == 3) {
                dataToUse = data.city;
              }

              html = dataToUse.rights[right]["more_info"].description;
              $('.content p.desc').append(html);
            }
            console.log(data);
          },
          error: function (data) {
            console.log(data);
          }
        });
      },

      clear: function () {
        $('h2.user-location').removeClass('visible');
        $('p.address').html('');
        $('ul.rights li').remove();
      },

      checkPW: function(raw) {
        console.log(hashPW);
        return hashPW == raw;
      } 
  };

  return _self;
})(jQuery);
