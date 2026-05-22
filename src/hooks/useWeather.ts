import { useState, useEffect } from 'react';
import weatherMock from '../mocks/weatherMock.json';

export interface WeatherData {
  forecast: {
    city: { name: string };
    list: {
      dt: number;
      dt_txt: string;
      main: {
        temp: number;
        temp_min: number;
        temp_max: number;
        humidity: number;
        pressure: number;
      };
      weather: { icon: string; description: string }[];
      wind: { speed: number };
      clouds: { all: number };
      sys: { pod: string };
    }[];
  };
  air: {
    list: { main: { aqi: number } }[];
  };
}

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Имитируем небольшую задержку, как при реальном запросе к API
    setData(null);
    const timer = setTimeout(() => {
      setData((weatherMock[city as keyof typeof weatherMock] || weatherMock['Москва']) as WeatherData);
    }, 500);

    return () => clearTimeout(timer);
  }, [city]);

  return { data, error };
}
