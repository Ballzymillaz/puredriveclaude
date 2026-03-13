# PureDrivePT — Guide d'hébergement auto VPS

Migration complète depuis Base44 vers votre propre infrastructure.

---

## Architecture

```
Internet
    │
    ▼
[Nginx :443]  ← SSL/TLS, rate limiting, compression
    │
    ├──/api/*──► [FastAPI :8000]  ← Backend Python
    │                │
    │         [PostgreSQL :5432]  ← Base de données
    │         [Redis :6379]       ← Cache/sessions
    │
    └──/*──────► [React/Nginx]    ← Frontend build statique
```

---

## Prérequis VPS

| Critère | Minimum | Recommandé |
|---------|---------|------------|
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Disque | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 | Ubuntu 22.04 |
| Ports | 80, 443 ouverts | 80, 443 ouverts |

Fournisseurs recommandés : **Hetzner** (€4/mois), OVH, DigitalOcean.

---

## Installation en 5 minutes

### 1. Préparer le VPS

```bash
# Connectez-vous en SSH
ssh root@VOTRE_IP_VPS

# Créer un utilisateur non-root (optionnel mais recommandé)
adduser puredrive
usermod -aG sudo puredrive
su - puredrive
```

### 2. Transférer les fichiers

```bash
# Depuis votre machine locale
scp -r ./puredrive root@VOTRE_IP:/opt/puredrive
```

Ou via Git si vous poussez sur un repo privé :
```bash
git clone git@github.com:votre-user/puredrive.git /opt/puredrive
```

### 3. Configurer le DNS

Dans votre registrar (Namecheap, OVH, etc.) :
```
A    puredrive.votre-domaine.com  →  VOTRE_IP_VPS
```
Attendez la propagation DNS (5–30 min).

### 4. Lancer l'installation

```bash
cd /opt/puredrive
chmod +x deploy.sh

# Installation complète
sudo bash deploy.sh setup
```

Le script va :
- Installer Docker
- Générer des clés secrètes aléatoires
- Créer un certificat SSL auto-signé
- Builder et démarrer tous les containers
- Charger toutes vos données depuis Base44

### 5. Configurer le .env

```bash
nano /opt/puredrive/.env
```

Paramètres à modifier :
```env
ALLOWED_ORIGINS=https://puredrive.votre-domaine.com

# Email (pour les notifications)
SMTP_HOST=smtp.gmail.com
SMTP_USER=votre@gmail.com
SMTP_PASSWORD=votre_app_password_gmail
```

```bash
# Redémarrer pour appliquer
cd /opt/puredrive && docker compose restart backend
```

### 6. SSL Let's Encrypt (HTTPS valide)

```bash
# Remplacez le certificat auto-signé par un vrai
DOMAIN=puredrive.votre-domaine.com sudo bash deploy.sh ssl
```

---

## Comptes initiaux

| Email | Rôle | Mot de passe initial |
|-------|------|---------------------|
| millaballzy@gmail.com | Admin | `PureDrive2026!` |
| danyelagsilva@gmail.com | Fleet Manager | `PureDrive2026!` |
| josecabeca.uberdriver@gmail.com | Driver | `PureDrive2026!` |
| xandinhoreis88@gmail.com | Driver | `PureDrive2026!` |
| nunofernandes8655@gmail.com | Driver | `PureDrive2026!` |

> ⚠️ **Changez tous les mots de passe immédiatement** après la première connexion.

---

## Opérations courantes

```bash
# Voir tous les logs
sudo bash deploy.sh logs

# Logs d'un service spécifique
sudo bash deploy.sh logs backend
sudo bash deploy.sh logs db

# État des containers
sudo bash deploy.sh status

# Mise à jour après modification du code
sudo bash deploy.sh update

# Backup de la base
sudo bash deploy.sh backup
# → crée backups/20260313_143022/db.sql.gz

# Restaurer un backup
sudo bash deploy.sh restore backups/20260313_143022

# Réinitialiser le mot de passe admin
sudo bash deploy.sh reset_password NouveauMotDePasse123!
```

