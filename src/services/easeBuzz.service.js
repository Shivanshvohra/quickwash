const axios = require('axios');
const crypto = require('crypto');
const qs = require('qs');
require('dotenv').config();

const createPaymentSession = async ({
    orderId,
    amount,
    name,
    phone
}) => {

    const txnid = `QW_${orderId}_${Date.now()}`;

    const key = process.env.EASEBUZZ_KEY;
    const salt = process.env.EASEBUZZ_SALT;

    // mandatory according to docs
    const email = 'quickwash@example.com';

    const productinfo = `QuickWash Order ${orderId}`;

    const surl = 'http://103.185.75.124:8020/payment-success';

    const furl = 'http://103.185.75.124:8020/payment-failure';

    const hashString =
        `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

    const hash = crypto
        .createHash('sha512')
        .update(hashString)
        .digest('hex');

    const payload = {
        key,
        txnid,
        amount,
        productinfo,
        firstname: name,
        email,
        phone,
        surl,
        furl,
        hash
    };

    const response = await axios.post(
        'https://testpay.easebuzz.in/payment/initiateLink',
        qs.stringify(payload),
        {
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded'
            }
        }
    );

    console.log('EASEBUZZ RESPONSE');
    console.log(response.data);

    if(response.data.status !== 1){
        throw new Error('Failed to generate access key');
    }

    return {
        accessKey: response.data.data,
        txnid
    };
};


const createPaymentSessionpackages = async ({
    orderId,
    amount,
    name,
    phone,
    txnid
}) => {


    const key = process.env.EASEBUZZ_KEY;
    const salt = process.env.EASEBUZZ_SALT;

    // mandatory according to docs
    const email = 'quickwash@example.com';

    const productinfo = `QuickWash Package Order ${orderId}`;

    const surl = 'http://103.185.75.124:8020/payment-package';

    const furl = 'http://103.185.75.124:8020/payment-package';

    const hashString =
        `${key}|${txnid}|${amount}|${productinfo}|${name}|${email}|||||||||||${salt}`;

    const hash = crypto
        .createHash('sha512')
        .update(hashString)
        .digest('hex');

    const payload = {
        key,
        txnid,
        amount,
        productinfo,
        firstname: name,
        email,
        phone,
        surl,
        furl,
        hash
    };

    const response = await axios.post(
        'https://testpay.easebuzz.in/payment/initiateLink',
        qs.stringify(payload),
        {
            headers: {
                'Content-Type':
                    'application/x-www-form-urlencoded'
            }
        }
    );

    console.log('EASEBUZZ RESPONSE');
    console.log(response.data);

    if(response.data.status !== 1){
        throw new Error('Failed to generate access key');
    }

    return {
        accessKey: response.data.data,
        txnid
    };
};

module.exports={
    createPaymentSession,
    createPaymentSessionpackages
}