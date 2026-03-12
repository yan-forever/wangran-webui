import { useEffect, useState } from 'react';
import request from '../Utils/request.ts';
import { useAuth } from '../AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

function AdminConsole() {
    const [merchantPhoneNumber, setMerchantPhoneNumber] = useState<string>();
    const [approved, setApproved] = useState<string>();
    const [rejectReason, setRejectReason] = useState<string>();
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const handleReview = async () => {
        const response = await request.post('/merchants/review', {
            merchantPhoneNumber: merchantPhoneNumber,
            approved: approved,
            rejectReason: rejectReason,
        });
        console.log('merchants/review:', response);
        setMerchantPhoneNumber('');
        setApproved('');
        setApproved('');
    };
    useEffect(() => {
        if (role != 'admin') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    return (
        <div className="flex p-4">
            <div className="audit-card">
                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">商户入驻审核</h2>
                        <p className="mt-2 text-sm text-zinc-400">请核对商户信息并给出审核结论</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                商户手机号
                            </label>
                            <input
                                type="tel"
                                placeholder="请输入手机号"
                                value={merchantPhoneNumber}
                                onChange={(e) => setMerchantPhoneNumber(e.target.value)}
                                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-700 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                审核结论
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setApproved('true')}
                                    className={`py-3 rounded-xl font-bold border transition-all duration-200 ${
                                        approved === 'true'
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                            : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    通过
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setApproved('false')}
                                    className={`py-3 rounded-xl font-bold border transition-all duration-200 ${
                                        approved === 'false'
                                            ? 'bg-rose-500/10 border-rose-500 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.1)]'
                                            : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    驳回
                                </button>
                            </div>
                        </div>

                        {approved === 'false' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                    驳回原因
                                </label>
                                <textarea
                                    placeholder="若驳回，请说明理由..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full h-28 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-zinc-100 placeholder:text-zinc-700 focus:border-rose-500 outline-none transition-all resize-none"
                                />
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() => handleReview()}
                            disabled={!approved || !merchantPhoneNumber}
                            className="group relative w-full overflow-hidden rounded-xl bg-white py-4 font-black text-black transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-30"
                        >
                            确认提交审核
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminConsole;
