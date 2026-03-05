let map;
let service;
let infoWindow;
let currentMarker = null;
const SSU_COORDS = { lat: 37.4963, lng: 126.9573 };

const recommendBtn = document.getElementById('recommend-btn');
const resultPanel = document.getElementById('result-panel');
const closeResultBtn = document.getElementById('close-result');
const loader = document.getElementById('loader');

const placeNameEl = document.getElementById('place-name');
const placeAddressEl = document.getElementById('place-address');
const placeRatingEl = document.getElementById('place-rating');
const placeStatusEl = document.getElementById('place-status');

function initMap() {
  console.log("Initializing Map...");
  try {
    const mapOptions = {
      center: SSU_COORDS,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        {
          "featureType": "poi.business",
          "stylers": [{ "visibility": "on" }]
        }
      ]
    };

    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    service = new google.maps.places.PlacesService(map);
    infoWindow = new google.maps.InfoWindow();

    // SSU Marker
    new google.maps.Marker({
      position: SSU_COORDS,
      map: map,
      title: "숭실대학교",
      icon: {
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
      }
    });

    recommendBtn.addEventListener('click', recommendRestaurant);
    
    // '다시 추천받기' 누르면 창 닫고 즉시 재검색 로직으로 수정
    closeResultBtn.addEventListener('click', () => {
      resultPanel.classList.add('hidden');
      if (currentMarker) currentMarker.setMap(null);
      // 부드러운 전환을 위해 약간의 지연 후 즉시 재추천
      setTimeout(recommendRestaurant, 300);
    });

    // 'X' 버튼 누르면 그냥 창만 닫기
    const exitBtn = document.getElementById('exit-result');
    exitBtn.addEventListener('click', () => {
      resultPanel.classList.add('hidden');
      if (currentMarker) currentMarker.setMap(null);
    });

    console.log("Map and Service ready.");
  } catch (e) {
    console.error("Initialization error:", e);
    alert("지도 초기화 중 오류가 발생했습니다: " + e.message);
  }
}

function recommendRestaurant() {
  if (!service) {
    alert("데이터 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
    return;
  }

  console.log("Start searching...");
  loader.classList.remove('hidden');

  const searchTimeout = setTimeout(() => {
    if (!loader.classList.contains('hidden')) {
      loader.classList.add('hidden');
      alert("검색 시간이 초과되었습니다. 인터넷 연결이나 API 설정을 확인해주세요.");
    }
  }, 10000);

  const request = {
    location: SSU_COORDS,
    radius: 800,
    keyword: '식당 맛집'
  };

  try {
    service.nearbySearch(request, (results, status) => {
      clearTimeout(searchTimeout);
      console.log("Search complete. Status:", status);
      loader.classList.add('hidden');

      if (status === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        const randomIndex = Math.floor(Math.random() * results.length);
        const place = results[randomIndex];
        displayRecommendation(place);
      } else {
        handleSearchError(status);
      }
    });
  } catch (err) {
    clearTimeout(searchTimeout);
    loader.classList.add('hidden');
    console.error("Search call error:", err);
    alert("검색 호출 중 오류가 발생했습니다.");
  }
}

function handleSearchError(status) {
  let msg = "식당을 찾을 수 없습니다.";
  if (status === "ZERO_RESULTS") msg = "주변에 검색된 식당이 없습니다.";
  else if (status === "OVER_QUERY_LIMIT") msg = "API 요청 한도가 초과되었습니다.";
  else if (status === "REQUEST_DENIED") msg = "API 키 접근이 거절되었습니다. Places API 활성화 여부를 확인하세요.";
  else if (status === "INVALID_REQUEST") msg = "잘못된 요청입니다.";
  
  alert(msg + " (Status: " + status + ")");
}

function displayRecommendation(place) {
  try {
    if (currentMarker) currentMarker.setMap(null);

    placeNameEl.textContent = place.name;
    placeAddressEl.textContent = place.vicinity || "주소 정보 없음";
    placeRatingEl.textContent = `⭐ ${place.rating || 'N/A'}`;

    // 영업 시간 판별 로직 보강
    let isOpen = false;
    let statusText = '정보 없음';
    let statusColor = '#636e72';
    let statusBg = '#f1f2f6';

    if (place.opening_hours) {
      if (typeof place.opening_hours.isOpen === 'function') {
        isOpen = place.opening_hours.isOpen();
      } else {
        isOpen = place.opening_hours.open_now;
      }
      
      statusText = isOpen ? '영업 중' : '영업 종료';
      statusColor = isOpen ? '#0288d1' : '#c62828';
      statusBg = isOpen ? '#e1f5fe' : '#ffebee';
    }

    placeStatusEl.textContent = statusText;
    placeStatusEl.style.backgroundColor = statusBg;
    placeStatusEl.style.color = statusColor;

    currentMarker = new google.maps.Marker({
      position: place.geometry.location,
      map: map,
      animation: google.maps.Animation.DROP,
      title: place.name
    });

    map.panTo(place.geometry.location);
    map.setZoom(17);

    infoWindow.setContent(`<div style="padding:5px; color:#333;"><strong>${place.name}</strong><br><small>${place.vicinity || ""}</small></div>`);
    infoWindow.open(map, currentMarker);

    resultPanel.classList.remove('hidden');
  } catch (e) {
    console.error("Display error:", e);
  }
}

window.onload = () => {
  const checkGoogle = setInterval(() => {
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
      clearInterval(checkGoogle);
      initMap();
    }
  }, 500);

  setTimeout(() => {
    if (typeof google === 'undefined') {
      clearInterval(checkGoogle);
      alert("구글 지도를 불러오지 못했습니다. API 키와 네트워크를 확인해주세요.");
    }
  }, 5000);
};
