import { useEffect } from 'react';
import { useAuth } from '../AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

function UserConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (role != 'user') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    return <h1 className="text-white">This is UserConsole</h1>;
}
export default UserConsole;
