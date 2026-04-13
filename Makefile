GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[1;33m
RESET = \033[0m
Dockerfilecompose = docker-compose.yml

all: certs
	@echo "$(GREEN)Starting tikeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) --env-file backend/.env up -d --build
	@echo "$(GREEN)Waiting for database...$(RESET)"
	@sleep 5
	@echo "$(GREEN)Pushing schema to database...$(RESET)"
	@docker exec -it nest_backend npx prisma db push --accept-data-loss
	@docker exec -it nest_backend npx prisma generate
	@echo "$(GREEN)Tikeo is ready!$(RESET)"

up:
	@echo "$(GREEN)Restarting tikeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) --env-file backend/.env up -d

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

.PHONY: all fclean up down re certs clear-volume
