import {Outlet} from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function ClientLayout() {
	return (
		<>
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
		</>
	);
}

export default ClientLayout;
