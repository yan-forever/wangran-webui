import { useEffect } from 'react';
import { useAuth } from '../AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

function MerchantConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (role != 'merchant') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    return <h1 className="text-white">This is MerchantConsole</h1>;
}
export default MerchantConsole;
