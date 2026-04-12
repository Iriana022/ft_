import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { TicketStatus } from '../../../types';
import { fetchTicketResolutionHistory, fetchTickets, fetchUsers } from '../../../services/tickets';
import {
	generateDailyTickets,
	getPriorityText,
	getStatusText,
} from '../adminHelpers';

export function AdminStats() {
	const { t, i18n } = useTranslation('admin');
	const [isExporting, setIsExporting] = useState(false);
	const [exportError, setExportError] = useState<string | null>(null);

	const handleExportPdf = async () => {
		try {
			setIsExporting(true);
			setExportError(null);

			const [tickets, users, resolutionHistory] = await Promise.all([
				fetchTickets(),
				fetchUsers(),
				fetchTicketResolutionHistory(7),
			]);

			const doc = new jsPDF({
				orientation: 'landscape',
				unit: 'pt',
				format: 'a4',
			});

			const generatedAt = new Date();

			doc.setFontSize(18);
			doc.text('Tikeo - Admin Report', 40, 40);

			doc.setFontSize(10);
			doc.text(
				t('generatedOn') + ': ' + generatedAt.toLocaleString(i18n.language),
				40,
				58
			);

			const totalTickets = tickets.length;
			const openTickets = tickets.filter((ticket) => ticket.status === TicketStatus.OPEN).length;
			const inProgressTickets = tickets.filter((ticket) => ticket.status === TicketStatus.IN_PROGRESS).length;
			const resolvedTickets = tickets.filter((ticket) => ticket.status === TicketStatus.RESOLVED).length;
			const closedTickets = tickets.filter((ticket) => ticket.status === TicketStatus.CLOSED).length;

			autoTable(doc, {
				startY: 76,
				head: [[t('metric'), t('value')]],
				body: [
					[t('totalTickets'), String(totalTickets)],
					[t('openPlural'), String(openTickets)],
					[t('inProgressPlural'), String(inProgressTickets)],
					[t('resolvedPlural'), String(resolvedTickets)],
					[t('closedPlural'), String(closedTickets)],
					[t('users'), String(users.length)],
				],
				styles: { fontSize: 10 },
				headStyles: { fillColor: [22, 56, 95] },
			});

			const dailyActivity = generateDailyTickets(tickets, resolutionHistory, i18n.language);

			autoTable(doc, {
				startY: (doc as any).lastAutoTable.finalY + 16,
				head: [[t('day'), t('created'), t('resolved')]],
				body: dailyActivity.map((item) => [
					item.name,
					String(item.created),
					String(item.resolved),
				]),
				styles: { fontSize: 9 },
				headStyles: { fillColor: [46, 139, 87] },
			});

			const ticketRows = [...tickets]
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.map((ticket) => [
					'TK-' + ticket.id,
					ticket.title,
					getStatusText(ticket.status, t),
					getPriorityText(ticket.priority, t),
					ticket.author?.login ?? ticket.author?.email ?? 'N/A',
					ticket.createdAt.toLocaleDateString(i18n.language).replace(/\//g, '-'),
				]);

			autoTable(doc, {
				startY: (doc as any).lastAutoTable.finalY + 16,
				head: [[t('idColumn'), t('titleColumn'), t('statusColumn'), t('priorityColumn'), t('clientColumn'), t('dateColumn')]],
				body: ticketRows.length > 0 ? ticketRows : [[t('noTickets'), '', '', '', '', '']],
				styles: { fontSize: 8, cellPadding: 4 },
				headStyles: { fillColor: [22, 56, 95] },
				columnStyles: {
					0: { cellWidth: 55 },
					1: { cellWidth: 220 },
					2: { cellWidth: 90 },
					3: { cellWidth: 90 },
					4: { cellWidth: 130 },
					5: { cellWidth: 90 },
				},
			});

			const datePart = generatedAt.toISOString().slice(0, 10);
			doc.save('tikeo-admin-report-' + datePart + '.pdf');
		} catch (error) {
			console.error('PDF export error:', error);
			setExportError(t('exportPdfError'));
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<div className="bg-white rounded-md shadow p-5">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
				<div>
					<h3 className="text-base text-navy font-medium">{t('sidebarStats')}</h3>
					<p className="text-sm text-gray-500">{t('exportPdfDescription')}</p>
				</div>

				<button
					type="button"
					className="btn btn-primary"
					onClick={() => void handleExportPdf()}
					disabled={isExporting}
				>
					{isExporting ? t('exportingPdf') : t('exportPdf')}
				</button>
			</div>

			{exportError ? (
				<p className="text-sm text-red-600 mt-3">{exportError}</p>
			) : null}
		</div>
	);
}
