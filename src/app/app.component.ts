import { Component, OnInit } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { mockApi } from './mockapi'; // Import the mock API data
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Subject, Observable, of } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [
    trigger('weatherCardAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px) scale(0.95)' }),
        animate('400ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'none' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'translateY(-30px) scale(0.95)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  city: string = '';
  weather: any = null;
  error: string = '';
  mockapi = mockApi; // Use the mock API if needed
  searchedCities: string[] = [];
  suggestion: string = '';
  theme: 'light' | 'dark' = 'light';

  // Auto-suggest
  cityInput$ = new Subject<string>();
  citySuggestions: string[] = [];
  showSuggestions = false;

  //private apiKey = '7d5c6f59185f57c6e8ee1d088a3ac25c'; // 🔑 Replace with your OpenWeatherMap API key

  private apiKey = '7e7bfe48482863ab10dde5492832b875'

  constructor(private api: ApiService) {}

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add(this.theme + '-theme');
  }

  ngOnInit() {
    // Set initial theme
    document.body.classList.remove('dark-theme', 'light-theme');
    document.body.classList.add('light-theme');

    this.cityInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((search: string) => this.api.getCitySuggestions(search))
      )
      .subscribe((res: any) => {
        if (res && res.data) {
          this.citySuggestions = res.data.map((c: any) => `${c.city}${c.region ? ', ' + c.region : ''}${c.country ? ', ' + c.country : ''}`);
        } else {
          this.citySuggestions = [];
        }
        this.showSuggestions = this.citySuggestions.length > 0;
      });
  }

  onCityInput(event: any) {
    this.cityInput$.next(event.target.value);
  }

  selectSuggestion(s: string) {
    this.city = s;
    this.citySuggestions = [];
    this.showSuggestions = false;
  }

  getWeather() {
    if (!this.city.trim()) {
      this.error = 'Please enter a city name.';
      this.weather = null;
      return;
    }
    this.api.getWeather(this.city).subscribe({
      next: (data: any) => {
        this.weather = data;
        this.setWeatherSuggestion(data.weather[0].description, data.main.temp);
        this.updateSearchHistory(this.city);
        this.city = '';
        this.error = '';
      },
      error: (err: any) => {
        this.weather = null;
        this.error = err.status === 404 ? 'City not found.' : 'Error fetching weather.';
      },
    });
  }

setWeatherSuggestion(description: string, temp: number): void {
  const desc = description.toLowerCase();

  switch (true) {
    case desc.includes('rain') || desc.includes('shower') ||desc.includes('cloud'):
      this.suggestion = '🌂 Take an umbrella!';
      break;


    case desc.includes('sunny') || desc.includes('clear'):
      this.suggestion = '🕶 Sunglasses suggested!';
      break;

    case temp < 15:
      this.suggestion = '🧥 Wear a jacket, it’s cold!';
      break;

    case temp > 35:
      this.suggestion = '💧 Stay hydrated, it’s very hot!';
      break;

    default:
      this.suggestion = '✅ Enjoy your day!';
  }
}

updateSearchHistory(city: string): void {
  console.log("Updating search history with city:", city);
  const formattedCity = city.trim().toLowerCase();

  // Avoid duplicates (optional)
  this.searchedCities = this.searchedCities.filter(c => c.toLowerCase() !== formattedCity);

  // Add to beginning
  this.searchedCities.unshift(city);

  // Limit to last 5
  if (this.searchedCities.length > 5) {
    this.searchedCities.pop();
  }
}

}
