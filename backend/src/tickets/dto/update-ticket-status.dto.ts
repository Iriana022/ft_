import { IsIn } from 'class-validator';

const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'] as const;

type TicketStatusValue = (typeof ticketStatuses)[number];

export class UpdateTicketStatusDto {
  @IsIn(ticketStatuses)
  status: TicketStatusValue;
}
