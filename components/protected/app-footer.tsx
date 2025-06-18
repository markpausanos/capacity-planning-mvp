import { getUser } from '@/actions/auth';

export default async function AppFooter() {
	try {
		const { user } = await getUser();
		return (
			<footer className="border-t bg-white px-6 py-4">
				<p className="text-sm text-gray-600">Logged in as {user.email}</p>
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
