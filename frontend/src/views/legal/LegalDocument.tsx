import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import ContainerComp from '../../layout/layout_client/Container';
import {getHomeRouteByRole, getStoredUserRole} from '../../services/auth';
import LanguageSelector from '../../components/client_components/LanguageSelector';

interface LegalDocumentProps {
	type: 'privacy' | 'terms';
}

const privacySections = [
	'collection',
	'usage',
	'legalBasis',
	'retention',
	'security',
	'rights',
	'transfers',
	'children',
] as const;

const termsSections = [
	'eligibility',
	'accounts',
	'acceptableUse',
	'userContent',
	'serviceAvailability',
	'intellectualProperty',
	'liability',
	'termination',
	'changes',
	'governingLaw',
] as const;

function LegalDocument(props: LegalDocumentProps) {
	const {t} = useTranslation('legal');
	const prefix = props.type === 'privacy' ? 'privacy' : 'terms';
	const sections = props.type === 'privacy' ? privacySections : termsSections;
	const homeRoute = getHomeRouteByRole(getStoredUserRole());

	return (
		<main className="min-h-screen pt-25 pb-8 md:py-12">
			<Link to={homeRoute} className="absolute top-10 left-10 inline-flex w-fit items-center rounded-md border border-gray-300 px-4 py-2 text-xs md:text-sm font-medium text-navy hover:bg-sky/25">
				{'<'} {t('shared.backToApp')}
			</Link>
			<div className="absolute top-10 right-10">
				<LanguageSelector />
			</div>
			<ContainerComp>
				<article className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 md:p-10 shadow-sm">
					<header className="border-b border-gray-200 pb-6 mb-6">
						<h1 className="text-2xl md:text-3xl font-bold text-navy">
							{t(`${prefix}.title`)}
						</h1>
						<p className="text-gray-700 text-sm md:text-base mt-3">
							{t(`${prefix}.intro`)}
						</p>
						<p className="text-xs md:text-sm text-gray-500 mt-2">
							{t('shared.lastUpdated', {date: t(`${prefix}.updatedAt`)})}
						</p>
					</header>

					<section className="space-y-6">
						{sections.map((sectionKey) => {
							const headingId = `${prefix}-${sectionKey}`;
							return (
								<section key={sectionKey} aria-labelledby={headingId}>
									<h2 id={headingId} className="text-lg md:text-xl font-semibold text-navy">
										{t(`${prefix}.sections.${sectionKey}.title`)}
									</h2>
									<p className="text-gray-700 text-sm md:text-base mt-2 leading-relaxed">
										{t(`${prefix}.sections.${sectionKey}.content`)}
									</p>
								</section>
							);
						})}
					</section>

					<footer className="border-t border-gray-200 pt-6 mt-8">
						<p className="text-gray-700 text-xs md:text-sm">
							{t(`${prefix}.contact`)}
						</p>
					</footer>
				</article>
			</ContainerComp>
		</main>
	);
}

export default LegalDocument;
