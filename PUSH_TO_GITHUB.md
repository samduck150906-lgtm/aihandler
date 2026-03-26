# whatwasit → GitHub 푸시 방법

저장소: **https://github.com/samduck150906-lgtm/whatwasit**

## 1. GitHub에서 저장소 생성 (아직 없다면)

1. https://github.com/new 접속
2. Repository name: **whatwasit**
3. Public, **Add a README file** 체크 해제 (로컬에 이미 있음)
4. Create repository

## 2. 터미널에서 실행 (이 폴더 `findit` 에서)

```bash
# 현재 폴더가 findit 인지 확인 (package.json, app/ 이 보여야 함)
cd c:\Users\lucet\Downloads\whatwasit-mvp\findit

# Git 초기화 및 첫 커밋
git init
git add .
git commit -m "Initial commit: WhatWasIt production-ready Next.js app"

# GitHub 원격 추가 (samduck150906-lgtm/whatwasit)
git remote add origin https://github.com/samduck150906-lgtm/whatwasit.git

# 기본 브랜치 이름 설정 후 푸시
git branch -M main
git push -u origin main
```

## 3. 이미 다른 remote가 있다면

```bash
git remote set-url origin https://github.com/samduck150906-lgtm/whatwasit.git
git push -u origin main
```

## 4. HTTPS 대신 SSH로 푸시하려면

```bash
git remote add origin git@github.com:samduck150906-lgtm/whatwasit.git
git push -u origin main
```
