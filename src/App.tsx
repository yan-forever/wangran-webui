//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import Header from "./APP/Header.tsx";
import {AuthProvider} from "./AuthContext.tsx";

function App() {
    return (
        <AuthProvider>
            <Header></Header>

        </AuthProvider>
    )
}
export default App