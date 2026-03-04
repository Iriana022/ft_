import type { User, Ticket } from '../types';
import { UserRole, TicketStatus, Priority } from '../types';

// Users fictifs
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@support.com',
    login: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    role: UserRole.ADMIN,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    email: 'agent.martin@support.com',
    login: 'j.martin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
    role: UserRole.AGENT,
    createdAt: new Date('2024-01-20')
  },
  {
    id: 3,
    email: 'agent.dupont@support.com',
    login: 's.dupont',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dupont',
    role: UserRole.AGENT,
    createdAt: new Date('2024-01-22')
  },
  {
    id: 4,
    email: 'client1@email.com',
    login: 'alice_w',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
    role: UserRole.CLIENT,
    createdAt: new Date('2024-02-01')
  },
  {
    id: 5,
    email: 'client2@email.com',
    login: 'bob_smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
    role: UserRole.CLIENT,
    createdAt: new Date('2024-02-05')
  },
  {
    id: 6,
    email: 'client3@email.com',
    login: 'emma_j',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    role: UserRole.CLIENT,
    createdAt: new Date('2024-02-10')
  }
];

// Tickets fictifs
export const mockTickets: Ticket[] = [
  {
    id: 1,
    title: 'Impossible de se connecter à mon compte',
    description: 'Je reçois une erreur 401 à chaque tentative de connexion depuis ce matin.',
    status: TicketStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    createdAt: new Date('2024-02-20T09:30:00'),
    updatedAt: new Date('2024-02-20T14:20:00'),
    author: mockUsers[3],
    authorId: 4,
    assignedTo: mockUsers[1],
    assignedToId: 2
  },
  {
    id: 2,
    title: 'Erreur 500 lors du téléchargement de fichiers',
    description: 'Impossible de télécharger des fichiers PDF supérieurs à 5MB.',
    status: TicketStatus.OPEN,
    priority: Priority.URGENT,
    createdAt: new Date('2024-02-23T10:15:00'),
    updatedAt: new Date('2024-02-23T10:15:00'),
    author: mockUsers[4],
    authorId: 5
  },
  {
    id: 3,
    title: 'Question sur la fonctionnalité de export',
    description: 'Comment exporter mes données en format CSV ?',
    status: TicketStatus.RESOLVED,
    priority: Priority.LOW,
    createdAt: new Date('2024-02-18T15:45:00'),
    updatedAt: new Date('2024-02-19T09:30:00'),
    author: mockUsers[5],
    authorId: 6,
    assignedTo: mockUsers[2],
    assignedToId: 3
  },
  {
    id: 4,
    title: 'La page de profil ne charge pas correctement',
    description: 'Les informations personnelles ne s\'affichent pas. J\'ai vidé le cache sans succès.',
    status: TicketStatus.IN_PROGRESS,
    priority: Priority.MEDIUM,
    createdAt: new Date('2024-02-21T11:20:00'),
    updatedAt: new Date('2024-02-22T16:00:00'),
    author: mockUsers[3],
    authorId: 4,
    assignedTo: mockUsers[1],
    assignedToId: 2
  },
  {
    id: 5,
    title: 'Demande de fonctionnalité: Mode sombre',
    description: 'Serait-il possible d\'ajouter un mode sombre à l\'application ?',
    status: TicketStatus.OPEN,
    priority: Priority.LOW,
    createdAt: new Date('2024-02-22T14:30:00'),
    updatedAt: new Date('2024-02-22T14:30:00'),
    author: mockUsers[4],
    authorId: 5
  },
  {
    id: 6,
    title: 'Notifications push ne fonctionnent pas',
    description: 'Je ne reçois plus les notifications sur Chrome depuis la dernière mise à jour.',
    status: TicketStatus.RESOLVED,
    priority: Priority.MEDIUM,
    createdAt: new Date('2024-02-19T08:00:00'),
    updatedAt: new Date('2024-02-20T10:30:00'),
    author: mockUsers[5],
    authorId: 6,
    assignedTo: mockUsers[2],
    assignedToId: 3
  },
  {
    id: 7,
    title: 'Problème de performance sur mobile',
    description: 'L\'application est très lente sur mon iPhone 12. Le chargement prend plus de 10 secondes.',
    status: TicketStatus.OPEN,
    priority: Priority.HIGH,
    createdAt: new Date('2024-02-23T16:45:00'),
    updatedAt: new Date('2024-02-23T16:45:00'),
    author: mockUsers[3],
    authorId: 4
  },
  {
    id: 8,
    title: 'Réinitialisation du mot de passe impossible',
    description: 'Le lien de réinitialisation expire avant que je puisse l\'utiliser.',
    status: TicketStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    createdAt: new Date('2024-02-23T12:00:00'),
    updatedAt: new Date('2024-02-23T13:15:00'),
    author: mockUsers[4],
    authorId: 5,
    assignedTo: mockUsers[1],
    assignedToId: 2
  },
  {
    id: 9,
    title: 'Les emails de confirmation ne sont pas reçus',
    description: 'Après inscription, aucun email de confirmation n\'arrive dans ma boîte.',
    status: TicketStatus.RESOLVED,
    priority: Priority.MEDIUM,
    createdAt: new Date('2024-02-17T10:00:00'),
    updatedAt: new Date('2024-02-18T11:00:00'),
    author: mockUsers[5],
    authorId: 6,
    assignedTo: mockUsers[2],
    assignedToId: 3
  },
  {
    id: 10,
    title: 'Bug d\'affichage sur Firefox',
    description: 'Le menu de navigation est décalé sur Firefox version 122.',
    status: TicketStatus.OPEN,
    priority: Priority.LOW,
    createdAt: new Date('2024-02-23T09:30:00'),
    updatedAt: new Date('2024-02-23T09:30:00'),
    author: mockUsers[3],
    authorId: 4
  },
  {
    id: 11,
    title: 'Erreur lors du paiement',
    description: 'Transaction refusée malgré des fonds suffisants sur ma carte.',
    status: TicketStatus.IN_PROGRESS,
    priority: Priority.URGENT,
    createdAt: new Date('2024-02-23T11:00:00'),
    updatedAt: new Date('2024-02-23T14:30:00'),
    author: mockUsers[4],
    authorId: 5,
    assignedTo: mockUsers[1],
    assignedToId: 2
  },
  {
    id: 12,
    title: 'Suggestion: Amélioration de l\'interface',
    description: 'Il serait intéressant d\'ajouter des raccourcis clavier pour les actions fréquentes.',
    status: TicketStatus.RESOLVED,
    priority: Priority.LOW,
    createdAt: new Date('2024-02-16T14:20:00'),
    updatedAt: new Date('2024-02-17T09:00:00'),
    author: mockUsers[5],
    authorId: 6,
    assignedTo: mockUsers[2],
    assignedToId: 3
  }
];

