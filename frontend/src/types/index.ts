export type HeroIconType = React.ForwardRefExoticComponent<React.PropsWithoutRef<React.SVGProps<SVGSVGElement>> & {title?: string, titleId?: string} & React.RefAttributes<SVGSVGElement>>;

export enum TicketStatus {
	OPEN = 'OPEN',
	IN_PROGRESS = 'IN_PROGRESS',
	PENDING = 'PENDING',
	RESOLVED = 'RESOLVED',
	CLOSED = 'CLOSED'
}

export enum UserRole {
	CLIENT = 'CLIENT',
	AGENT = 'AGENT',
	ADMIN = 'ADMIN'
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
}

import React from 'react';



export interface TicketType {
	title: string,
	description: string,
	status: TicketStatus,
	priority: TicketPriority,
}

