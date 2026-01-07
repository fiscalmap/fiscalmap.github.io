---
tags:
  - Quartz
title: Quartz 블로그 완전 설치 가이드
draft: false
date: 2026-01-07
---
## 사전 준비

### 1. 필수 프로그램 설치 (Bazzite에는 설치되어 있음 -> 바로 2번으로)

**Node.js 및 npm 설치 여부 확인 :**
```bash
node --version
npm --version
```

**설치되어 있지 않다면:**

**방법 1: nvm 사용 (권장):**
```bash
# nvm 설치
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 터미널 재시작 후
nvm install --lts
nvm use --lts
```

**방법 2: Bazzite/Fedora 패키지 관리자:**
```bash
sudo rpm-ostree install nodejs npm
# 재부팅 필요
```

**Git 설치 확인:**

```bash
git --version
# 없으면 설치: sudo rpm-ostree install git
```

### 2. GitHub SSH 키 설정

**SSH 키 생성:**

```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# 엔터 3번 (기본값 사용)
```

**공개 키 복사:**

```bash
cat ~/.ssh/id_ed25519.pub
```

**GitHub에 SSH 키 등록:**

- https://github.com/settings/keys 접속
- "New SSH key" 클릭
- 복사한 내용 붙여넣기
- "Add SSH key" 클릭

**SSH 연결 테스트:**

```bash
ssh -T git@github.com
# "Hi username! You've successfully authenticated..." 메시지 확인
```

### 3. GitHub SSH 키 설정

1. https://github.com/new 접속
2. **Repository name**: `your-username.github.io` (예: `사용자명.github.io`)
3. **Public** 선택 (필수!)
4. README, .gitignore, license 모두 **체크 해제** (빈 저장소로 생성)
5. "Create repository" 클릭

## Quartz 설치 및 설정

### 1. Quartz 다운로드 및 초기화

```bash
# 홈 디렉토리로 이동
cd ~

# Quartz 클론
git clone https://github.com/jackyzha0/quartz.git
cd quartz

# 의존성 설치
npm install

# 초기화
npx quartz create
```

**초기화 선택사항:**

- "Choose how to initialize the content": **Empty Quartz** 선택
- "Choose how Quartz should resolve links": **Treat links as shortest path** 선택

### 2. GitHub 저장소 연결

```bash
# 기존 origin 제거
git remote remove origin

# 본인 저장소로 연결 (your-username을 본인 GitHub ID로 변경)
git remote add origin git@github.com:your-username/your-username.github.io.git

# 브랜치를 v4로 변경
git branch -M v4
```

### 3. GitHub Actions 배포 설정 (중요!)

**deploy.yml 파일 생성:**

```bash
nano .github/workflows/deploy.yml
```

**다음 내용 붙여넣기:**

```yaml
name: Deploy Quartz site to GitHub Pages
 
on:
  push:
    branches:
      - v4
 
permissions:
  contents: read
  pages: write
  id-token: write
 
concurrency:
  group: "pages"
  cancel-in-progress: false
 
jobs:
  build:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Install Dependencies
        run: npm ci
      - name: Build Quartz
        run: npx quartz build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: public
 
  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-22.04
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**저장:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 4. 첫 배포

```bash
# workflow 파일 추가
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment workflow"

# 첫 push (upstream 설정)
git push -u origin v4
```

### 5. GitHub Pages 설정 확인

1. https://github.com/your-username/your-username.github.io/settings/pages 접속
2. **Source**: "GitHub Actions" 선택 (자동으로 설정될 수 있음)
3. 저장

### 6. 배포 확인

1. **GitHub Actions 확인:**
    
    - https://github.com/your-username/your-username.github.io/actions
    - 초록색 체크 표시 나올 때까지 대기 (1-3분)
2. **웹사이트 접속:**
    
    - https://your-username.github.io
    - 초기 페이지 표시 확인

## Obsidian 연동

### 1. Obsidian에서 볼트 설정

- Obsidian 실행
- "Open folder as vault" 선택
- `~/quartz/content` 선택

### 2. .obsidian 폴더 제외 확인

```bash
cd ~/quartz
cat .gitignore | grep obsidian
# .obsidian/ 이 있는지 확인
# 없으면 추가:
echo ".obsidian/" >> .gitignore
```

## 일상적인 사용법

### 콘텐츠 작성 및 배포

1. **Obsidian에서 작업:**
    - `content/` 폴더에서 Markdown 파일 작성/수정

2. **터미널에서 배포:**
    
    ```bash
    cd ~/quartz
    npx quartz sync
    ```
    
3. **1-3분 후 웹사이트 자동 업데이트**
    

### 로컬 미리보기

```bash
cd ~/quartz
npx quartz build --serve
```

- http://localhost:8080 에서 확인 가능
- `Ctrl + C`로 종료

## 주의사항 및 문제 해결

### ⚠️ 중요 주의사항

1. **저장소는 반드시 Public으로 설정**
    - GitHub 무료 계정은 Public 저장소만 GitHub Pages 지원
    - 
2. **deploy.yml 파일 필수**
    - 이 파일이 없으면 GitHub Actions가 실행되지 않음
    - 웹사이트가 배포되지 않음 (404 에러)
    
3. **브랜치 이름은 v4**
       - Quartz 기본 브랜치가 v4
    - deploy.yml도 v4 브랜치에서 실행되도록 설정됨
    
4. **첫 push 시 -u 옵션 사용**
    - `git push -u origin v4`로 upstream 설정

### 문제 해결

**웹사이트가 404 에러일 때:**

```bash
# 1. Actions 탭 확인
# https://github.com/your-username/your-username.github.io/actions
# 빌드가 성공했는지 확인

# 2. deploy.yml 파일 존재 확인
ls -la .github/workflows/deploy.yml

# 3. 없으면 위의 "GitHub Actions 배포 설정" 다시 진행

# 4. Pages 설정 확인
# Settings → Pages → Source: GitHub Actions
```

**npx quartz sync 에러 시:**

```bash
# remote URL 확인
git remote -v

# 잘못되었다면 수정
git remote set-url origin git@github.com:your-username/your-username.github.io.git
```

**이모지 관련 빌드 에러:**

```bash
# Markdown 파일에서 숫자 이모지(1️⃣, 2️⃣ 등) 제거
# 또는 일반 텍스트로 변경
```

**merge conflict 발생 시:**

```bash
# 현재 merge 취소
git merge --abort

# 로컬 변경사항 우선
git push origin v4 --force
```

## 추가 설정

### Quartz 설정 커스터마이징

- `quartz.config.ts`: 사이트 제목, 설명, URL 등 기본 설정
- `quartz.layout.ts`: 레이아웃 구조 설정

```bash
nano quartz.config.ts
# 수정 후 저장하고 npx quartz sync
```

### 테마 및 스타일 변경

- `quartz/styles/`: CSS 파일 수정
- 변경 후 `npx quartz sync`로 배포
