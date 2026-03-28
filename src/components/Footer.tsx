import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-gray-100 py-8 px-4 mt-auto">
            <div className="container mx-auto">
                <div className="flex flex-wrap justify-between items-start gap-6">
                    <div className="max-w-md">
                        <h3 className="font-bold text-lg mb-2">EternalSix</h3>
                        <p className="text-gray-600 text-sm mb-4">
                            Contact: <a href="mailto:ceo@eternalsix.com" className="text-blue-600 hover:underline">ceo@eternalsix.com</a>
                        </p>
                        
                        <p className="text-gray-500 text-xs">
                            Our order process is conducted by our online reseller Paddle.com. 
                            Paddle.com is the Merchant of Record for all our orders. 
                            Paddle provides all customer service inquiries and handles returns.
                        </p>

                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                        <a href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</a>
                        <a href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</a>
                        <a href="/refund" className="text-gray-600 hover:text-gray-900 transition-colors">Refund Policy</a>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-400 text-xs">
                    &copy; {new Date().getFullYear()} EternalSix. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
