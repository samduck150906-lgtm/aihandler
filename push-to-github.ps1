# whatwasit -> GitHub (samduck150906-lgtm/whatwasit)
# PowerShell: .\push-to-github.ps1
# 이 스크립트는 findit 폴더에서 실행하세요.

$ErrorActionPreference = "Stop"
$repo = "https://github.com/samduck150906-lgtm/whatwasit.git"

if (-not (Test-Path "package.json")) {
    Write-Host "package.json not found. Run this script from the findit folder." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed or not in PATH. Install Git and try again." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path ".git")) {
    git init
    git add .
    git commit -m "Initial commit: WhatWasIt production-ready Next.js app"
}

$remotes = git remote 2>$null
if ($remotes -notmatch "origin") {
    git remote add origin $repo
} else {
    git remote set-url origin $repo
}

git branch -M main
git push -u origin main
Write-Host "Done. Repo: $repo" -ForegroundColor Green
