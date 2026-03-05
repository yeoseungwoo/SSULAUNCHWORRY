# Blueprint: 망한숭실대 상권에서도 밥은 먹자 (SSU Lunch Worries)

## Overview
이 프로젝트는 숭실대학교 주변의 "망해가는" 상권 속에서도 무엇을 먹을지 고민하는 학생들을 위해 구글 지도를 활용하여 무작위로 음식점을 추천해주는 웹 서비스입니다.

## Features & Design
- **Map Interface**: 구글 지도를 메인 화면에 배치하여 숭실대학교 주변 음식점들의 위치를 시각적으로 보여줍니다.
- **Random Recommendation**: '오늘 뭐 먹지?' 버튼을 누르면 주변 음식점 중 하나를 무작위로 선택하여 지도에 표시하고 상세 정보를 제공합니다.
- **Modern UI**: 활기차고 위트 있는 디자인을 적용합니다. (Vibrant colors, rounded corners, subtle shadows).
- **Responsive**: 모바일과 데스크탑 환경 모두에서 쾌적하게 사용할 수 있도록 구성합니다.

## Technical Details
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES Modules).
- **Maps API**: Google Maps JavaScript API (Places Service).
- **Styling**: Baseline CSS features (Container Queries, `:has()`, CSS Variables).

## Development Plan
1. **[Current] Setup Foundation**: `index.html`, `style.css`, `main.js` 구조 잡기.
2. **UI Implementation**: 헤더, 지도 컨테이너, 추천 버튼 및 결과 패널 구현.
3. **Google Maps Integration**:
    - [Done] 지도 초기화 (숭실대학교 중심).
    - [Done] Places Service를 이용하여 주변 음식점 검색.
    - [Done] 랜덤 추천 로직 구현.
    - [Done] API 키 적용 완료.
4. **Polishing**: 애니메이션 효과 추가 및 디자인 디테일 수정.
