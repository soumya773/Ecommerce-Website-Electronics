// const bodyParser = require('body-parser');

const QrPayment=async(req,res)=>{
    try{
        console.log("inside qrpayment backend")


        const { amount } = req.body;
        const upiID = 'soumyajena8@ybl'; // Replace with your UPI ID
        const upiURL = `upi://pay?pa=${upiID}&pn=Your%20Name&mc=0000&tid=000000000000&tt=10&am=${amount}&cu=INR&url=`;

        res.json({ upiURL });
        console.log(upiURL);


    }catch(err){
        res.json({
            message : err?.message || err,
            error : true,
            success : false
        })
    }

}

module.exports=QrPayment;