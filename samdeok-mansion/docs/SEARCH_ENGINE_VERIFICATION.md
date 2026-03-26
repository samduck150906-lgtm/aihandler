# 검색엔진 사이트맵 제출 및 소유권 인증

## 1. 사이트맵 URL

- **사이트맵**: `https://samdeok.kr/sitemap.xml`
- **robots.txt**: `https://samdeok.kr/robots.txt` (Sitemap URL 포함)

배포 후 위 URL이 실제로 응답하는지 확인한 뒤 검색엔진에 제출하세요.

## 2. Google Search Console

1. https://search.google.com/search-console 접속
2. 속성 추가 → URL 접두어 `https://samdeok.kr` 입력
3. 소유권 확인: **HTML 태그** 방식 선택 시, 안내되는 메타 태그를 `frontend/index.html`의 `<head>` 안에 넣기  
   예: `<meta name="google-site-verification" content="발급받은_코드" />`  
   (현재 주석 처리된 placeholder가 있으므로 주석 해제 후 값만 교체)
4. 확인 후 **사이트맵** 메뉴에서 `https://samdeok.kr/sitemap.xml` 제출

## 3. Naver Search Advisor

1. https://searchadvisor.naver.com 접속
2. 사이트 등록 → 소유 확인
3. **HTML 메타 태그** 방식: `index.html`에  
   `<meta name="naver-site-verification" content="발급_코드" />` 추가  
   (placeholder 있음 → 주석 해제 후 값 교체)
4. **HTML 파일 업로드** 방식: 안내하는 파일명(예: `naverxxx.html`)으로 빈 파일을 만들어 `public/`에 넣고 배포 후 해당 URL 접속 가능한지 확인

## 4. 배포 후 확인 사항

- `https://samdeok.kr/sitemap.xml` → XML 사이트맵 응답
- `https://samdeok.kr/robots.txt` → Sitemap: https://samdeok.kr/sitemap.xml 포함
- 메타 태그 방식 사용 시: 배포된 페이지 소스 보기에서 해당 `<meta name="...-site-verification" ... />` 노출 여부 확인
