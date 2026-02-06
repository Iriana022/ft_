import React from 'react';

export default function SignUp() {
	return (
		<div className="flex justify-center items-center h-screen">
			<fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
				<legend className="fieldset-legend">Sign Up</legend>

				<label className="label">Email</label>
				<input type="email" className="input" placeholder="Email" />

				<label className="label">Password</label>
				<input type="password" className="input" placeholder="Password" />

				<button className="btn btn-neutral mt-4">Login</button>
			</fieldset>
		</div>
	);
}
