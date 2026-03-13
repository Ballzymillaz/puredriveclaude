#!/bin/bash
# ═══════════════════════════════════════════════════════════
#  PureDrivePT — Script de déploiement VPS
#  Usage : bash deploy.sh [setup|update|ssl|backup|logs]
# ═══════════════════════════════════════════════════════════

set -euo pipefail

APP_DIR="/opt/puredrive"
DOMAIN="${DOMAIN:-puredrive.votre-domaine.com}"
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
ok()   { echo -e "${GREEN}✓ $*${NC}"; }
warn() { echo -e "${YELLOW}⚠ $*${NC}"; }
err()  { echo -e "${RED}✗ $*${NC}"; exit 1; }

# ── Vérifier qu'on est root ────────────────────────────────
check_root() { [[ $EUID -eq 0 ]] || err "Lancez ce script en root : sudo bash deploy.sh"; }

# ── Installation initiale ──────────────────────────────────
setup() {
  check_root
  echo "═══ PureDrivePT — Installation VPS ═══"

  # 1. Dépendances système
  apt-get update -qq
  apt-get install -y -qq docker.io docker-compose-v2 git curl openssl certbot
  systemctl enable --now docker
  ok "Docker installé"

  # 2. Répertoire app
  mkdir -p "$APP_DIR"
  cp -r ./* "$APP_DIR/"
  cd "$APP_DIR"

  # 3. Créer .env si inexistant
  if [[ ! -f .env ]]; then
    cp .env.example .env
    # Générer clés aléatoires
    SECRET_KEY=$(openssl rand -hex 32)
    DB_PASS=$(openssl rand -base64 24 | tr -d '/+=')
    REDIS_PASS=$(openssl rand -base64 16 | tr -d '/+=')
    sed -i "s/CHANGE_ME_strong_password_here/$DB_PASS/" .env
    sed -i "s/CHANGE_ME_redis_password/$REDIS_PASS/" .env
    sed -i "s/CHANGE_ME_generate_with_openssl_rand_hex_32/$SECRET_KEY/" .env
    warn "Fichier .env créé avec des clés auto-générées"
    warn "Éditez .env pour configurer ALLOWED_ORIGINS, SMTP, etc."
  fi

  # 4. SSL auto-signé (Let's Encrypt en option)
  ssl_selfsigned

  # 5. Premier build et démarrage
  docker compose build --no-cache
  docker compose up -d
  ok "Application démarrée"

  echo ""
  echo "═══ Installation terminée ═══"
  echo "  URL : https://$DOMAIN"
  echo "  Admin : millaballzy@gmail.com"
  echo "  Mot de passe initial : PureDrive2026!"
  echo ""
  warn "CHANGEZ LE MOT DE PASSE IMMÉDIATEMENT !"
  echo ""
  echo "  Logs : docker compose logs -f"
  echo "  SSL Let's Encrypt : bash deploy.sh ssl"
}

# ── Mise à jour de l'app ────────────────────────────────────
update() {
  cd "$APP_DIR"
  echo "═══ Mise à jour PureDrivePT ═══"
  docker compose build --no-cache backend frontend
  docker compose up -d --no-deps backend frontend
  ok "Application mise à jour"
}

# ── SSL Let's Encrypt ───────────────────────────────────────
ssl_letsencrypt() {
  check_root
  [[ "$DOMAIN" == "puredrive.votre-domaine.com" ]] && err "Configurez DOMAIN avant : DOMAIN=votre.domaine.com bash deploy.sh ssl"
  certbot certonly --standalone --non-interactive --agree-tos \
    --email admin@"$DOMAIN" -d "$DOMAIN"
  cp /etc/letsencrypt/live/"$DOMAIN"/fullchain.pem "$APP_DIR/nginx/ssl/cert.pem"
  cp /etc/letsencrypt/live/"$DOMAIN"/privkey.pem   "$APP_DIR/nginx/ssl/key.pem"
  ok "Certificat Let's Encrypt installé"

  # Cron renouvellement
  (crontab -l 2>/dev/null; echo "0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem $APP_DIR/nginx/ssl/cert.pem && cp /etc/letsencrypt/live/$DOMAIN/privkey.pem $APP_DIR/nginx/ssl/key.pem && docker restart puredrive_nginx") | crontab -
  ok "Renouvellement auto configuré"
}

ssl_selfsigned() {
  mkdir -p "$APP_DIR/nginx/ssl"
  if [[ ! -f "$APP_DIR/nginx/ssl/cert.pem" ]]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout "$APP_DIR/nginx/ssl/key.pem" \
      -out    "$APP_DIR/nginx/ssl/cert.pem" \
      -subj   "/C=PT/ST=Lisboa/O=PureDrive/CN=$DOMAIN" 2>/dev/null
    ok "Certificat SSL auto-signé créé"
  fi
}

# ── Backup base de données ──────────────────────────────────
backup() {
  cd "$APP_DIR"
  BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$BACKUP_DIR"
  docker compose exec -T db pg_dump -U puredrive puredrive | gzip > "$BACKUP_DIR/db.sql.gz"
  cp -r ./nginx/ssl "$BACKUP_DIR/" 2>/dev/null || true
  ok "Backup créé : $BACKUP_DIR"
}

# ── Restauration ───────────────────────────────────────────
restore() {
  [[ -z "${1:-}" ]] && err "Usage : bash deploy.sh restore backups/20260313_120000"
  cd "$APP_DIR"
  gunzip -c "$1/db.sql.gz" | docker compose exec -T db psql -U puredrive puredrive
  ok "Base restaurée depuis $1"
}

# ── Logs ───────────────────────────────────────────────────
logs() {
  cd "$APP_DIR"
  docker compose logs -f "${1:-}"
}

# ── Status ─────────────────────────────────────────────────
status() {
  cd "$APP_DIR"
  docker compose ps
  echo ""
  curl -sk https://localhost/api/health && echo "" && ok "API répond" || warn "API ne répond pas"
}

# ── Reset admin password ─────────────────────────────────
reset_password() {
  [[ -z "${1:-}" ]] && err "Usage : bash deploy.sh reset_password nouveaumotdepasse"
  cd "$APP_DIR"
  # Générer hash bcrypt via Python dans le container
  HASH=$(docker compose exec -T backend python3 -c "from passlib.context import CryptContext; print(CryptContext(schemes=['bcrypt']).hash('$1'))")
  docker compose exec -T db psql -U puredrive puredrive -c "UPDATE users SET hashed_password='$HASH' WHERE role='admin';"
  ok "Mot de passe admin changé"
}

# ── Dispatcher ─────────────────────────────────────────────
CMD="${1:-help}"
case "$CMD" in
  setup)          setup ;;
  update)         update ;;
  ssl)            ssl_letsencrypt ;;
  backup)         backup ;;
  restore)        restore "${2:-}" ;;
  logs)           logs "${2:-}" ;;
  status)         status ;;
  reset_password) reset_password "${2:-}" ;;
  *)
    echo "PureDrivePT Deploy Script"
    echo ""
    echo "Usage: bash deploy.sh <commande>"
    echo ""
    echo "Commandes:"
    echo "  setup            Installation complète sur VPS vierge"
    echo "  update           Rebuild et redémarrer (zéro downtime)"
    echo "  ssl              Installer certificat Let's Encrypt"
    echo "  backup           Sauvegarde de la base de données"
    echo "  restore <dir>    Restaurer depuis un backup"
    echo "  logs [service]   Afficher les logs (tous ou un service)"
    echo "  status           État des containers + health check"
    echo "  reset_password   Réinitialiser le mot de passe admin"
    ;;
esac
