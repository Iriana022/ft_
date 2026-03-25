GREEN = \033[0;32m
RED = \033[0;31m
RESET = \033[0m
USER = srasolom
Dockerfilecompose = docker-compose.yml

all: certs
	@echo "$(GREEN)Starting tickeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) up -d --build
	@echo "$(GREEN)Migration...$(RESET)"
	@docker exec -it nest_backend npx prisma migrate dev --name migrated
	@docker exec -it nest_backend npx prisma db push

up:
	@echo "$(GREEN)Restarting tickeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) up -d


down:
	@echo "$(RED)Stopping tickeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) down

fclean: down
	@echo "$(RED)Stopping and cleaning tickeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) rm -f -s -v
	@docker system prune -af


re: fclean all

certs:
	@mkdir -p ./nginx/certs
	@if [ ! -f ./nginx/certs/fullchain.pem ]; then \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout ./nginx/certs/privkey.pem \
			-out ./nginx/certs/fullchain.pem \
			-subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost"; \
	fi


.PHONY: all clean fclean down re
