var express = require("express");
var router = express.Router();
var Paymongo = require('paymongo');

const paymongo = new Paymongo(process.env.SECRET_KEY || "sk_test_amdL4FT9xNotTy5YSV3LsZRS");

router.post("/", function(request, response) {
  const tokenData = { 
    data: {
      attributes: {
        billing: {
          name: request.body.name,
          email: request.body.email,
        },
        number: request.body.number,
        exp_month: parseInt(request.body.expiry),
        exp_year: parseInt(request.body.year),
        cvc: request.body.cvc,
      }
    }
  }

  paymongo
  .createToken(tokenData)
  .then(res => {
    console.log(res);
    generated_token = res.data.id;
    const amount = request.body.paymentAmount;
    const decimal = request.body.decimal;
    const strAmount = amount.toString() + decimal;
    const totalAmount = parseInt(strAmount);
  
    paymongo
      .createPayment({
        data: {
          attributes: {
            amount: totalAmount,
            currency: request.body.currency,
            description: request.body.description,
            statement_descriptor: request.body.statement_descriptor,
            source: {
              id: generated_token,
              type: 'token'
            }
          } 
        }
      })
      .then(res => {
        console.log('city', request.body.city)
        console.log('country', request.body.country)
        response.json(res);
      })
      .catch(error => {
        console.log(error);
        const data = { error : error.message }
        response.json(data);
      });
  })
  .catch(error => {
    console.log(error);
    response.json(error);
  });
});

module.exports = router;
