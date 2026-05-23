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

const API_KEY = '13e860bb37ca4d3163350c1e58a282d1';

export function useWeather(city: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      if (!city) return;
      
      try {
        setError(null);
        
        // заглушка
        if (isMounted) {
          // Ищем город в моках. Если ввели неизвестный город, показываем Москву как запасной вариант.
          const mockData = weatherMock[city as keyof typeof weatherMock] || weatherMock['Москва'];
          
          setData(mockData as WeatherData);
          return;
        }
        // заглушка

        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        if (!geoRes.ok) throw new Error('Не удалось получить координаты');
        const geoData = await geoRes.json();
        
        if (!geoData.length) throw new Error('Город не найден');
        
        const { lat, lon } = geoData[0];

        const [forecastRes, airRes] = await Promise.all([
          fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${API_KEY}`),
          fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);

        if (!forecastRes.ok) throw new Error('Не удалось получить прогноз погоды');
        if (!airRes.ok) throw new Error('Не удалось получить данные о загрязнении воздуха');

        const forecastData = await forecastRes.json();
        const airData = await airRes.json();

        if (isMounted) {
          setData({ forecast: forecastData, air: airData });
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Ошибка при получении данных');
      }
    };

    setData(null);
    fetchWeather();
    
    const timer = setInterval(fetchWeather, 3 * 60 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [city]);

  return { data, error };
}
