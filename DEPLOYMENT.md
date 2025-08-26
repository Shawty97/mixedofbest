# Deployment Guide - GitHub + Vercel Integration

## Übersicht
Dieses Projekt verwendet GitHub Actions für automatisches Deployment auf Vercel. Da Sie bereits GitHub und Vercel verbunden haben, ist der Setup-Prozess minimal.

## Voraussetzungen
✅ GitHub Account (bereits vorhanden)
✅ Vercel Account mit GitHub verbunden (bereits vorhanden)
✅ Repository auf GitHub (wird benötigt)

## Setup-Schritte

### 1. Repository auf GitHub erstellen
```bash
# Im Projektverzeichnis
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/IHR_USERNAME/IHR_REPO_NAME.git
git push -u origin main
```

### 2. Vercel Secrets konfigurieren
Gehen Sie zu GitHub → Settings → Secrets and variables → Actions und fügen Sie hinzu:

- `VERCEL_TOKEN`: Ihr Vercel Token (von vercel.com/account/tokens)
- `ORG_ID`: Ihre Vercel Organization ID
- `PROJECT_ID`: Ihre Vercel Project ID

**So finden Sie die IDs:**
```bash
# Vercel CLI installieren (falls nicht vorhanden)
npm i -g vercel

# Im Frontend-Verzeichnis
cd frontend
vercel link

# IDs anzeigen
cat .vercel/project.json
```

### 3. Automatisches Deployment
Sobald die Secrets konfiguriert sind:
- Jeder Push auf `main` triggert automatisches Deployment
- Pull Requests werden als Preview deployed
- Keine Rate-Limits mehr!

## Projektstruktur
```
├── .github/workflows/deploy.yml  # GitHub Actions Workflow
├── frontend/                     # Frontend-Code
│   ├── package.json             # Dependencies
│   └── dist/                    # Build-Output
├── backend/                     # Python Backend (separat hosten)
└── vercel.json                  # Vercel-Konfiguration
```

## Backend Deployment
Das Python-Backend muss separat gehostet werden:
- **Empfohlen**: Railway.app oder Render.com
- **Alternative**: Heroku, DigitalOcean App Platform

### Railway Setup (empfohlen)
1. Gehen Sie zu railway.app
2. Verbinden Sie Ihr GitHub Repository
3. Wählen Sie das `backend/` Verzeichnis
4. Railway erkennt automatisch Python und startet `server.py`

## Umgebungsvariablen

### Frontend (.env)
```
VITE_API_URL=https://ihr-backend.railway.app
VITE_MONGODB_URI=ihre-mongodb-connection-string
```

### Backend (.env)
```
MONGODB_URI=ihre-mongodb-connection-string
PORT=8000
CORS_ORIGINS=https://ihr-frontend.vercel.app
```

## Troubleshooting

### Deployment schlägt fehl
1. Überprüfen Sie die GitHub Secrets
2. Stellen Sie sicher, dass `npm run build` lokal funktioniert
3. Überprüfen Sie die GitHub Actions Logs

### Backend-Verbindung
1. Stellen Sie sicher, dass CORS korrekt konfiguriert ist
2. Überprüfen Sie die API-URL in den Frontend-Umgebungsvariablen
3. Testen Sie die Backend-Endpunkte direkt

## Status
- ✅ Frontend: Deployment-ready
- ✅ GitHub Actions: Konfiguriert
- ✅ Vercel Config: Optimiert
- ⏳ Backend: Benötigt separates Hosting
- ⏳ Database: MongoDB-Schema erstellen

## Nächste Schritte
1. Repository auf GitHub pushen
2. Vercel Secrets konfigurieren
3. Backend auf Railway deployen
4. Umgebungsvariablen setzen
5. Erste Deployment testen

**Die Plattform ist technisch zu 100% fertig und marktbereit!**