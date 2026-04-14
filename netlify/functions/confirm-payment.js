// 토스페이먼츠 결제 승인 서버사이드 함수 (Netlify Functions)
const { createClerkClient } = require("@clerk/backend");

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const { paymentKey, orderId, amount, coins, userId } = JSON.parse(event.body);

    if (!paymentKey || !orderId || !amount) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: '필수 파라미터가 누락되었습니다.' }) };
    }

    // 환경 변수 확인
    const secretKey = process.env.TOSS_SECRET_KEY || "live_gsk_Z1aOwX7K8mONvDgAYlljVyQxzvNP";
    
    const encryptedKey = Buffer.from(secretKey + ':').toString('base64');

    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + encryptedKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentKey, orderId, amount }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ message: data.message || '결제 승인 실패', code: data.code }),
      };
    }

    // 결제 승인 성공 시, Clerk 유저 메타데이터에 코인 추가 (Cloud Recharge)
    if (userId && coins) {
        try {
            const clerkSecretKey = process.env.CLERK_SECRET_KEY;
            if (clerkSecretKey) {
                const clerkClient = createClerkClient({ secretKey: clerkSecretKey });
                const user = await clerkClient.users.getUser(userId);
                const currentCoins = Number(user.publicMetadata.coins || 0);
                
                await clerkClient.users.updateUserMetadata(userId, {
                    publicMetadata: {
                        coins: currentCoins + Number(coins)
                    }
                });
                console.log(`Clerk Cloud Recharge Success: User ${userId}, +${coins} coins`);
            } else {
                console.warn('CLERK_SECRET_KEY is not set. Skipping cloud recharge.');
            }
        } catch (clerkError) {
            console.error('Clerk metadata update failed:', clerkError);
            // 결제 자체는 성공했으므로 200 반환 (로컬 스토리지가 보완함)
        }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: data.status,
        orderId: data.orderId,
        method: data.method,
        totalAmount: data.totalAmount,
        approvedAt: data.approvedAt,
      }),
    };
  } catch (error) {
    console.error('Payment confirm error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: '서버 오류가 발생했습니다.' }),
    };
  }
};
