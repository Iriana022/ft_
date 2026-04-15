-- AlterTable
ALTER TABLE "Ticket"
  ADD COLUMN "assignedAgentDeleted" BOOLEAN NOT NULL DEFAULT false,
  ALTER COLUMN "authorId" DROP NOT NULL;

ALTER TABLE "ChatMessage"
  ALTER COLUMN "authorId" DROP NOT NULL;

ALTER TABLE "TicketInternalNote"
  ALTER COLUMN "authorId" DROP NOT NULL;

ALTER TABLE "TicketStatusHistory"
  ALTER COLUMN "changedById" DROP NOT NULL;

-- UpdateForeignKeys
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_authorId_fkey";
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_AssignedToId_fkey";
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_authorId_fkey";
ALTER TABLE "TicketInternalNote" DROP CONSTRAINT IF EXISTS "TicketInternalNote_authorId_fkey";
ALTER TABLE "TicketStatusHistory" DROP CONSTRAINT IF EXISTS "TicketStatusHistory_changedById_fkey";

ALTER TABLE "Ticket"
  ADD CONSTRAINT "Ticket_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Ticket"
  ADD CONSTRAINT "Ticket_AssignedToId_fkey"
  FOREIGN KEY ("AssignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChatMessage"
  ADD CONSTRAINT "ChatMessage_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketInternalNote"
  ADD CONSTRAINT "TicketInternalNote_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "TicketStatusHistory"
  ADD CONSTRAINT "TicketStatusHistory_changedById_fkey"
  FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
