require 'net/http'
require 'json'
require 'httparty'
require 'csv'

# the spreadsheet uses "yes" to represent "you have that right", blank to
# represent "you do not have this right", with any other value being
# that you have the right "sometimes". in that case we just use the text directly.
def parse_text text
  if ["yes"].include? text
    true
  elsif text.nil? or text.empty?
    false
  else
    text
  end
end

# given a string of CSV, parse it and build up the JSON to load into the system
def build_json_from_csv str
  csv = CSV.parse(str, {headers: true})

  locations = []

  # use this to pull the columns
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

    if state and not state.empty?
      id = state.strip
      type = "state"
    end

    # to be a county, we have to have a state as well
    if state and county and not county.empty?
      id = "#{id}:#{county.strip}"
      type = "county"
    end

    # to be a city, we need a state and county as well
    if state and county and city and not city.empty?
      id = "#{id}:#{city.strip}"
      type = "city"
    end

    location_json["id"] = id.strip
    location_json["type"] = type
    location_json["rights"] = rights

    locations << location_json
  end

  locations
end

# pulls the spreadsheet from google and turns it into json
def spreadsheet_as_json
  spreadsheet_csv_url = 'https://docs.google.com/spreadsheet/pub?key=0Aj53kqb3f8vYdFdJTnpSYXZKZF9iUVctMEo4bGJkcnc&single=true&gid=0&output=csv'

  text = HTTParty.get(spreadsheet_csv_url).body

  build_json_from_csv text
end

# given some json and an address, sends the data up.
def send_json_to_redis json, node_host = 'localhost', node_port = 3000
  load_resource = '/load'

  http = Net::HTTP.new(node_host, node_port)
  http.post(load_resource, json.to_json, { 'Content-Type' => 'application/json' })
end

# this function does all the work to grab the spreadsheet in XML, parse it out into json,
# and send it into redis.
def repopulate_redis node_host = 'localhost', node_port = 3000
  json = spreadsheet_as_json

  send_json_to_redis json
end

host = (ARGV[0] or 'localhost')
port = (ARGV[1] or 3000)

repopulate_redis host, port
