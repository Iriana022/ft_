GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[1;33m
RESET = \033[0m
Dockerfilecompose = docker-compose.yml
ENV_FILE = backend/.env
REQUIRED_ENV_VARS = DATABASE_URL JWT_SECRET GOOGLE_CLIENT_ID GOOGLE_CLIENT_SECRET GOOGLE_REDIRECT_URI ADMIN_LOGIN ADMIN_EMAIL ADMIN_PASSWORD

all: check-env certs
	@echo "$(GREEN)Starting tikeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) --env-file backend/.env up -d --build
	@echo "$(GREEN)Waiting for database...$(RESET)"
	@sleep 5
	@echo "$(GREEN)Pushing schema to database...$(RESET)"
	@docker exec -it nest_backend npx prisma db push --accept-data-loss
	@docker exec -it nest_backend npx prisma generate
	@echo "$(GREEN)Tikeo is ready!$(RESET)"

up: check-env
	@echo "$(GREEN)Restarting tikeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) --env-file backend/.env up -d

check-env:
	@if [ ! -f "$(ENV_FILE)" ]; then \
		echo "$(RED)Missing $(ENV_FILE). Create it before running make.$(RESET)"; \
		exit 1; \
	fi
	@missing=0; \
	for key in $(REQUIRED_ENV_VARS); do \
		line=$$(grep -E "^[[:space:]]*$$key[[:space:]]*=" "$(ENV_FILE)" | head -n 1); \
		if [ -z "$$line" ]; then \
			echo "$(RED)Missing variable in $(ENV_FILE): $$key$(RESET)"; \
			missing=1; \
			continue; \
		fi; \
		value=$$(printf "%s" "$$line" | sed -E 's/^[[:space:]]*[^=]+=[[:space:]]*//'); \
		value=$$(printf "%s" "$$value" | sed -E "s/^[[:space:]]+|[[:space:]]+$$//g; s/^\"//; s/\"$$//; s/^'//; s/'$$//"); \
		if [ -z "$$value" ]; then \
			echo "$(RED)Empty variable in $(ENV_FILE): $$key$(RESET)"; \
			missing=1; \
		fi; \
	done; \
	if [ $$missing -eq 1 ]; then \
		echo "$(YELLOW)Fix $(ENV_FILE) then rerun make.$(RESET)"; \
		exit 1; \
	fi; \
	echo "$(GREEN)Environment file check passed.$(RESET)"

down:
	@echo "$(RED)Stopping tikeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) --env-file backend/.env down

fclean: down
	@echo "$(RED)Stopping and cleaning tikeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) --env-file backend/.env rm -f -s -v
	@docker system prune -af

clear-volume:
	@echo "$(RED)cleaning all tikeo volume...$(RESET)"
	@docker volume prune -af

re: fclean all

prisma-studio:
	@docker exec nest_backend npx prisma studio

certs:
	@mkdir -p ./nginx/certs
	@if [ ! -f ./nginx/certs/fullchain.pem ]; then \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout ./nginx/certs/privkey.pem \
			-out ./nginx/certs/fullchain.pem \
			-subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost"; \
	fi

.PHONY: all fclean up down re certs clear-volume check-env
