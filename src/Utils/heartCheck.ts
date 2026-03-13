import { useEffect, useState } from 'react';
import request from './requestDeal.ts';

function useHeartCheck(intervalMs = 5000) {
    const [state, setState] = useState<boolean>(true);
    useEffect(() => {
        let isMounted = true;
        const checkHealth = async () => {
            try {
                const response = await request.get(`/actuator/health`, { timeout: 3000 });
                if (isMounted) setState(true);
            } catch (error) {
                if (isMounted) {
                    setState(false);
                    console.error('后端无响应');
                }
            }
        };
        checkHealth();
        const timer = setInterval(checkHealth, intervalMs);
        return () => {
            isMounted = false;
            clearInterval(timer);
        };
    }, [state, intervalMs]);
    return state;
}
export default useHeartCheck;
