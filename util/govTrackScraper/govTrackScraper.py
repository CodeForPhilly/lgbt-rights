#!usr/bin/python

import sys
import urllib2
import json
import sqlite3
import re

govTrackBillURL = "http://www.govtrack.us/api/v1/bill/?limit=1000&current_status_date__gte="
billDB = "bills.db"

def govTrackScraper(startDate, keyWordList):
	finalURL = govTrackBillURL + startDate
	jsonResult
	#get json
	try:
		result = urllib2.urlopen(govTrackBillURL)
		jsonResult.loads(result)
	except urllib2.URLError, e:
		handleError(e)
	
	#setup db connection
	connection = sqlite3.connect(bills.db)
	billsCursor = connection.cursor()
	bills = jsonResult["objects"]
	
	#generate regex
	regex = ""
	for key in keyWordList:
		regex = regex + "|" + key
	regex = regex[1:]
	
	#for each bill in the json bills array see if we want to add it to the db
	for bill in bills
		#break if bill is already in system
		billsCursor.execute('select * from federal_bills where govTrack_ID = ? ', bill["id"])
		if(billsCursor.fetchone() == None):
			break
		#if bill title contains keyword add it
		match = re.search(regex, bill["title"].lower())
		if(match != None):
			billsCursor.execute('insert into federal_bills values (?,?,?,?)', [bill["title"], bill["link"], bill["current_status_date"], bill["id"]]
			break
		#get full text and check for keywords
		billText = ""
		try: 
			billText = urllib2.urlopen(bill[links]+"/text")
		except urllib2.URLError, e:
			handleError(e)
		match = re.seach(regex, billText.lower())
		if(match != None):
			billsCursor.execute('insert into federal_bills values (?,?,?,?)', [bill["title"], bill["link"], bill["current_status_date"], bill["id"]]
def main():
	keyWords = []
	infile = open(sys.argv[2], "r")
	while infile:
		line = infile.readline()
		keywords.append(line)
	govTrackerScraper(sys.argv[1], keyWords)

if __name__ == "__main__":
	main()
