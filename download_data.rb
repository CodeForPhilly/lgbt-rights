require 'rexml/document'
require 'net/http'

include REXML

def get_root_from_url host, resource_url
  resource = Net::HTTP.new(host, 80)
  headers, data = resource.get(resource_url)
  resource.close

  doc = Document.new data
  doc.root
end

def parse_text text
  ["yes"].include? text
end

def build_json root
  right_names = ["workplacesexualorientation","workplacegenderidentity","housingsexualorientation","housinggenderidentity","hatecrimesexualorientation","hatecrimegenderidentity","marriage","civilunion","domesticpartner","outofstatemarriagerecognition","adoptionsingle","secondparentadoption","bullyinggenderidentity","bullyingsexualorientation"]

  right_name_map = {"workplacesexualorientation"=>"workplace_sexual_orientation", "workplacegenderidentity"=>"workplace_gender_identity", "housingsexualorientation"=>"housing_sexual_orientation", "housinggenderidentity"=>"housing_gender_identity", "hatecrimesexualorientation"=>"hatecrime_sexual_orientation", "hatecrimegenderidentity"=>"hatecrime_gender_identity", "marriage"=>"marriage", "civilunion"=>"civil_union", "domesticpartner"=>"domestic_partner", "outofstatemarriagerecognition"=>"outofstate_marriage_recognition", "adoptionsingle"=>"adoption_single", "secondparentadoption"=>"second_parent_adoption", "bullyinggenderidentity"=>"bullying_gender_identity", "bullyingsexualorientation"=>"bullying_sexual_orientation"}

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
        end
      end

      state = location.elements["gsx:state"]
      county = location.elements["gsx:county"]
      city = location.elements["gsx:city"]

      id = ""
      type = ""

      if state
        unless state.text.empty?
          id = state.text
          type = "state"
        end
      end

      if state and county
        if county.text and not county.text.empty?
          id = "#{id}:#{county.text}"
          type = "county"
        end
      end

      if state and county and city
        if city.text and not city.text.empty?
          id = "#{id}:#{city.text}"
          type = "city"
        end
      end

      location_json["id"] = id.strip
      location_json["type"] = type
      location_json["rights"] = rights

      locations << location_json
    end
  end

  locations
end
