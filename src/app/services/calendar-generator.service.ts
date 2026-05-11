import {Injectable} from '@angular/core';
import * as moment from "moment-timezone"
import {AthanDataItem, AthanDate} from "../models/AthanDataItem";
import CalendarSettings from "../models/CalendarSettings";
import {Prayers} from "../models/Prayers";

@Injectable({
  providedIn: 'root'
})
export class CalendarGeneratorService {

  constructor() { }

  generateICS(meetingDetails: Array<AthanDataItem>, calendarSettings : CalendarSettings) : string {
    const rtlMark = '\u200F'; // Right-To-Left Mark
    const ltrMark = '\u200E'; // Left-To-Right Mark


    const timeZone = meetingDetails[0].meta.timezone

    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WhiteBatIslam//EN`;

    meetingDetails.forEach((athanData: AthanDataItem) => {

      const now = moment.tz(new Date(), timeZone)
      calendarSettings.prayersToSave.forEach(prayer =>{

        const prayerTimeStr = AthanDataItem.getPrayerTimeStr(athanData,prayer)
        const prayerDate = moment(prayerTimeStr, "DD-MM-YYYYTHH:mm").toDate()
        const reminderStart = moment(prayerTimeStr, "DD-MM-YYYYTHH:mm").toDate()
        const reminderEnd = new Date()
        reminderStart.setMinutes(prayerDate.getMinutes() - calendarSettings.startMinutesBefore)
        const momStart = moment.tz(reminderStart, timeZone)

        if(AthanDate.isFriday(athanData.date) && prayer === Prayers.DHUHR){
          if(calendarSettings.prayersToSave.includes(Prayers.JUMUAA)){
            reminderEnd.setTime(reminderStart.getTime() + calendarSettings.jumuaaConfig.durationMinutes * 60000);
            reminderStart.setTime(reminderStart.getTime() - calendarSettings.jumuaaConfig.beforeInMinutes * 60000);
          }else{
            reminderEnd.setTime(reminderStart.getTime() + calendarSettings.durationMinutes * 60000); // if jumuaa isn't selected then set the normal duration
          }
        }else{
          reminderEnd.setTime(reminderStart.getTime() + calendarSettings.durationMinutes * 60000);
        }
        const momEnd = moment.tz(reminderEnd, timeZone)
        if(Object.hasOwn(athanData.timings, prayer))
        icsContent += `
BEGIN:VEVENT
UID:${prayerDate.getFullYear()}-${prayerDate.getMonth()+1}-${prayerDate.getDate()}-${prayer}@whitebat.islam
SUMMARY:Athan for ${prayer} in ${calendarSettings.startMinutesBefore} Minutes
DTSTAMP:${now.format("YYYYMMDDTHHmmss")}
DTSTART;TZID=${athanData.meta.timezone}:${momStart.format("YYYYMMDDTHHmmss")}
DTEND;TZID=${athanData.meta.timezone}:${momEnd.format("YYYYMMDDTHHmmss")}
X-WR-TIMEZONE:${athanData.meta.timezone}
DESCRIPTION: Athan for ${prayer}\\n \
Prayer Time : ${AthanDataItem.getSimpleTimeStr(athanData,prayer)}\\n \
Hijri Date Arabic  : ${ltrMark}${rtlMark}${athanData.date.hijri.year} ${athanData.date.hijri.month.ar} ${athanData.date.hijri.day} ${athanData.date.hijri.weekday.ar}${ltrMark}\\n \
Hijri Date English : ${athanData.date.hijri.weekday.en} ${athanData.date.hijri.day} ${athanData.date.hijri.month.en} ${athanData.date.hijri.year}\\n \
Timezone : ${athanData.meta.timezone}\\n \
Calculation Method : [${athanData.meta.method.id}] ${athanData.meta.method.name}
END:VEVENT`;

      })
    });

    icsContent += `
END:VCALENDAR`;

    return icsContent;
  }
  private static generateUID() {
    return Math.random().toString(36).substr(2, 9);
  }


  async generate(athanTime : Array<AthanDataItem>){
    const icsContent = this.generateICS(athanTime, new CalendarSettings());
    console.log(icsContent);


  }
}
