import { Ticket, User } from '../types';

export interface InternalNote {
  id: number;
  content: string;
  author: User;
  createdAt: Date;
}

export interface Response {
  id: number;
  content: string;
  author: User;
  createdAt: Date;
  isFromSupport: boolean;
}

// Notes internes (visibles seulement par les agents/admins)
export const mockInternalNotes: { [ticketId: number]: InternalNote[] } = {
  1: [
    {
      id: 1,
      content: 'Le problème semble venir d\'une expiration de session. Je vais vérifier les logs du serveur.',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-20T09:45:00')
    },
    {
      id: 2,
      content: 'Confirmé - expiration de session après 30 min d\'inactivité. J\'ai réinitialisé manuellement.',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-20T14:15:00')
    }
  ],
  2: [
    {
      id: 3,
      content: 'Problème identifié dans le code. Ticket transféré à l\'équipe de développement.',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-23T11:00:00')
    }
  ]
};

// Réponses publiques (conversation avec le client)
export const mockResponses: { [ticketId: number]: Response[] } = {
  1: [
    {
      id: 1,
      content: 'Impossible de me connecter à mon compte depuis ce matin. J\'obtiens toujours une erreur "Session expirée" même après avoir vidé le cache.',
      author: {
        id: 4,
        email: 'client1@email.com',
        login: 'alice_w',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        role: 'CLIENT' as any,
        createdAt: new Date('2024-02-01')
      },
      createdAt: new Date('2024-02-20T09:30:00'),
      isFromSupport: false
    },
    {
      id: 2,
      content: 'Bonjour Alice, merci pour votre signalement. Je comprends votre frustration. Je vais investiguer le problème immédiatement et je reviens vers vous dès que possible.',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-20T10:00:00'),
      isFromSupport: true
    },
    {
      id: 3,
      content: 'J\'ai identifié le problème. Il s\'agissait d\'une expiration de session. J\'ai réinitialisé votre session. Pouvez-vous réessayer de vous connecter maintenant ?',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-20T14:20:00'),
      isFromSupport: true
    },
    {
      id: 4,
      content: 'Ça fonctionne parfaitement maintenant ! Merci beaucoup pour votre aide rapide et efficace.',
      author: {
        id: 4,
        email: 'client1@email.com',
        login: 'alice_w',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
        role: 'CLIENT' as any,
        createdAt: new Date('2024-02-01')
      },
      createdAt: new Date('2024-02-20T15:30:00'),
      isFromSupport: false
    },
    {
      id: 5,
      content: 'Parfait ! Je suis ravi que tout fonctionne. N\'hésitez pas à nous recontacter si vous avez d\'autres questions. Je marque ce ticket comme résolu.',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-20T15:45:00'),
      isFromSupport: true
    }
  ],
  2: [
    {
      id: 6,
      content: 'Bonjour, les graphiques de mon dashboard ne s\'affichent plus depuis la mise à jour d\'hier. Je vois juste des espaces vides à la place.',
      author: {
        id: 5,
        email: 'client2@email.com',
        login: 'bob_m',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
        role: 'CLIENT' as any,
        createdAt: new Date('2024-02-10')
      },
      createdAt: new Date('2024-02-23T10:15:00'),
      isFromSupport: false
    },
    {
      id: 7,
      content: 'Bonjour Bob, merci d\'avoir signalé ce problème. Nous avons identifié un bug lié à la dernière mise à jour. Notre équipe technique travaille activement sur un correctif. Je vous tiendrai informé de l\'avancement.',
      author: {
        id: 2,
        email: 'agent.martin@support.com',
        login: 'j.martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=martin',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-20')
      },
      createdAt: new Date('2024-02-23T11:30:00'),
      isFromSupport: true
    }
  ],
  3: [
    {
      id: 8,
      content: 'J\'aimerais savoir comment configurer les notifications par email pour recevoir les alertes importantes.',
      author: {
        id: 6,
        email: 'client3@email.com',
        login: 'carol_d',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
        role: 'CLIENT' as any,
        createdAt: new Date('2024-02-15')
      },
      createdAt: new Date('2024-02-25T14:00:00'),
      isFromSupport: false
    },
    {
      id: 9,
      content: 'Bonjour Carol, c\'est très simple ! Allez dans Paramètres > Notifications, puis activez "Alertes par email". Vous pouvez choisir la fréquence et le type d\'alertes que vous souhaitez recevoir.',
      author: {
        id: 3,
        email: 'agent.sophie@support.com',
        login: 's.bernard',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
        role: 'AGENT' as any,
        createdAt: new Date('2024-01-25')
      },
      createdAt: new Date('2024-02-25T14:30:00'),
      isFromSupport: true
    },
    {
      id: 10,
      content: 'Merci ! C\'est fait, j\'ai bien reçu un email de test.',
      author: {
        id: 6,
        email: 'client3@email.com',
        login: 'carol_d',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol',
        role: 'CLIENT' as any,
        createdAt: new Date('2024-02-15')
      },
      createdAt: new Date('2024-02-25T14:45:00'),
      isFromSupport: false
    }
  ]
};