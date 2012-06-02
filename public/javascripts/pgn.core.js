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
            $.each(value.rights, function (key2, value) {
	      if (value.more_info) {
                list += '<li class="' + value.value + '"><a href="/more_info?key=' + key + '&right=' + key2 + '" target="_blank">' + value.display_name + '</a>';
	      } else {
                list += '<li class="' + value.value + '">' + value.display_name;
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

      getDescription: function(key, right) {
        alert('DESC');
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
            alert('DATA');
            var html = 'Test';
            if (data) {
              var dataToUse = null;
              if (split.length == 1) {
                dataToUse = data.state;
              } else (split.length == 2) {
                dataToUse = data.county;
              } else (split.length == 3) {
                dataToUse = data.city;
              }
              alert('FOUND DATA');
              if (dataToUse) {
                $.each(dataToUse.rights, function (key2, value) {
                  if (key2 == right) {
                    if (value.description) {
                      html = value.description;
                    }
                  }
                });
              }

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
      }
  };

  return _self;
})(jQuery);
