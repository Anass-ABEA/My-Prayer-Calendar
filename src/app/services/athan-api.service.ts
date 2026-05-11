import { Injectable } from '@angular/core';
import {AthanApiResult} from "../models/AthanDataItem";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AthanApiService {

  constructor(private httpClient : HttpClient) { }

  loadAthanData(yearNum: number,monthNum:number, extras: any = {}): Observable<AthanApiResult> {
    let athanApiUrl = environment.athanApi + `${yearNum}/${monthNum}`
    let isFirstParam = true;
    for (const key of Object.keys(extras)) {
      if(extras[key] === "")
        continue;
      athanApiUrl+=`${isFirstParam?'?':'&'}${key}=${extras[key]}`
      isFirstParam = false;
    }
    return this.httpClient.get<AthanApiResult>(
      athanApiUrl
    )
  }


}
