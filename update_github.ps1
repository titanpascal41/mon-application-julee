# Script PowerShell pour mettre à jour le code sur GitHub
Write-Host "=== MISE A JOUR DU CODE SUR GITHUB ===" -ForegroundColor Green
Write-Host ""

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "Git trouvé: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "📥 Téléchargez Git depuis: https://git-scm.com/downloads" -ForegroundColor Yellow
    Write-Host "Puis ouvrez Git Bash et exécutez les commandes du fichier git_update_commands.txt" -ForegroundColor Yellow
    exit
}

# Aller dans le répertoire du projet
$projectPath = "C:\Users\yohann.mangle\Documents\GitHub\mon-application-julee"
Write-Host "📂 Navigation vers: $projectPath" -ForegroundColor Cyan
Set-Location $projectPath

# Vérifier l'état
Write-Host "🔍 Vérification de l'état du dépôt..." -ForegroundColor Cyan
git status

# Demander confirmation avant de continuer
$confirmation = Read-Host "Voulez-vous continuer avec le commit et push ? (o/n)"
if ($confirmation -ne "o") {
    Write-Host "Opération annulée." -ForegroundColor Yellow
    exit
}

# Ajouter les fichiers
Write-Host "➕ Ajout de tous les fichiers modifiés..." -ForegroundColor Cyan
git add .

# Commit
$message = @"
Mise à jour application : corrections de bugs et passage à la devise FCFA

- Correction de la navigation dans Plan de Charge Équipes (Coût du Produit)
- Correction d'une erreur de syntaxe dans PlanChargeEquipes.js
- Passage de l'euro (€) au franc CFA (FCFA) dans toute l'application
"@

Write-Host "💾 Création du commit..." -ForegroundColor Cyan
git commit -m $message

# Push
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Cyan
try {
    git push origin main
    Write-Host "✅ Mise à jour réussie sur GitHub !" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Tentative avec la branche master..." -ForegroundColor Yellow
    try {
        git push origin master
        Write-Host "✅ Mise à jour réussie sur GitHub !" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du push. Vérifiez vos droits sur le dépôt." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Terminé !" -ForegroundColor Green
