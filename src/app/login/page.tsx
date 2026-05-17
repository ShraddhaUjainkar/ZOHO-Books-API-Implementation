import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#f6f7f2] font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-[#d9dfd1] overflow-hidden">
                <div className="bg-[#173f35] p-8 text-center flex flex-col items-center">
                    <div className="grid w-14 h-14 mb-4 place-items-center rounded-xl text-[#173f35] bg-[#d8f275] font-extrabold text-xl shadow-md">
                        ZB
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome</h1>
                    <p className="text-[#b9cbc5] text-sm">Sign in to your Zoho Books workspace</p>
                </div>

                <div className="p-8 flex flex-col items-center justify-center min-h-[200px]">
                    <a 
                        href="/api/auth/zoho"
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-[#173f35] hover:bg-[#113028] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg group"
                    >
                        <span className="grid w-6 h-6 place-items-center rounded bg-[#d8f275] text-[#173f35] font-extrabold text-[10px]">ZB</span>
                        Connect to Zoho Books
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform ml-2" />
                    </a>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Authentication is required to sync data with Zoho.
                    </div>
                </div>
            </div>
        </main>
    );
}
