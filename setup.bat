@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   MadEyE Web - 설치 스크립트
echo ========================================
echo.

REM Node.js 확인
WHERE node >nul 2>&1
IF !ERRORLEVEL! NEQ 0 (
    echo [!] Node.js 를 찾을 수 없습니다.
    echo     https://nodejs.org/en/download/ 에서 LTS 버전을 설치하세요.
    EXIT /B 1
)

FOR /F "tokens=*" %%v IN ('node --version') DO SET NODE_VER=%%v
echo [+] Node.js: !NODE_VER!

REM 의존성 설치
echo [*] npm install 실행 중...
npm install
IF !ERRORLEVEL! NEQ 0 (
    echo [!] npm install 실패
    EXIT /B 1
)
echo [+] 의존성 설치 완료

REM .env 확인
IF NOT EXIST .env (
    echo [!] .env 파일이 없습니다. .env.example 을 복사해서 설정하세요.
    COPY .env.example .env
    echo [*] .env 파일을 생성했습니다. 경로를 확인하세요:
    echo     MADEYE_PYTHON, MADEYE_SCRIPT
)

echo.
echo ========================================
echo   개발 서버 시작 방법:
echo     npm run dev
echo.
echo   프로덕션 빌드:
echo     npm run build
echo     npm start   (또는  node build)
echo ========================================
echo.
