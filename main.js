let map;
let service;
let infoWindow;
let currentMarker = null;
let currentLang = 'ko';
const SSU_COORDS = { lat: 37.4963, lng: 126.9573 };

const translations = {
  ko: {
    title: "망한숭실대 상권에서도 밥은 먹자 🍱",
    subtitle: "숭실대학교 주변의 \"진흙 속의 진주\" 같은 식당을 추천해드립니다.",
    recommendBtn: "오늘 뭐 먹지? (랜덤 추천)",
    retryBtn: "다시 추천받기",
    loaderText: "맛집 찾는 중...",
    noResults: "주변에서 식당을 찾을 수 없습니다.",
    errorQuery: "API 요청 한도가 초과되었습니다.",
    errorDenied: "API 요청이 거부되었습니다.",
    errorCommon: "오류가 발생했습니다: ",
    statusOpen: "영업 중",
    statusClosed: "영업 종료",
    statusUnknown: "정보 없음",
    addressUnknown: "주소 정보 없음"
  },
  en: {
    title: "Eat even in SSU's Ruined Business District 🍱",
    subtitle: "Recommending 'hidden gems' around Soongsil University.",
    recommendBtn: "What to eat today? (Random)",
    retryBtn: "Try Another",
    loaderText: "Finding restaurants...",
    noResults: "No restaurants found nearby.",
    errorQuery: "API query limit exceeded.",
    errorDenied: "API request denied.",
    errorCommon: "An error occurred: ",
    statusOpen: "Open Now",
    statusClosed: "Closed",
    statusUnknown: "No Info",
    addressUnknown: "No Address Info"
  }
};

const themeToggle = document.getElementById('theme-toggle');
const langSelect = document.getElementById('lang-select');
const recommendBtn = document.getElementById('recommend-btn');
const resultPanel = document.getElementById('result-panel');
const closeResultBtn = document.getElementById('close-result');
const exitResultBtn = document.getElementById('exit-result');
const loader = document.getElementById('loader');

function initMap() {
  try {
    const mapOptions = {
      center: SSU_COORDS,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { "featureType": "poi.business", "stylers": [{ "visibility": "on" }] }
      ]
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    service = new google.maps.places.PlacesService(map);
    infoWindow = new google.maps.InfoWindow();

    new google.maps.Marker({
      position: SSU_COORDS,
      map: map,
      title: "SSU",
      icon: { url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }
    });

    recommendBtn.addEventListener('click', recommendRestaurant);
    closeResultBtn.addEventListener('click', () => {
      resultPanel.classList.add('hidden');
      setTimeout(recommendRestaurant, 300);
    });
    exitResultBtn.addEventListener('click', () => {
      resultPanel.classList.add('hidden');
      if (currentMarker) currentMarker.setMap(null);
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    });

    // Language Toggle
    langSelect.addEventListener('change', (e) => {
      currentLang = e.target.value;
      updateLanguage();
    });

  } catch (e) {
    console.error(e);
  }
}

function updateLanguage() {
  const t = translations[currentLang];
  document.getElementById('main-title').textContent = t.title;
  document.getElementById('main-subtitle').textContent = t.subtitle;
  document.getElementById('recommend-btn').textContent = t.recommendBtn;
  document.getElementById('close-result').textContent = t.retryBtn;
  document.getElementById('loader-text').textContent = t.loaderText;
}

function recommendRestaurant() {
  loader.classList.remove('hidden');
  const t = translations[currentLang];

  const request = {
    location: SSU_COORDS,
    radius: 800,
    keyword: currentLang === 'ko' ? '식당 맛집' : 'restaurant'
  };

  service.nearbySearch(request, (results, status) => {
    loader.classList.add('hidden');
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
      displayRecommendation(results[Math.floor(Math.random() * results.length)]);
    } else {
      alert(t.noResults + " (" + status + ")");
    }
  });
}

function displayRecommendation(place) {
  const t = translations[currentLang];
  if (currentMarker) currentMarker.setMap(null);

  document.getElementById('place-name').textContent = place.name;
  document.getElementById('place-address').textContent = place.vicinity || t.addressUnknown;
  document.getElementById('place-rating').textContent = `⭐ ${place.rating || 'N/A'}`;

  let isOpen = false;
  let statusText = t.statusUnknown;
  if (place.opening_hours) {
    isOpen = typeof place.opening_hours.isOpen === 'function' ? place.opening_hours.isOpen() : place.opening_hours.open_now;
    statusText = isOpen ? t.statusOpen : t.statusClosed;
  }

  const statusEl = document.getElementById('place-status');
  statusEl.textContent = statusText;
  statusEl.style.color = isOpen ? '#0288d1' : '#c62828';
  statusEl.style.backgroundColor = isOpen ? 'rgba(2, 136, 209, 0.1)' : 'rgba(198, 40, 40, 0.1)';

  currentMarker = new google.maps.Marker({
    position: place.geometry.location,
    map: map,
    animation: google.maps.Animation.DROP,
    title: place.name
  });

  map.panTo(place.geometry.location);
  infoWindow.setContent(`<div style="padding:5px; color:#333;"><strong>${place.name}</strong></div>`);
  infoWindow.open(map, currentMarker);
  resultPanel.classList.remove('hidden');
}

window.onload = () => {
  const checkGoogle = setInterval(() => {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      clearInterval(checkGoogle);
      initMap();
    }
  }, 500);
};
