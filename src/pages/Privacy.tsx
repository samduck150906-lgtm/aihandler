import React from 'react';

export default function Privacy() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <div className="prose max-w-none">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us when you create an account, subscribe to our service, or communicate with us.</p>
                <h2>2. How We Use Information</h2>
                <p>We use the information we collect to provide, maintain, and improve our services, and to process your transactions.</p>
                <h2>3. Payment Processing</h2>
                <p>We use Paddle as our Merchant of Record for payment processing. Your payment information is securely handled by Paddle and is subject to their privacy policy.</p>
                <h2>4. Contact Us</h2>
                <p>For privacy-related inquiries, please contact: ceo@eternalsix.com</p>
            </div>
        </div>
    );
}