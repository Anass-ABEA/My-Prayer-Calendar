import {Prayers} from "./Prayers";

export default class CalendarSettings{
  month: number
  year: number
  durationMinutes : number;
  startMinutesBefore: number;
  method: string;
  shafaq: string;
  school: string;
  midnightMode: string;
  latitudeAdjustmentMethod: string;
  calendarMethod: string;
  prayersToSave: Array<Prayers> = [
    Prayers.FAJR, Prayers.DHUHR, Prayers.ASR, Prayers.MAGHRIB, Prayers.ISHA, Prayers.JUMUAA
  ]
  jumuaaConfig = {
    durationMinutes: 60, 
    beforeInMinutes : 10
  }


  constructor() {
    this.month = new Date().getMonth()+ 1;
    this.year = new Date().getFullYear();
    this.durationMinutes = 15;
    this.startMinutesBefore = 5;
    this.method = "##";
    this.shafaq = "general";
    this.school = "0";
    this.midnightMode = "0";
    this.latitudeAdjustmentMethod = "3";
    this.calendarMethod = "HJCoSA";
    this.jumuaaConfig = {durationMinutes: 90, beforeInMinutes: 10};
  }


}
