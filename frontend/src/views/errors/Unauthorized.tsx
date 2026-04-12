import {useNavigate} from "react-router-dom";
import TikeoLogo from "../../components/client_components/TikeoLogo";
import ContainerComp from "../../layout/layout_client/Container";

function Unauthorized() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col">
			<ContainerComp>
				<div className="py-6 flex justify-between items-center">
					<TikeoLogo href="/" color="text-navy" size="text-3xl" />
				</div>
			</ContainerComp>

			<div className="flex-1 flex items-center justify-center px-4">
				<div className="text-center space-y-4 max-w-md">
					<h1 className="text-6xl font-bold text-navy">403</h1>

					<h2 className="text-xl font-semibold text-gray-800">
						Access Denied
					</h2>

					<p className="text-gray-600">
						You don’t have permission to access this page.
						If you think this is a mistake, please contact support.
					</p>

					<div className="flex justify-center gap-3 pt-4">
						<button
							onClick={() => navigate(-1)}
							className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:border-[#355872] hover:text-[#355872] transition"
						>
							Go Back
						</button>

						<button
							onClick={() => navigate("/")}
							className="px-5 py-2 rounded-lg bg-[#355872] text-white hover:bg-[#41708f] transition"
						>
							Go Home
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Unauthorized;
