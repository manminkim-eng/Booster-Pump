# 💧 설비펌프 용량 자동선정 시스템

**MANMIN-Ver2.0 | Engineer Kim Manmin**

기계설비 기술기준(국토교통부 고시 제2021-851호) 기반  
냉난방·오배수·급수급탕 **8종 펌프 용량 자동 산정 PWA**

---

## 📁 파일 구조

```
├── index.html                  ← 메인 앱 (단일 파일 SPA)
├── manifest.json               ← PWA 매니페스트
├── sw.js                       ← Service Worker (오프라인 캐시)
├── offline.html                ← 오프라인 폴백 페이지
└── icons/
    ├── favicon.ico             ← 파비콘 (16/32/48 멀티사이즈)
    ├── apple-touch-icon.png    ← iOS 홈 화면 아이콘 (180×180)
    ├── icon-16x16.png
    ├── icon-32x32.png
    ├── icon-48x48.png
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png        ← Windows 타일
    ├── icon-152x152.png        ← iPad 홈 화면
    ├── icon-192x192.png        ← Android 홈 화면
    ├── icon-256x256.png
    ├── icon-384x384.png
    ├── icon-512x512.png        ← PWA 스플래시
    └── icon-maskable-512x512.png ← Android 어댑티브 아이콘
```

---

## 🚀 GitHub Pages 배포 방법

### 1단계 — 저장소 생성
```bash
# 새 저장소 생성 후 파일 전체 업로드
git init
git add .
git commit -m "feat: 설비펌프 산정 PWA v2.0"
git remote add origin https://github.com/[username]/pump-calc.git
git push -u origin main
```

### 2단계 — GitHub Pages 활성화
1. GitHub 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **/ (root)**
4. **Save** 클릭

### 3단계 — 배포 확인
```
https://[username].github.io/pump-calc/
```

> ⚠️ GitHub Pages는 HTTPS를 제공하므로 Service Worker가 정상 작동합니다.

---

## 📱 PWA 설치 방법

### Android (Chrome)
- 브라우저 하단 **"앱 설치"** 배너 → **지금 설치** 탭
- 또는 주소창 오른쪽 설치 아이콘 클릭

### iOS (Safari)
- 공유 버튼(⎙) → **홈 화면에 추가** → 추가

### PC (Chrome/Edge)
- 주소창 오른쪽 📲 설치 버튼 클릭
- 또는 헤더의 **📲 앱 설치** 버튼 클릭

---

## 🔧 지원 펌프 8종

| 분류 | 펌프 종류 | 기준 |
|---|---|---|
| 냉난방 | 난방 순환펌프, 냉방 순환펌프 | 별표 1 |
| 오·배수 | PIT 배수펌프, 우수 배수펌프 | 별표 6 |
| 급탕 | 급탕 순환펌프, 급탕 재순환펌프 | 별표 5 |
| 급수 | 고가수조 양수펌프, 자동부스터 펌프 | 별표 5 2.1.3 |

---

## ⚙️ 기술 스택

- **순수 HTML/CSS/JS** — 외부 프레임워크 없음
- **PWA** — Service Worker, Web App Manifest
- **Cache-First** 오프라인 전략
- **반응형** — 데스크탑 / 태블릿 / 모바일
- Pretendard + JetBrains Mono 폰트
- html2canvas (JPG 저장)

---

## 📜 법령 근거

- 기계설비법 (법률 제17453호, 2020.06.09 제정)
- 기계설비 기술기준 (국토교통부 고시 제2021-851호)
- KDS 31 20 20, KDS 31 25 10, KDS 31 25 30, KDS 31 30 15

---

*MANMIN-Ver2.0 © Engineer Kim Manmin*