---

## Structure des fichiers

```
puredrive/
├── docker-compose.yml       ← Orchestration de tous les services
├── .env.example             ← Template de configuration (copier en .env)
├── deploy.sh                ← Script de déploiement
│
├── backend/                 ← API FastAPI (Python)
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py          ← Point d'entrée
│       ├── core/
│       │   ├── config.py    ← Variables d'environnement
│       │   ├── database.py  ← Connexion PostgreSQL async
│       │   └── security.py  ← JWT + bcrypt
│       ├── models/
│       │   └── all_models.py ← 24 tables SQLAlchemy
│       └── routers/
│           ├── auth.py       ← Login, refresh, me
│           ├── _all_routers.py ← Tous les CRUD
│           └── *.py          ← Stubs par entité
│
├── frontend/                ← React + Vite
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       └── api/
│           └── client.js    ← Remplace le SDK Base44
│
├── nginx/
│   ├── nginx.conf           ← Reverse proxy + SSL
│   └── ssl/                 ← Certificats (auto-générés ou Let's Encrypt)
│
└── scripts/
    └── init.sql             ← Schéma + données réelles Base44
```

---

## API Documentation

En mode développement (`DEBUG=true`) :
- Swagger : `http://localhost:8000/api/docs`
- ReDoc : `http://localhost:8000/api/redoc`

### Endpoints principaux

```
POST /api/auth/token                    ← Login
POST /api/auth/refresh                  ← Renouveler token
GET  /api/auth/me                       ← Profil actuel

GET  /api/drivers/                      ← Liste motoristes
POST /api/drivers/                      ← Créer motoriste
PUT  /api/drivers/{id}                  ← Modifier

GET  /api/vehicles/                     ← Liste véhicules
GET  /api/payments/?driver_id=X         ← Paiements par motoriste
POST /api/payments/                     ← Créer paiement (UPI auto)
PUT  /api/loans/{id}/approve            ← Approuver emprunt (admin)

GET  /api/reports/summary               ← Résumé financier
GET  /api/reports/weekly                ← Stats hebdomadaires

POST /api/documents/upload              ← Upload fichier
```

---

## Intégrer le frontend React existant

Dans votre code React, remplacez tous les imports Base44 :

```javascript
// AVANT (Base44)
import { Driver } from "@/api/entities";
const drivers = await Driver.list();

// APRÈS (votre backend)
import { drivers } from "@/api/client";
const { entities } = await drivers.list();
```

La structure de réponse est identique à Base44 : `{ entities: [...], count: N }`.

---

## Monitoring

Ajoutez Uptime Kuma pour surveiller l'app :
```bash
docker run -d --name uptimekuma \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1
```
Puis configurez un monitor HTTP sur `https://votre-domaine.com/api/health`.

---

## Coût estimé

| Service | Fournisseur | Coût mensuel |
|---------|-------------|--------------|
| VPS 2GB | Hetzner CX22 | ~€4 |
| Domaine | Namecheap | ~€1 |
| SSL | Let's Encrypt | Gratuit |
| **Total** | | **~€5/mois** |

Versus Base44 : à partir de **€29/mois** (et sans contrôle de vos données).

---

## Sécurité

- [x] JWT avec expiration (60 min access, 30 jours refresh)
- [x] Bcrypt pour les mots de passe
- [x] Rate limiting sur l'API (30 req/s) et l'auth (5 req/min)
- [x] Headers de sécurité HTTP (HSTS, XSS, etc.)
- [x] RLS par rôle (admin/fleet_manager/driver)
- [x] CORS configuré
- [ ] À faire : activer le pare-feu VPS (UFW)

```bash
# Activer UFW sur le VPS
sudo ufw allow 22   # SSH
sudo ufw allow 80   # HTTP
sudo ufw allow 443  # HTTPS
sudo ufw enable
```
