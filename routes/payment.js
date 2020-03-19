var express = require("express");
var router = express.Router();
var Paymongo = require('Paymongo');

const paymongo = new Paymongo("sk_test_amdL4FT9xNotTy5YSV3LsZRS");

router.post("/", function(request, response) {
  const tokenData = {
    data: {
      attributes: {
        number: request.body.number,
        exp_month: request.body.expiry,
        exp_year: request.body.year,
        cvc: request.body.cvc
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
        response.json(res);
      })
      .catch(error => {
        const data = { error : error.message }
        response.json(data);
      });
  })
  .catch(error => {
    console.log(error);
  });
});

module.exports = router;
