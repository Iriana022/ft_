import {useRouteError, isRouteErrorResponse, useNavigate} from "react-router-dom";
import TikeoLogo from "../../components/client_components/TikeoLogo";
import ContainerComp from "../../layout/layout_client/Container";

function ErrorPage() {
	const error = useRouteError();
	const navigate = useNavigate();

	let status = 500;
	let message = "Something went wrong";

	if (isRouteErrorResponse(error)) {
		status = error.status;
		message = error.statusText;
	}

	return (
		<div className="min-h-screen flex flex-col">
			{/* Header */}
			<ContainerComp>
				<div className="py-6">
					<TikeoLogo href="/" color="text-navy" size="text-3xl" />
				</div>
			</ContainerComp>

			{/* Content */}
			<div className="flex-1 flex items-center justify-center px-4">
				<div className="text-center space-y-4">
					<h1 className="text-6xl font-bold text-navy">
						{status}
					</h1>

					<p className="text-gray-600 text-lg">
						{status === 404
							? "Page not found"
							: message}
					</p>

					<button
						onClick={() => navigate(-1)}
						className="mt-4 px-5 py-2 rounded-lg bg-[#355872] text-white hover:bg-[#41708f] transition"
					>
						Go back
					</button>
				</div>
			</div>
		</div>
	);
}

export default ErrorPage;
