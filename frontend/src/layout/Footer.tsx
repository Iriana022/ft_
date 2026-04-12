import {Link} from 'react-router-dom';
import ContainerComp from './layout_client/Container';
import TikeoLogo from '../components/client_components/TikeoLogo';
import {useTranslation} from 'react-i18next';
import {getHomeRouteByRole, getStoredUserRole} from '../services/auth';
import {UserRole} from '../types';

interface QuickLink {
	to: string;
	label: string;
}

function Footer() {
	const {t} = useTranslation("nav");
	const {t: t_client} = useTranslation("client_home");
	const {t: t_agent} = useTranslation("agent");
	const {t: t_admin} = useTranslation("admin");

	const role = getStoredUserRole();
	const homeRoute = getHomeRouteByRole(role);

	let quickLinks: QuickLink[] = [];

	if (role === UserRole.CLIENT) {
		quickLinks = [
			{to: '/client', label: t('home')},
			{to: '/client/my_tickets', label: t('myTickets')},
			{to: '/client/settings', label: t('settings')},
		];
	} else if (role === UserRole.AGENT) {
		quickLinks = [
			{to: '/agent/dashboard', label: t_agent('sidebarDashboard')},
			{to: '/agent/tickets', label: t_agent('sidebarTickets')},
			{to: '/agent/settings', label: t_agent('sidebarSettings')},
		];
	} else if (role === UserRole.ADMIN) {
		quickLinks = [
			{to: '/admin', label: t_admin('sidebarDashboard')},
			{to: '/admin/tickets', label: t_admin('sidebarTickets')},
			{to: '/admin/users', label: t_admin('sidebarUsers')},
		];
	}

	return (
		<footer className="bg-cream">
			<ContainerComp>
				<section className="flex flex-col md:flex-row md:justify-between py-3">
					<div className="flex gap-4 items-center md:block">
						<TikeoLogo href={homeRoute} color="text-navy" size="text-4xl" />
						<p className="text-xs md:text-sm max-w-[500px] mt-3 text-gray-700">
							{t_client("tikeoDescriptionFooter")}.
						</p>
					</div>
					{quickLinks.length > 0 && (
						<div>
							<h3 className="text-navy font-semibold hidden md:block">
								{t_client("quickLinks")}
							</h3>
							<div className="text-xs md:text-sm flex md:flex-col justify-center md:justify-start gap-4 md:gap-1 mt-6 md:mt-0 text-gray-700">
								{quickLinks.map((link) => (
									<Link key={link.to} to={link.to} className="transition hover:text-navy hover:underline">
										{link.label}
									</Link>
								))}
							</div>
						</div>
					)}
				</section >
			</ContainerComp >
			<ContainerComp>
				<section className="text-gray-600 text-xs flex flex-col md:flex-row items-center justify-between pb-4 gap-4">
					<div>
						<span>{t_client("copyright")} &copy; 2026 Tikeo</span>
					</div>
					<div className="flex items-center flex-col md:flex-row gap-2 md:gap-10">
						<Link to="/privacy-policy" className="hover:underline">{t_client("privacyPolicy")}</Link>
						<Link to="/terms-of-service" className="hover:underline">{t_client("termsOfUse")}</Link>
					</div>
				</section>
			</ContainerComp>
		</footer>
	);
}

export default Footer;
