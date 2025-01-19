document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM загружен");

  let map; // Основная карта
  let heatmapLayer; // Текущий слой тепловой карты
  let heatmapData = []; // Данные для тепловой карты (фиксированная интенсивность)
  let markerData = []; // Данные для маркеров (реальные значения глубины)
  const threshold = 80; // Порог для нормализации

  // Функция для извлечения данных из изображения
  function extractDataFromImage(image) {
    console.log("Изображение загружено, размер:", image.width, "x", image.height);

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    console.log("Данные изображения:", data);

    let byteArray = [];
    for (let i = 0; i < data.length; i += 4) {
      byteArray.push(data[i], data[i + 1], data[i + 2]);
    }

    byteArray = byteArray.filter(byte => byte !== 0);
    console.log("Байты данных после фильтрации:", byteArray);

    const decoder = new TextDecoder("utf-8");
    const encodedData = decoder.decode(new Uint8Array(byteArray));
    console.log("Закодированные данные:", encodedData);

    try {
      const decodedData = atob(encodedData);
      console.log("Декодированные данные:", decodedData);

      const coordinates = JSON.parse(decodedData);
      console.log("Координаты:", coordinates);

      // Находим минимальную и максимальную глубину
      const minDepth = Math.min(...coordinates.map(well => well.depth));
      const maxDepth = Math.max(...coordinates.map(well => well.depth));

      // Скрываем canvas после использования
      canvas.style.display = "none";

      return coordinates;
    } catch (error) {
      console.error("Ошибка при декодировании данных:", error);
      return [];
    }
  }

  // Функция для инициализации карты
  function initMap(heatmapData, markerData) {
    // Устанавливаем начальный вид карты и ограничения на зум
    map = L.map("map", {
      zoomControl: true, // Включаем управление зумом
      minZoom: 9, // Минимальный зум
      maxZoom: 16 // Максимальный зум
    }).setView([43.35, 132.19], 9); // Начальный зум и центр карты

    console.log("Карта инициализирована:", map);

    // Добавляем слой карты
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Создаём тепловую карту с зелёным градиентом
    createHeatmap(heatmapData);

    // Добавляем маркеры с глубиной при зуме 16
    addDepthMarkers(markerData);

    // Добавляем кастомную кнопку геолокации
    addLocationButton();
  }

  // Функция для создания тепловой карты
  function createHeatmap(data) {
    if (heatmapLayer) {
      map.removeLayer(heatmapLayer); // Удаляем текущий слой тепловой карты
    }

    if (data.length > 0) {
      heatmapLayer = L.heatLayer(data, {
        radius: 50,  // Увеличиваем радиус
        blur: 30,    // Увеличиваем размытие
        maxZoom: 18,
        gradient: {
          0.1: 'rgba(173, 255, 47, 1)',   // Светло-зелёный (GreenYellow)
          0.3: 'rgba(50, 205, 50, 1)',    // Лаймовый (LimeGreen)
          0.5: 'rgba(34, 139, 34, 1)',    // Лесной зелёный (ForestGreen)
          0.7: 'rgba(0, 100, 0, 1)',      // Тёмно-зелёный (DarkGreen)
          1.0: 'rgba(0, 50, 0, 1)'        // Очень тёмный зелёный
        }
      }).addTo(map);

      console.log("Тепловая карта создана:", heatmapLayer);
    } else {
      console.error("Нет данных для тепловой карты");
    }
  }

  // Функция для добавления маркеров с глубиной при зуме 16
// Функция для добавления маркеров с глубиной при зуме 16
function addDepthMarkers(markerData) {
  const markers = L.layerGroup(); // Группа для маркеров

  // Цвета для маркеров (те же, что и в легенде)
  const depthColors = [
    "#A6D5E8", // До 20 м
    "#6BB9E8", // 20–40 м
    "#3A89C9", // 40–60 м
    "#1E5A8A", // 60–80 м
    "#0A2E4E"  // Свыше 80 м
  ];

  markerData.forEach(well => {
    const [lat, lng, depth] = well;

    // Обратный пересчёт из нормализованной глубины в реальную
    const realDepth = depth * threshold;

    // Определяем цвет маркера на основе глубины
    let color;
    if (realDepth < 20) {
      color = depthColors[0]; // До 20 м
    } else if (realDepth < 40) {
      color = depthColors[1]; // 20–40 м
    } else if (realDepth < 60) {
      color = depthColors[2]; // 40–60 м
    } else if (realDepth < 80) {
      color = depthColors[3]; // 60–80 м
    } else {
      color = depthColors[4]; // Свыше 80 м
    }

    // Создаём круг с прозрачностью
    const circle = L.circle([lat, lng], {
      radius: 50, // Радиус круга
      fillColor: color,
      fillOpacity: 0.8, // Прозрачность заливки
      color: "#000", // Цвет обводки
      weight: 0 // Толщина обводки
    });

    // Добавляем круг в группу
    markers.addLayer(circle);
  });

  // Показываем маркеры только при зуме 16
  map.on('zoomend', () => {
    if (map.getZoom() === 16) {
      map.addLayer(markers);
    } else {
      map.removeLayer(markers);
    }
  });
}

  // Функция для добавления кастомной кнопки геолокации
  function addLocationButton() {
    const locationButton = L.control({ position: 'topright' });

    locationButton.onAdd = function () {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      const button = L.DomUtil.create('button', 'leaflet-control-locate');
      button.innerHTML = '📍'; // Иконка кнопки
      button.title = 'Найти моё местоположение';
      button.style.fontSize = '20px';
      button.style.cursor = 'pointer';
      button.style.border = 'none';
      button.style.background = 'white';
      button.style.padding = '5px 10px';
      button.style.borderRadius = '4px';

      // Обработчик нажатия на кнопку
      button.onclick = () => {
        map.locate({ setView: true, maxZoom: 16, enableHighAccuracy: true });
      };

      div.appendChild(button);
      return div;
    };

    locationButton.addTo(map);

    // Обработчик успешного получения местоположения
    map.on('locationfound', (e) => {
      console.log("Местоположение найдено:", e.latlng);
      // Центрируем карту на местоположении
      map.setView(e.latlng, 16);
    });

    // Обработчик ошибки получения местоположения
    map.on('locationerror', (e) => {
      console.error("Ошибка при получении местоположения:", e.message);
      alert("Не удалось определить ваше местоположение. Пожалуйста, проверьте настройки геолокации.");
    });
  }

  const image = document.getElementById("data-image");

  if (image.complete) {
    console.log("Изображение уже загружено");
    const coordinates = extractDataFromImage(image);

    // Данные для тепловой карты (фиксированная интенсивность 0.8)
    heatmapData = coordinates.map(well => [well.lat, well.lng, 0.8]);

    // Данные для маркеров (реальные значения глубины)
    markerData = coordinates.map(well => [well.lat, well.lng, well.depth]);

    initMap(heatmapData, markerData);
  } else {
    console.log("Ожидаем загрузки изображения");
    image.onload = () => {
      console.log("Изображение загружено:", image);
      const coordinates = extractDataFromImage(image);

      // Данные для тепловой карты (фиксированная интенсивность 0.8)
      heatmapData = coordinates.map(well => [well.lat, well.lng, 0.8]);

      // Данные для маркеров (реальные значения глубины)
      markerData = coordinates.map(well => [well.lat, well.lng, well.depth]);

      initMap(heatmapData, markerData);
    };
  }

  image.onerror = () => {
    console.error("Ошибка загрузки изображения");
  };
});