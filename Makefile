GREEN = \033[0;32m
RED = \033[0;31m
RESET = \033[0m
USER = srasolom
Dockerfilecompose = docker-compose.yml

all:
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


.PHONY: all clean fclean down re