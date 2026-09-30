# 빙그레 UNIVERSE

[라이브 데모](https://limjayoung.github.io/binggrae-3d-scroll/)

바나나맛우유 · 부라보콘 · 요플레의 3D 인터랙티브 웹 콘셉트입니다. 공식 브랜드 사이트가 아닙니다.

## 구현 범위

- 히어로: 세 제품 GLB, 제품별 배경·문구·상자 색상 전환, 이전/다음·제품 선택 버튼
- 스크롤: 바나나맛우유 → 부라보콘 → 요플레 전환
- 제품 위 드래그·방향키: 상하좌우 360° 회전, Home 또는 정면 버튼으로 복원
- 두 번째 섹션: 고르기 → 선물 상자에 담기 → 보내기, 역방향 스크롤 지원
- 모바일: 제품 위 드래그로 회전, 제품 밖 스와이프로 페이지 이동
- 선택형 짧은 효과음. 음소거가 기본값입니다.

Planetoño의 히어로·HOW IT WORKS 구조를 참고해 자체 코드와 제공받은 제품 이미지로 제작한 버전입니다. 원본의 시작 버튼이 비활성화되어 원본 모션의 프레임 단위 동일성은 검증되지 않았습니다. 캐릭터와 선물 상자 연출은 이 프로젝트에서 별도로 구성했습니다.

## 실행

Node.js 22 권장.

```sh
npm ci
npm run dev
```

## 빌드 / 배포

```sh
npm run build
npm run preview
```

GitHub Pages는 main 브랜치의 docs 폴더를 배포합니다. dist 결과물을 docs에 반영하고 push합니다.

웹용 제품 파일은 output/banana-milk.glb, output/bravo-cone.glb, output/yoplait.glb입니다. 텍스처가 모델 안에 포함되어 있습니다.

## 검증

로컬 개발 서버(5173)가 실행 중인 상태에서:

```sh
npx playwright install chromium
npx playwright test
```
