@echo off
echo ========================================
echo   MISE A JOUR DU CODE SUR GITHUB
echo ========================================
echo.

REM Chercher Git dans les emplacements communs
set GIT_PATH=
if exist "C:\Program Files\Git\bin\git.exe" set GIT_PATH="C:\Program Files\Git\bin\git.exe"
if exist "C:\Program Files (x86)\Git\bin\git.exe" set GIT_PATH="C:\Program Files (x86)\Git\bin\git.exe"
if exist "%LOCALAPPDATA%\Programs\Git\bin\git.exe" set GIT_PATH="%LOCALAPPDATA%\Programs\Git\bin\git.exe"
if exist "%ProgramFiles%\Git\cmd\git.exe" set GIT_PATH="%ProgramFiles%\Git\cmd\git.exe"

REM Si Git n'est pas trouvé, essayer avec git directement (peut-être dans le PATH)
if "%GIT_PATH%"=="" (
    where git >nul 2>&1
    if %errorlevel%==0 (
        set GIT_PATH=git
    )
)

if "%GIT_PATH%"=="" (
    echo ERREUR: Git n'est pas trouve sur votre systeme.
    echo.
    echo Veuillez installer Git depuis: https://git-scm.com/downloads
    echo Ou utilisez l'interface de Cursor/VS Code pour faire le commit et push.
    echo.
    pause
    exit /b 1
)

echo Git trouve: %GIT_PATH%
echo.

REM Aller dans le repertoire du projet
cd /d "%~dp0"

echo Verification de l'etat du depot...
%GIT_PATH% status
echo.

echo Ajout de tous les fichiers modifies...
%GIT_PATH% add .
echo.

echo Creation du commit...
%GIT_PATH% commit -m "Mise à jour application : corrections de bugs et passage à la devise FCFA

- Correction de la navigation dans Plan de Charge Équipes (Coût du Produit)
- Correction d'une erreur de syntaxe dans PlanChargeEquipes.js
- Passage de l'euro (€) au franc CFA (FCFA) dans toute l'application"
echo.

echo Push vers GitHub...
%GIT_PATH% push origin main
if %errorlevel% neq 0 (
    echo Tentative avec la branche master...
    %GIT_PATH% push origin master
)

echo.
echo ========================================
echo   MISE A JOUR TERMINEE !
echo ========================================
echo.
pause
