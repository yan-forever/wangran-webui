import './App.css';
import { AuthProvider } from './hooks/useAuth.tsx';
import { Outlet } from 'react-router-dom';
import Header from './layouts/Header.tsx';

function App() {
    return (
        <AuthProvider>
            <div className="flex flex-col bg-gray-950 min-h-screen w-full">
                <Header />
                <Outlet />
            </div>
        </AuthProvider>
    );
}

export default App;
