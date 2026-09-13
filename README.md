# 3D Turntable Interactive Studio 🎛️

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2dd4bf?style=for-the-badge&logo=github)](https://wafflecomm.github.io/TurnTableQ/)

> 🌐 **온라인 라이브 데모 바로가기**: **[https://wafflecomm.github.io/TurnTableQ/](https://wafflecomm.github.io/TurnTableQ/)**

사선 원근 투시(Perspective Tilt)와 마이크로 매크로 클로즈업 구도를 결합한 **3D 아날로그 턴테이블 인터랙티브 시스템** 작업 공간입니다.

---

## 📁 디렉토리 구조

```
C:\Works\Turn Table\
├── index.html                      # 🎛️ 메인 3D 턴테이블 인터랙티브 웹 애플리케이션 (더블클릭 즉시 실행)
├── turntable_mockup.html           # 🌐 독립 목업 페이지
├── turntable_widget.html           # 📱 컴팩트 위젯 버전
├── README.md                       # 📖 프로젝트 가이드 (본 문서)
│
├── assets/
│   └── reference_turntable.jpg     # 📷 사용자 제공 원본 레퍼런스 사진
│
├── docs/
│   ├── TURNTABLE_INTERACTIVE_PLAN.md    # 📄 인터랙티브 시스템 설계 및 기획서 (마크다운)
│   └── TURNTABLE_INTERACTIVE_PLAN.html  # 🌐 프리미엄 다크 테마 HTML 기획서
│
└── src/
    ├── ImmersiveTurntableModal.jsx # ⚛️ 리액트용 턴테이블 모달 컴포넌트
    └── app_changes.patch           # 🔄 AI-MusicQ 연동용 Git 패치 파일
```

---

## 🚀 빠른 시작 (Quick Start)

별도의 복잡한 빌드 과정 없이 `index.html` 파일을 브라우저(Chrome, Edge 등)로 더블클릭하여 바로 실행할 수 있습니다.

* **메인 실행**: `index.html`
* **기획서 열람**: `docs/TURNTABLE_INTERACTIVE_PLAN.html`

---

## ✨ 핵심 기능 및 인터랙션

1. **사선 원근 투시 (Perspective Tilt)**: 
   * 턴테이블 전체가 아닌, 두께감 있는 플래터 림과 톤암 바늘의 접촉부만 클로즈업된 사선 뷰.
2. **실시간 3D 앵글 드래그**: 
   * 화면을 마우스나 터치로 드래그하면 원하는 최적의 사선 구도로 실시간 회전.
3. **아날로그 톤암 인터랙션**: 
   * 재생(Play) 시 바늘이 레코드 위로 부드럽게 착지하고 회전 시작.
   * 일시정지(Pause) 시 바늘이 리프트업되며 레코드 회전 감속 정지.
4. **회전 속도 전환**: 
   * 33 RPM 및 45 RPM 속도 토글 지원.
5. **레퍼런스 비교 기능**: 
   * 상단 `[📷 레퍼런스 사진 비교]` 버튼으로 원본 사진과 1:1 비교 가능.
