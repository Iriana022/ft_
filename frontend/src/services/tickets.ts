import api from './api';
import { TicketStatus, type Ticket, type User } from '../types';

type RawUser = Omit<User, 'createdAt'> & {
  createdAt: string | Date;
};

type RawTicket = Omit<Ticket, 'createdAt' | 'updatedAt' | 'author' | 'assignedTo' | 'assignedToId'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
  author: RawUser;
  assignedTo?: RawUser;
  AssignedTo?: RawUser;
  assignedToId?: number;
  AssignedToId?: number;
};

const normalizeUser = (user: RawUser): User => ({
  ...user,
  createdAt: new Date(user.createdAt),
});

export const normalizeTicket = (ticket: RawTicket): Ticket => {
  const assignedTo = ticket.assignedTo ?? ticket.AssignedTo;

  return {
    ...ticket,
    createdAt: new Date(ticket.createdAt),
    updatedAt: new Date(ticket.updatedAt),
    author: normalizeUser(ticket.author),
    assignedTo: assignedTo ? normalizeUser(assignedTo) : undefined,
    assignedToId: ticket.assignedToId ?? ticket.AssignedToId,
  };
};

export const fetchTickets = async (): Promise<Ticket[]> => {
  const response = await api.get('/tickets');
  const rawTickets = (response.data ?? []) as RawTicket[];

  return rawTickets.map(normalizeTicket);
};

export const getTicketStats = (tickets: Ticket[]) => ({
  total: tickets.length,
  open: tickets.filter((ticket) => ticket.status === TicketStatus.OPEN).length,
  inProgress: tickets.filter((ticket) => ticket.status === TicketStatus.IN_PROGRESS).length,
});
