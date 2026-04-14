// 토스페이먼츠 결제 승인 서버사이드 함수 (Netlify Functions)
const { createClient } = require("@supabase/supabase-js");

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

    // 결제 승인 성공 시, Supabase DB에 코인 추가 (Cloud Recharge)
    if (userId && coins) {
        try {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
            
            if (supabaseUrl && supabaseServiceRoleKey) {
                const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
                
                // 현재 코인 조회
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('coins')
                    .eq('id', userId)
                    .single();
                
                const currentCoins = profile?.coins || 0;
                
                // 코인 업데이트
                await supabase
                    .from('profiles')
                    .update({ coins: currentCoins + Number(coins) })
                    .eq('id', userId);
                    
                console.log(`Supabase Cloud Recharge Success: User ${userId}, +${coins} coins`);
            }
        } catch (supabaseError) {
            console.error('Supabase update failed:', supabaseError);
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
