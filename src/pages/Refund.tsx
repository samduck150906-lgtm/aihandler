import React from 'react';

export default function Refund() {
    return (
        <div className="container mx-auto py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
            <div className="prose max-w-none">
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <h2>1. Subscription Cancellations</h2>
                <p>You may cancel your subscription at any time. Your cancellation will take effect at the end of the current paid term.</p>
                <h2>2. Refund Eligibility</h2>
                <p>Refunds are processed by our Merchant of Record, Paddle.com, and are generally provided for requests made within 14 days of the initial purchase, provided the service has not been fully consumed depending on the terms. Please note that certain digital products may not be refundable once accessed.</p>
                <h2>3. How to Request a Refund</h2>
                <p>To request a refund, please contact Paddle support or our team at ceo@eternalsix.com with your order number.</p>
            </div>
        </div>
    );
}