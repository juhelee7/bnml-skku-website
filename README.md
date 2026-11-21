# BNML 홈페이지 (Biological & Nanoscale Materials Laboratory, SKKU)

성균관대학교 신소재공학부 **Biological & Nanoscale Materials Laboratory (BNML)** 홈페이지의 정적(static) 버전입니다.
기존 Wix 사이트(`https://www.bionanomaterials.org`)의 디자인과 내용을 그대로 옮겨 **GitHub Pages**(무료 호스팅)에서 운영합니다.

- 미리보기: <https://juhelee7.github.io/bnml-website/>
- 사용 도메인(연결 후): `https://www.bionanomaterials.org`

## 페이지

| 주소 | 내용 | 파일 |
| --- | --- | --- |
| `/` | Home | `index.html` |
| `/research/` | Research | `research/index.html` |
| `/group/` | Principal Investigator (교수 소개) | `group/index.html` |
| `/researchers/` | Researchers (구성원) | `researchers/index.html` |
| `/alumni/` | Alumni (졸업생) | `alumni/index.html` |
| `/publications/` | Publications (2021 ~ ) | `publications/index.html` |
| `/publications/2016-2020/` | Publications (2016~2020) | `publications/2016-2020/index.html` |
| `/publications/before-2015/` | Publications ( ~ 2015) | `publications/before-2015/index.html` |
| `/patents/` | Patents | `patents/index.html` |
| `/teaching/` | Teaching | `teaching/index.html` |
| `/gallery/` | Gallery | `gallery/index.html` |
| `/news/` | News | `news/index.html` |

기존 Wix 주소(`/home`, `/pi`, `/gallery-pc`, `/gallery-mobile`, `/publications-1`, `/publications-2`, `/publications-3`, `/복제-researchers`)는
새 주소로 자동 이동하는 안내 페이지로 남겨 두었습니다.

## 구조

```
index.html               각 페이지 (디렉터리/index.html 구조)
research/  group/  ...
assets/
  style.css              전체 스타일 (PC·모바일 반응형)
  stripe.png             좌우 대각선 무늬 배경
  lab-logo.png           상단 로고
  skku-logo.jpg          성균관대 로고
  home-group.jpg         Home 단체사진
  research-1~3.png       Research 그림
  pi-jeongeon-lee.jpg    교수 사진
  people/*.jpg           구성원 사진
  gallery/*.jpg          Gallery 사진
  fonts/*.woff2          Open Sans (사이트에 포함, 외부 CDN 불필요)
```

모든 이미지·폰트는 저장소 안에 들어 있어 Wix CDN이 사라져도 그대로 유지됩니다.

## 내용 수정 방법

HTML 파일을 직접 고치면 됩니다. 자주 고치는 곳:

- **논문 추가**: `publications/index.html`에서 `<p style="font-size:16px">162. ...` 위에 새 항목을 추가합니다. 기존 항목과 같은 형식(제목 `<br>` 저자 `<br>` *저널*, **연도**, 권/페이지 (링크))을 쓰면 됩니다.
- **구성원 사진**: `assets/people/`에 사진을 넣고 `researchers/index.html`의 해당 `<img src="...">` 경로만 바꿉니다.
- **News**: `news/index.html`에 `<p style="font-size:16px">월 연도</p>` + 목록(`<ul class="rich-list">`)을 추가합니다.
- **Gallery 사진**: `assets/gallery/`에 파일을 넣고 `gallery/index.html`의 `<div class="gallery-grid">` 안에 `<a href="../assets/gallery/파일명"><img src="../assets/gallery/파일명" alt="BNML lab photo" loading="lazy"></a>`를 추가합니다.

수정 후 GitHub에서 Commit(또는 `git push`)하면 1~2분 안에 사이트에 반영됩니다.

## 커스텀 도메인(bionanomaterials.org) 연결

DNS 관리 화면에서 아래 레코드를 추가/변경합니다.

| 타입 | 이름 | 값 |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `juhelee7.github.io` |

연결 후 GitHub 저장소 → Settings → Pages → Custom domain 에 `www.bionanomaterials.org`를 입력하고
`Enforce HTTPS`를 켭니다. (저장소 루트에 `CNAME` 파일이 자동 생성됩니다.)

## 라이선스

연구실 소개용 사이트입니다. 사진과 글의 저작권은 Biological & Nanoscale Materials Laboratory에 있습니다.
