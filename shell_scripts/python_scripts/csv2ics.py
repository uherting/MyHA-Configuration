#!/usr/bin/python3

import csv
from ics import Calendar, Event

c = Calendar()

counts = []
frequencies = []

file_name = "ds_2021_to_2031"

# print("{0};{1}".format("Wann", "Was"))
for row in csv.DictReader(open(file_name + '.csv'), delimiter=';'):
    data_what = row['Was'].rstrip()
    data_when = row['Wann'].rstrip()
    (d,m,yr) = data_when.split('.')
    data_when = yr + "-" + m + "-" + d

    print("{0};{1}".format(data_when, data_what))

    counts.append(data_what)
    frequencies.append(data_when)

    # python:
    # print("Wann: X%sX   Was: X%sX" % (data_when, data_what))
    # python3:
    print("Wann: !{1}!   Was: !{0}!   ".format(data_what, data_when))

    e = Event()
    e.name = data_what
    e.begin = data_when + ' 00:00:00'
    c.events.add(e)

    # print(e)
    # print("")

# c.events
# [<Event 'My cool event' begin:2014-01-01 00:00:00 end:2014-01-01 00:00:01>]
with open(file_name + '.ics', 'w') as my_file:
    my_file.writelines(c)

# print('Counts = ', counts)
# print('frequency = ', frequencies)

#(d,m,yr) = txt.split('.')
#print(yr + m + d)

#BEGIN:VEVENT
#SUMMARY:Karfreitag
#UID:987788569c8f590239ff05bf44e5eef10293fc99@de-Kalender.de
#CATEGORIES:Feiertag
#DTSTART;TZID=Europe/Berlin:20220415
#DTEND;TZID=Europe/Berlin:20220416
#DESCRIPTION:Der 15.04.2022 ist ein bundesweiter Feiertag.\n\nMehr zu Feiertagen unter:\n\nhttp://de-kalender.de/
#URL:http://de-kalender.de/
#TRANSP:TRANSPARENT
#END:VEVENT
