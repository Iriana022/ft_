import {Outlet} from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';
import Separator from '../../components/client_components/Separator';

function ClientLayout() {
	return (
		<div className="min-h-screen flex flex-col">
			<Header />
			<Separator />
			<main className="flex-1">
				<Outlet />
			</main>
			<Separator />
			<Footer />
		</div>
	);
}

export default ClientLayout;
