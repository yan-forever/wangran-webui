import './App.css'
import {AuthProvider} from "./AuthContext.tsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Me from "./Me.tsx";
import Header from "./APP/Header.tsx";

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="flex flex-col bg-gray-950 min-h-screen w-full">
                    <Header/>

                    <Routes>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/me" element={<Me/>}/>
                    </Routes>
                </div>
            </AuthProvider>

        </BrowserRouter>
    )
}
function Home() {
    return (
        <></>
    )//TODO 票务信息的展示
}
export default App