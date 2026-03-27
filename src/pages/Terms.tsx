import React from 'react';

export default function Terms() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <div className="prose max-w-none">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h2>1. Acceptance of Terms</h2>
                <p>Welcome. By using our service, you agree to these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
                <h2>2. Description of Service</h2>
                <p>We provide various software solutions as a Service (SaaS). We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.</p>
                <h2>3. Paddle Payment integration</h2>
                <p>Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.</p>
                <h2>4. Contact Us</h2>
                <p>If you have any questions about these Terms, please contact us at: ceo@eternalsix.com</p>
            </div>
        </div>
    );
}