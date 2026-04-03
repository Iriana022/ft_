GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[1;33m
RESET = \033[0m
USER = srasolom
Dockerfilecompose = docker-compose.yml
BACKEND_CONTAINER = nest_backend


all: certs up migrate
# 	@echo "$(GREEN)Starting tikeo...$(RESET)"
# 	@docker compose -f $(Dockerfilecompose) up -d --build
# 	@echo "$(GREEN)Migration...$(RESET)"
# 	@docker exec -it nest_backend npx prisma migrate deploy
# 	@docker exec -it nest_backend npx prisma db push

up:
	@echo "$(GREEN)Starting tikeo...$(RESET)"
# 	@echo "$(GREEN)Restarting tickeo...$(RESET)"
	@docker compose -f $(Dockerfilecompose) up -d --build

migrate:
	@echo "$(GREEN)Migration...$(RESET)"
	@docker exec -i $(BACKEND_CONTAINER) npx prisma migrate deploy
	@docker exec -i $(BACKEND_CONTAINER) npx prisma generate

# FOR SCHEMA UPDATE ONLY or NEW SCHEMA PRISMA
migrate-create:
	@if [ -z "$(name)" ]; then \
	echo "$(RED)Error: missing migration name... Usage: \
	make migrate-create name=your_migration_name$(RESET)"; \
	exit 1; \
	fi
	@echo "$(YELLOW)Creating migration : $(name) $(RESET)"
	@docker exec -i $(BACKEND_CONTAINER) npx prisma migrate dev --name $(name)
	@echo "$(GREEN)Creating migration finished$(RESET)"

##############


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


.PHONY: all fclean down re certs migrate migrate-create
