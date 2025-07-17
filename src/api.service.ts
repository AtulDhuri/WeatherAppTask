import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private weatherApiKey = '7e7bfe48482863ab10dde5492832b875';

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<any> {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.weatherApiKey}&units=metric`;
    return this.http.get(apiUrl);
  }

  getCitySuggestions(search: string): Observable<any> {
    if (!search || search.length < 2) return new Observable((observer) => { observer.next([]); observer.complete(); });
    const url = `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(search)}&limit=5&sort=-population`;
    return this.http.get<any>(url, {
      headers: {
        'X-RapidAPI-Key': '5e7c510a52msh157f388df6e686ep148056jsn88c326177538', // Replace with your RapidAPI key for production
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    });
  }
}

// Note:
// I have used rapidapi.com for city suggestion. Not all cities give result. It has limited search per second in free tier
