import {Link} from 'react-router-dom';
import ContainerComp from './layout_client/Container';
import TikeoLogo from '../components/client_components/TikeoLogo';
import {useTranslation} from 'react-i18next';

function Footer() {
	const {t} = useTranslation("nav");
	const {t: t_client} = useTranslation("client_home");

	return (
		<footer>
			<ContainerComp>
				<section className="flex flex-col md:flex-row md:justify-between py-3">
					<div className="flex gap-4 items-center md:block">
						<TikeoLogo href="/client" color="text-navy" size="text-4xl" />
						<p className="text-xs md:text-sm max-w-[500px] mt-3 text-gray-700">
							{t_client("tikeoDescriptionFooter")}.
						</p>
					</div>
					<div>
						<h3 className="text-navy font-semibold hidden md:block">
							{t_client("quickLinks")}
						</h3>
						<div className="text-xs md:text-sm flex md:flex-col justify-center md:justify-start gap-4 md:gap-1 mt-6 md:mt-3 text-gray-700 md:mt-0">
							<Link to="/client" className="transition hover:text-navy hover:underline">{t("home")}</Link>
							<Link to="/client/my_tickets" className="transition hover:text-navy hover:underline">{t("myTickets")}</Link>
							<Link to="/client/settings" className="transition hover:text-navy hover:underline">{t("settings")}</Link>
						</div>
					</div>
				</section >
			</ContainerComp >
			<ContainerComp>
				<section className="text-gray-600 text-xs flex flex-col md:flex-row items-center justify-between pb-4 gap-4">
					<div>
						<span>{t_client("copyright")} &copy; 2026 Tikeo</span>
					</div>
					<div className="flex items-center flex-col md:flex-row gap-2 md:gap-10">
						<Link to="/client" className="hover:underline">{t_client("privacyPolicy")}</Link>
						<Link to="/client" className="hover:underline">{t_client("termsOfUse")}</Link>
					</div>
				</section>
			</ContainerComp>
		</footer>
	);
}

export default Footer;
