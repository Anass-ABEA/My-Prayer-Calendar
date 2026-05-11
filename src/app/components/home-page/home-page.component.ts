import {Component, OnInit} from '@angular/core';
import {AthanApiService} from "../../services/athan-api.service";
import {AthanDataItem} from "../../models/AthanDataItem";
import {CalendarGeneratorService} from "../../services/calendar-generator.service";
import CalendarSettings from "../../models/CalendarSettings";
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import {MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter} from '@angular/material-moment-adapter';
import {MatDatepicker} from "@angular/material/datepicker";
import {Moment} from "moment-timezone";
import StringHelper from "../../helpers/StringHelper";
import {Prayers} from "../../models/Prayers";
import {MatCheckboxChange} from "@angular/material/checkbox";

export const MY_FORMATS = {
  parse: {
    dateInput: 'MM/YYYY',
  },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  providers:[
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ]
})
export class HomePageComponent implements OnInit{

  loadedAthanData: Array<AthanDataItem> = []
  calendarSettings : CalendarSettings = new CalendarSettings()
  bsInlineValue = new Date();
  address = "Paris, France";
  showAdditionalDetails: boolean = false;

  generatedIcsText = "";
  initialDateValue = `${StringHelper.numberFormatter((new Date()).getMonth() + 1, 2)}/${(new Date()).getFullYear()}`


  constructor(private athanApiService: AthanApiService, private calendarService: CalendarGeneratorService) {
  }

  ngOnInit(): void {

  }

  chosenYearHandler(normalizedYear: Moment) {
    this.calendarSettings.year = normalizedYear.year()
  }

  chosenMonthHandler(normalizedMonth: Moment, datepicker: MatDatepicker<any>, inputValue: HTMLInputElement) {
    this.calendarSettings.month = normalizedMonth.month() + 1
    inputValue.value = `${StringHelper.numberFormatter(this.calendarSettings.month, 2)}/${this.calendarSettings.year}`
    datepicker.close();
  }

  loadPrayers(): Prayers[] {
    return Object.values(Prayers);
  }

  changeCheckFor(prayer: Prayers, $event: MatCheckboxChange) {
    if ($event.checked) {
      if (!this.calendarSettings.prayersToSave.includes(prayer)) {
        this.calendarSettings.prayersToSave.push(prayer);
      }
    } else {
      this.calendarSettings.prayersToSave = this.calendarSettings.prayersToSave.filter(p => p !== prayer);
    }
  }

  isChecked(prayer: string) {
    return this.calendarSettings.prayersToSave.includes(<Prayers>prayer);
  }

  isJumuaaSelected() {
    return this.calendarSettings.prayersToSave.includes(Prayers.JUMUAA);
  }

  generateIcsFile() {
    this.generatedIcsText = "";
    const extras = {
      address : this.address,
      method : this.calendarSettings.method,
      shafaq : this.calendarSettings.shafaq,
      school : this.calendarSettings.school,
      midnightMode : this.calendarSettings.midnightMode,
      latitudeAdjustmentMethod : this.calendarSettings.latitudeAdjustmentMethod,
      calendarMethod : this.calendarSettings.calendarMethod
    }
    if(extras.method === "##") {
      extras.method = "";
    }
    this.athanApiService.loadAthanData(this.calendarSettings.year, this.calendarSettings.month, extras)
      .subscribe(result => {
        this.loadedAthanData = <Array<AthanDataItem>>result.data;
        this.generatedIcsText = this.calendarService.generateICS(this.loadedAthanData, this.calendarSettings);
      })

  }

  showDownloadCopy() {
    return this.generatedIcsText.length === 0;
  }


  downloadIcsFile() {
    const blob = new Blob([this.generatedIcsText], {type: 'text/calendar;charset=utf-8'});
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AthanPrayers-${this.calendarSettings.month}-${this.calendarSettings.year}.ics`);

    link.click();
  }

  now() {
    return new Date();
  }

  toggleAdditionalDetails() {
    this.showAdditionalDetails = !this.showAdditionalDetails;
  }
}
