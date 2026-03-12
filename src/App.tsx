import './App.css';
import { AuthProvider } from './AuthContext.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Me from './Me.tsx';
import Header from './APP/Header.tsx';
import AdminConsole from './console/AdminConsole.tsx';
import MerchantConsole from './console/MerchantConsole.tsx';
import UserConsole from './console/UserConsole.tsx';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="flex flex-col bg-gray-950 min-h-screen w-full">
                    <Header />

                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/me" element={<Me />} />
                        <Route path="/console/admin" element={<AdminConsole />} />
                        <Route path="/console/merchant" element={<MerchantConsole />} />
                        <Route path="/console/user" element={<UserConsole />} />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}
function Home() {
    return <></>; //TODO 票务信息的展示
}
export default App;
