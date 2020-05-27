var express = require("express");
var router = express.Router();
var Paymongo = require("paymongo");

const paymongo = new Paymongo(
  process.env.SECRET_KEY || "sk_test_amdL4FT9xNotTy5YSV3LsZRS"
);

router.post("/", async function (req, res) {
  //
  var data = {
    data: {
      attributes: {
        amount: 10000, // 10000 or 100 in money value is the smallest allowed amount.
        currency: "PHP", // Three-letter ISO currency code. Only supports PHP for now.
        payment_method_allowed: ["card"], // The only available value for now is 'card'.
      },
    },
  };
  const result = await paymongo.paymentIntents.create(data);
  if (result) {
    const client_key = result.data.attributes.client_key;
    res.json({
      data: {
        status: "success",
        client_key: client_key,
      },
    });
  }
});

module.exports = router;
