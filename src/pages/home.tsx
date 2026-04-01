import { useUser } from "../context/UserContext";

function HomePage() {
	const { username } = useUser();
	return (
		<main>
			<div>Home page</div>
			<p>Welcome, {username}!</p>
		</main>
	);
}

export default HomePage;
