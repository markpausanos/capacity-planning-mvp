import { currentUser } from '@clerk/nextjs/server';

export default async function AppFooter() {
	try {
		const user = await currentUser();
		if (!user) {
			return (
				<footer className="border-t bg-white px-6 py-4">
					<p className="text-sm text-gray-600">Not logged in</p>
				</footer>
			);
		}
		return (
			<footer className="border-t bg-white px-6 py-4">
				<p className="text-sm text-gray-600">Logged in as {user.fullName}</p>
			</footer>
		);
	} catch {
		return (
			<footer className="border-t bg-white px-6 py-4">
				<p className="text-sm text-gray-600">Not logged in</p>
			</footer>
		);
	}
}
