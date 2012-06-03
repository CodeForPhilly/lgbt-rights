require 'net/http'
require 'json'
require 'httparty'
require 'csv'

def parse_text text
  if ["yes"].include? text
    true
  elsif text.nil?
    false
  else
    text
  end
end

def build_json_from_csv str
  csv = CSV.parse(str, {headers: true})

  locations = []

  right_names = ["workplace_sexual_orientation", "workplace_gender_identity", "housing_sexual_orientation", "housing_gender_identity", "hatecrime_sexual_orientation", "hatecrime_gender_identity", "marriage", "civil_union", "domestic_partner", "outofstate_marriage_recognition", "adoption_single", "second_parent_adoption", "bullying_gender_identity", "bullying_sexual_orientation"]

  csv.each do |row|
    location_json = {}
    rights = {}

    right_names.each do |right|
      header_index = csv.headers.index right
      value = row[header_index]

      rights[right] = {}
      rights[right]["value"] = parse_text value
    end

    state = row[csv.headers.index('State')]
    county = row[csv.headers.index('County')]
    city = row[csv.headers.index('City')]

    id = ""
    type = ""

    if state
      unless state.empty?
        id = state.strip
        type = "state"
      end
    end

    if state and county
      if county and not county.empty?
        id = "#{id}:#{county.strip}"
        type = "county"
      end
    end

    if state and county and city
      if city and not city.empty?
        id = "#{id}:#{city.strip}"
        type = "city"
      end
    end

    location_json["id"] = id.strip
    location_json["type"] = type
    location_json["rights"] = rights

    locations << location_json
  end

  locations
end

def spreadsheet_as_json
  spreadsheet_csv_url = 'https://docs.google.com/spreadsheet/pub?key=0Aj53kqb3f8vYdFdJTnpSYXZKZF9iUVctMEo4bGJkcnc&single=true&gid=0&output=csv'

  text = HTTParty.get(spreadsheet_csv_url).body

  build_json_from_csv text
end

def send_json_to_redis json, node_host = 'localhost', node_port = 3000
  load_resource = '/load'

  http = Net::HTTP.new(node_host, node_port)
  http.post(load_resource, json.to_json, { 'Content-Type' => 'application/json' })
end

# this function does all the work to grab the spreadsheet in XML, parse it out into json,
# and send it into redis.
def repopulate_redis
  json = spreadsheet_as_json

  send_json_to_redis json
end
