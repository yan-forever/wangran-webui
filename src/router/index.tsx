import { createBrowserRouter } from 'react-router-dom';
import App from '@/App.tsx';
import Home from '@/pages/Home.tsx';
import Me from '@/pages/Me.tsx';
import AdminConsole from '@/pages/AdminConsole.tsx';
import MerchantConsole from '@/pages/MerchantConsole.tsx';
import UserConsole from '@/pages/UserConsole.tsx';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/me", element: <Me /> },
            { path: "/console/admin", element: <AdminConsole /> },
            { path: "/console/merchant", element: <MerchantConsole /> },
            { path: "/console/user", element: <UserConsole /> },
        ]
    },
]);
