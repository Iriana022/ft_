import {useState} from 'react';
import {ArrowLeftIcon} from '@heroicons/react/24/outline';
import Separator from './Separator';
import ContainerComp from '../../layout/layout_client/Container';
import {useNavigate} from 'react-router-dom';
import Avatar from './Avatar';
import avatar1 from '../../assets/avatars/avatar1.jpg';
import Footer from '../../layout/Footer';

function Profil() {
	const [firstname, setFirstname] = useState('Jennifer');
	const [lastname, setLastname] = useState('Lawrence');
	const [email, setEmail] = useState('dontowoman@gmail.com');
	const navigate = useNavigate();

	return (
		<div>
			<ContainerComp>
				<header className="pt-10 pb-5 flex items-center gap-6">
					{/* Go back */}
					<button onClick={() => navigate(-1)} className="cursor-pointer">
						<ArrowLeftIcon className="w-5 h-5" />
					</button>
					{/* ----- */}
					<h3 className="text-navy text-2xl font-semibold">Profile</h3>
				</header>
			</ContainerComp>
			<Separator />
			<ContainerComp>
				<div className="flex items-center flex-col md:flex-row gap-4 md:gap-8 pt-10 mb-4">
					<Avatar src={avatar1} size={24} />
					<h3 className="text-md md:text-xl">{firstname} {lastname}</h3>
				</div>
				<div className="flex justify-center md:block">
					<button className="btn btn-info">
						Changer l'avatar
					</button>
				</div>
				<h3 className="mt-8 mb-5 text-md md:text-xl font-semibold text-navy text-center md:text-start">Informations personnelles:</h3>
				<div className="flex flex-col gap-6">
					<div>
						<label className="block mb-2">Nom</label>
						<input
							type="text"
							value={firstname}
							onChange={(e) => setFirstname(e.target.value)}
							className="border px-3 py-3 rounded w-full md:w-1/3 bg-gray-100 text-sm md:text-base"
						/>
					</div>
					<div>
						<label className="block mb-2">Prenom</label>
						<input
							type="text"
							value={lastname}
							onChange={(e) => setLastname(e.target.value)}
							className="border px-3 py-3 rounded w-full md:w-1/3 bg-gray-100 text-sm md:text-base"
						/>
					</div>
					<div>
						<label className="block mb-3">Email</label>
						<input
							type="text"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="border px-3 py-3 rounded w-full md:w-1/3 bg-gray-100 text-sm md:text-base"
						/>
					</div>
				</div>
				<div className="mt-10 mb-8 flex justify-end">
					<button className="btn btn-primary">Sauvegarder</button>
				</div>
			</ContainerComp>
			<Separator />
			<Footer />
		</div>
	);
}

export default Profil;
