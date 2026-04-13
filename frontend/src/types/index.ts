export type HeroIconType = React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & { title?: string, titleId?: string } & React.RefAttributes<SVGSVGElement>>;

export enum StatCardType {
	TOTAL_TICKET = 'TOTAL_TICKET',
	OPEN_TICKET = 'OPEN_TICKET',
	CLOSED_TICKET = 'CLOSED_TICKET',
	USERS = 'USERS',
	CATEGORIES = 'CATEGORIES',
}

export enum TicketStatus {
	OPEN = 'OPEN',
	IN_PROGRESS = 'IN_PROGRESS',
	RESOLVED = 'RESOLVED',
	CLOSED = 'CLOSED'
}

export enum UserRole {
	CLIENT = 'CLIENT',
	AGENT = 'AGENT',
	ADMIN = 'ADMIN'
}

export interface TicketInternalNote {
	id: number;
	content: string;
	createdAt: Date;
	ticketId: number;
	authorId: number;
	author: User;
}

export enum TicketPriority {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
	URGENT = 'URGENT'
}

export interface User {
	id: number;
	email: string;
	login?: string;
	avatar?: string;
	role: UserRole;
	createdAt: Date;
	ticketsCreated?: Ticket[];
}

export interface Ticket {
	id: number;
	title: string;
	description: string;
	status: TicketStatus;
	priority: TicketPriority;
	createdAt: Date;
	updatedAt: Date;
	author: User;
	authorId: number;
	assignedTo?: User;
	assignedToId?: number;
	clientUnreadCount: number;
	agentUnreadCount: number;
}

export interface TicketType {
	id: number,
	title: string,
	description: string,
	status: TicketStatus,
	priority: TicketPriority,
	createdAt: Date,
	hasMessage: boolean,
	clientUnreadCount: number
}

export interface Message {
	client: string,
	agent: string,
}

export interface ChatMessage {
	id: number;
	content: string;
	createdAt: Date;
	isFromSupport: boolean;
	ticketId: number;
	authorId: number;
	author: User;
}

