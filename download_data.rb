require 'rexml/document'
require 'net/http'

include REXML

# host = 'https://spreadsheets.google.com'
# resource_url = '/feeds/worksheets/tWINzRavJd_bQW-0J8lbdrw/private/full/od6'

# resource = Net::HTTP.new(host, 80)
# headers, data = resource.get(resource_url)
# resource.close

# doc = Document.new data
# root = doc.root

def parse_text text
  if ["yes"].include? text
    true
  else
    false
  end
end

def zip list1, list2
  map = {}
  list1.count.times do |i|
    map[list1[i]] = list2[i]
  end

  map
end

def build_json root
  right_names = ["workplacesexualorientation","workplacegenderidentity","housingsexualorientation","housinggenderidentity","hatecrimesexualorientation ","hatecrimegenderidentity","marriage","civilunion","domesticpartner ","outofstatemarriagerecognition","marriageban","constitutionalmarriageban","adoptionsingle","secondparentadoption","bullyinggenderidentity","bullyingsexualorientation"]

  right_name_map = {"workplacesexualorientation"=>"workplace_sexual_orientation", "workplacegenderidentity"=>"workplace_gender_identity", "housingsexualorientation"=>"housing_sexual_orientation", "housinggenderidentity"=>"housing_gender_identity", "hatecrimesexualorientation"=>"hatecrime_sexual_orientation ", "hatecrimegenderidentity"=>"hatecrime_gender_identity", "marriage "=>"marriage", "civilunion"=>"civil_union", "domesticpartner"=>"domestic_partner", "outofstatemarriagerecognition"=>"outofstate_marriage_recognition", "marriageban"=>"marriage_ban", "constitutionalmarriageban"=>"constitutional_marriage_ban", "adoptionsingle"=>"adoption_single", "secondparentadoption"=>"second_parent_adoption", "bullyinggenderidentity"=>"bullying_gender_identity", "bullyingsexualorientation"=>"bullying_sexual_orientation"}

  locations = []

  root.elements.each('//entry') do |location|
    if location.kind_of? REXML::Element
      location_json = {}

      rights = {}

      right_names.each do |name|
        elem = location.elements["gsx:#{name}"]
        if not elem.nil?
          rights[right_name_map[name]] = {}
          rights[right_name_map[name]]["value"] = parse_text elem.text
        else
          puts "was null at: #{name}"
        end
      end

      state = location.elements["gsx:state"].text
      puts "state is now: #{state}"
      county = nil
      city = nil

      id = state
      type = "state"

      if county
        id = "#{id}:#{county}"
        type = "county"
      end

      if city
        id = "#{id}:#{city}"
        type = "city"
      end

      location_json["id"] = id.strip
      location_json["type"] = type
      location_json["rights"] = rights

      locations << location_json
    end
  end

  locations
end
