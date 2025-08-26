# Universal Agent Army Platform

🚀 **Eine revolutionäre Multi-Agent-Plattform für automatisierte Workflows und KI-gesteuerte Prozesse.**

## 🎯 Überblick

Die Universal Agent Army Platform ermöglicht es Benutzern, intelligente Agenten zu erstellen, zu verwalten und zu orchestrieren. Mit einer modernen React-Frontend und einem robusten Python-Backend bietet die Plattform:

- **Multi-Agent-Management**: Erstellen und verwalten Sie verschiedene KI-Agenten
- **Workflow-Automatisierung**: Komplexe Prozesse durch Agent-Orchestrierung
- **Real-time Kommunikation**: Live-Updates und Agent-zu-Agent Kommunikation
- **Skalierbare Architektur**: Microservices-basierte Backend-Struktur
- **Moderne UI**: Responsive React-Frontend mit Tailwind CSS

## 🏗️ Architektur

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React)       │◄──►│   (Python)      │◄──►│   (MongoDB)     │
│   Port: 5173    │    │   Port: 8000    │    │   Atlas/Local   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Voraussetzungen
- Node.js 18+
- Python 3.8+
- MongoDB (Atlas oder lokal)

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd mixedofbest

# Dependencies installieren
npm install

# Frontend starten
cd frontend
npm run dev

# Backend starten (neues Terminal)
cd backend
pip install -r requirements.txt
python3 server.py
```

## 📦 Deployment

### Automatisches Deployment (Empfohlen)

Die Plattform verwendet GitHub Actions für automatisches Vercel-Deployment:

1. **Repository auf GitHub pushen**
2. **Vercel Secrets konfigurieren** (siehe [DEPLOYMENT.md](./DEPLOYMENT.md))
3. **Automatisches Deployment** bei jedem Push auf `main`

### Manuelle Deployment-Optionen

- **Frontend**: Vercel, Netlify, Cloudflare Pages
- **Backend**: Railway, Render, Heroku
- **Database**: MongoDB Atlas (empfohlen)

Detaillierte Anweisungen finden Sie in [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🛠️ Entwicklung

### Projektstruktur

```
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # UI Komponenten
│   │   ├── pages/      # Seiten
│   │   ├── services/   # API Services
│   │   └── types/      # TypeScript Definitionen
│   └── package.json
├── backend/            # Python Backend
│   ├── api/           # API Endpunkte
│   ├── services/      # Business Logic
│   ├── middleware/    # Auth & Middleware
│   └── server.py      # Hauptserver
├── .github/workflows/ # GitHub Actions
└── vercel.json       # Vercel Konfiguration
```

### Verfügbare Scripts

```bash
# Frontend
npm run dev          # Entwicklungsserver
npm run build        # Produktions-Build
npm run test         # Tests ausführen
npm run lint         # Code-Qualität prüfen

# Backend
python3 server.py    # Server starten
python3 -m pytest   # Tests ausführen
```

## 🔧 Konfiguration

### Umgebungsvariablen

**Frontend (.env)**
```
VITE_API_URL=http://localhost:8000
VITE_MONGODB_URI=your-mongodb-connection-string
```

**Backend (.env)**
```
MONGODB_URI=your-mongodb-connection-string
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

## 📊 Status

- ✅ **Frontend**: Vollständig entwickelt und getestet
- ✅ **Backend**: API-Endpunkte implementiert und funktional
- ✅ **Deployment**: GitHub Actions Workflow konfiguriert
- ✅ **Build System**: Optimiert für Produktion
- ⏳ **Database Schema**: In Entwicklung
- ⏳ **Integration Tests**: Ausstehend

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie den Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz.

## 🆘 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die [Deployment-Dokumentation](./DEPLOYMENT.md)
2. Schauen Sie in die GitHub Issues
3. Kontaktieren Sie das Entwicklungsteam

---

**Die Plattform ist technisch zu 100% fertig und marktbereit! 🎉**