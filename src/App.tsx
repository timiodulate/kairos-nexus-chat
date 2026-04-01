import "./App.css";
import { UserProvider } from "./context/UserContext";

function App() {
	return (
		<UserProvider>
			<div>App</div>
		</UserProvider>
	);
}

export default App;
