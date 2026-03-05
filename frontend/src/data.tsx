import {type TicketType, TicketStatus, TicketPriority} from "./types";

export const tickets: TicketType[] = [
	{
		title: "Erreur de connexion sur l'application mobile",
		description: "Les utilisateurs signalent ne pas pouvoir se connecter via l'application mobile. Le bouton de connexion ne répond pas lorsqu'on clique dessus.",
		status: TicketStatus.OPEN,
		priority: TicketPriority.HIGH,
	},
	{
		title: "Échec du traitement des paiements",
		description: "Les paiements échouent avec une erreur '502 Bad Gateway'. Cela affecte 10 % des transactions depuis hier.",
		status: TicketStatus.IN_PROGRESS,
		priority: TicketPriority.URGENT,
	},
	{
		title: "Réponse lente de l'API",
		description: "Le point de terminaison `/api/users` met plus de 5 secondes à répondre. Le temps de réponse attendu est inférieur à 1 seconde.",
		status: TicketStatus.PENDING,
		priority: TicketPriority.LOW,
	},
	{
		title: "Tableau de bord ne se charge pas",
		description: "Le tableau de bord administrateur ne se charge pas pour les utilisateurs ayant le rôle 'Manager'. La console affiche une erreur 403.",
		status: TicketStatus.RESOLVED,
		priority: TicketPriority.HIGH,
	},
	{
		title: "Notifications par e-mail non envoyées",
		description: "Les utilisateurs ne reçoivent pas les e-mails de réinitialisation de mot de passe. Les logs SMTP montrent des délais d'attente de connexion.",
		status: TicketStatus.RESOLVED,
		priority: TicketPriority.LOW,
	},
	{
		title: "Connexion à la base de données interrompue",
		description: "La connexion à la base de données de production est interrompue de manière intermittente, provoquant des délais d'attente pour les requêtes API.",
		status: TicketStatus.IN_PROGRESS,
		priority: TicketPriority.URGENT,
	},
	{
		title: "Bug d'interface sur Safari",
		description: "Le menu déroulant s'affiche incorrectement sur Safari (iOS et macOS). Fonctionne correctement sur Chrome/Firefox.",
		status: TicketStatus.OPEN,
		priority: TicketPriority.LOW,
	},
	{
		title: "Échec du téléversement de gros fichiers",
		description: "Les téléversements échouent pour les fichiers >50 Mo avec une erreur '413 Payload Too Large'. Le backend nécessite des mises à jour de configuration.",
		status: TicketStatus.PENDING,
		priority: TicketPriority.HIGH,
	},
	{
		title: "Redirection invalide après la connexion",
		description: "Les utilisateurs sont redirigés vers `/dashboard` au lieu de la dernière page visitée après la connexion.",
		status: TicketStatus.RESOLVED,
		priority: TicketPriority.LOW,
	},
	{
		title: "Fuite de mémoire dans le service en arrière-plan",
		description: "Le service `data-processor` consomme de plus en plus de mémoire au fil du temps. Un redémarrage est nécessaire toutes les 12 heures.",
		status: TicketStatus.IN_PROGRESS,
		priority: TicketPriority.URGENT,
	},
];
