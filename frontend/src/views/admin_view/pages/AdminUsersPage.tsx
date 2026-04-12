import {useEffect, useMemo, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {MagnifyingGlassIcon} from '@heroicons/react/24/solid';
import {TrashIcon} from '@heroicons/react/24/outline';
import {type User, UserRole} from '../../../types';
import {deleteUserByAdmin, fetchUsers} from '../../../services/tickets';

function getRoleString(role: UserRole, authT: (key: string) => string, adminT: (key: string) => string): string {
	let roleString = '';

	switch (role) {
		case UserRole.CLIENT: {
			roleString = authT('client');
		} break;
		case UserRole.AGENT: {
			roleString = authT('agent');
		} break;
		case UserRole.ADMIN: {
			roleString = adminT('adminLabel');
		}
	}
	return roleString;
}

export function AdminUsers() {
	const {t: authT} = useTranslation('auth');
	const {t} = useTranslation('admin');

	const [users, setUsers] = useState<User[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
	const [searchTerm, setSearchTerm] = useState('');

	const handleDeleteUser = async (userId: number) => {
		const confirmed = window.confirm(t('deleteUserConfirm'));
		if (!confirmed) return;

		try {
			setDeletingUserId(userId);

			await deleteUserByAdmin(userId);

			setUsers((prev) => prev.filter((user) => user.id !== userId));
		} catch (e) {
			console.error(e);
			alert(t('deleteUserError'));
		} finally {
			setDeletingUserId(null);
		}
	};

	const filteredUsers = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase();
		if (!normalizedSearch) return users;

		return users.filter((user) => {
			const login = (user.login ?? '').toLowerCase();
			const email = user.email.toLowerCase();
			const role = getRoleString(user.role, authT, t).toLowerCase();

			return (
				login.includes(normalizedSearch) ||
				email.includes(normalizedSearch) ||
				role.includes(normalizedSearch)
			);
		});
	}, [authT, searchTerm, t, users]);

	useEffect(() => {
		const loadUsers = async () => {
			try {
				setLoading(true);
				const data = await fetchUsers();
				setUsers(data);
				setError(null);
			} catch (e) {
				setError(t('loadUsersError'));
			} finally {
				setLoading(false);
			}
		};

		void loadUsers();
	}, [t]);

	if (loading) {
		return <div className="p-4">{t('loadingUsers')}</div>;
	}

	if (error) {
		return <div className="p-4 text-red-600">{error}</div>;
	}

	return (
		<div>
			<label className="hidden md:flex input text-sm bg-white rounded-lg border border-gray-200 max-w-[280px]">
				<MagnifyingGlassIcon className="w-4 h-4 text-gray-600" />
				<input
					type="search"
					className="text-sm"
					value={searchTerm}
					onChange={(event) => setSearchTerm(event.target.value)}
					placeholder={t('searchUsersPlaceholder')}
				/>
			</label>

			<div className="bg-white rounded-md shadow mt-8 pt-3">
				<div className="w-full overflow-x-auto">
					<table className="min-w-[700px] w-full text-sm text-left">
						<thead className="text-gray-500 border-b">
							<tr>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('usersColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('roleColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('ticketsColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('registrationColumn')}</th>
								<th className="px-5 pb-3 font-medium whitespace-nowrap">{t('actionsColumn')}</th>
							</tr>
						</thead>

						<tbody>
							{
								filteredUsers.map((user) => (
									<tr
										key={user.id}
										className="border-b hover:bg-cream/70 transition"
									>
										<td className="px-5 py-4 text-navy whitespace-nowrap flex items-center gap-2">
											<div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
												<span className="text-base font-medium uppercase">{(user.login ?? user.email ?? 'NA').slice(0, 2)}</span>
											</div>
											<div className="flex flex-col">
												<span className="text-sm font-semibold">{user.login}</span>
												<span className="text-xs">{user.email}</span>
											</div>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											<span className="badge bg-gray-200 text-xs p-2 rounded-full">
												{getRoleString(user.role, authT, t)}
											</span>
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{user.role == UserRole.CLIENT ? (user.ticketsCreated?.length ?? 0) : '-'}
										</td>
										<td className="px-5 py-3 whitespace-nowrap">
											{user.createdAt.toLocaleDateString('fr-FR').replace(/\//g, '-')}
										</td>
										<td className="px-5 py-3 flex">
											<button
												type="button"
												onClick={() => void handleDeleteUser(user.id)}
												disabled={deletingUserId === user.id}
												className="p-2 transition hover:bg-blue-200 rounded-full disabled:opacity-50"
												aria-label={t('delete')}
											>
												{
													user.role !== UserRole.ADMIN
														? (<TrashIcon className="w-4 h-4 text-red-500" />)
														: ''
												}
											</button>
										</td>
									</tr>
								))
							}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
