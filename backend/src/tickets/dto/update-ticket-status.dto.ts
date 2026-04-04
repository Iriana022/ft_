import { IsIn } from 'class-validator';

const ticketStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

type TicketStatusValue = (typeof ticketStatuses)[number];

export class UpdateTicketStatusDto {
  @IsIn(ticketStatuses)
  status: TicketStatusValue;
}