// Statistiques calculées
export const getTicketStats = () => {
  const total = mockTickets.length;
  const open = mockTickets.filter(t => t.status === TicketStatus.OPEN).length;
  const inProgress = mockTickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length;
  const resolved = mockTickets.filter(t => t.status === TicketStatus.RESOLVED).length;
  
  const urgent = mockTickets.filter(t => t.priority === Priority.URGENT).length;
  const high = mockTickets.filter(t => t.priority === Priority.HIGH).length;
  const medium = mockTickets.filter(t => t.priority === Priority.MEDIUM).length;
  const low = mockTickets.filter(t => t.priority === Priority.LOW).length;

  return {
    total,
    open,
    inProgress,
    resolved,
    byPriority: { urgent, high, medium, low },
    avgResolutionTime: '4.5h' // Fictif
  };
};

// Données pour les graphiques
export const getChartData = () => {
  return {
    statusDistribution: [
      { name: 'Ouvert', value: getTicketStats().open, fill: '#EF4444' },
      { name: 'En cours', value: getTicketStats().inProgress, fill: '#F59E0B' },
      { name: 'Résolu', value: getTicketStats().resolved, fill: '#10B981' }
    ],
    priorityDistribution: [
      { name: 'Urgent', value: getTicketStats().byPriority.urgent, fill: '#DC2626' },
      { name: 'Haute', value: getTicketStats().byPriority.high, fill: '#F59E0B' },
      { name: 'Moyenne', value: getTicketStats().byPriority.medium, fill: '#3B82F6' },
      { name: 'Basse', value: getTicketStats().byPriority.low, fill: '#10B981' }
    ],
    weeklyActivity: [
      { day: 'Lun', tickets: 8 },
      { day: 'Mar', tickets: 12 },
      { day: 'Mer', tickets: 15 },
      { day: 'Jeu', tickets: 10 },
      { day: 'Ven', tickets: 14 },
      { day: 'Sam', tickets: 5 },
      { day: 'Dim', tickets: 3 }
    ]
  };
};
