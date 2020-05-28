const express = require("express");
const router = express.Router();
const Paymongo = require("paymongo");

// const paymongo = new Paymongo(
//   process.env.SECRET_KEY || "sk_test_amdL4FT9xNotTy5YSV3LsZRS"
// );
const paymongo = new Paymongo("sk_test_bdUouF5LnzK8kbAyuHpKtYWT");

router.post("/", async (request, response) => {

  // get the data from client side { payment_method_ID, amount, decimal }
  const { amount, decimal } = request.body;
  const totalAmount = parseInt(amount + decimal);

  try {

    // Initiate data for Payment Intents
    const payload = {
      data: {
        attributes: {
          amount: totalAmount, // 10000 or 100 in money value is the smallest allowed amount.
          currency: "PHP", // Three-letter ISO currency code. Only supports PHP for now.
          payment_method_allowed: ["card"], // The only available value for now is 'card'.
          payment_method_options: {
            card: {
              request_three_d_secure: 'automatic'
            }
          }
        }
      }
    }

    // Request for Payment Intent
    const { data: paymentIntent } = await paymongo.paymentIntents.create(payload)

    response.json(paymentIntent)
  } catch (error) {
    response.json(error)
    console.log(error)
  }
})

router.post('/:id/attach', async (req, res) => {
  const { payment_method, client_key, return_url } = req.body
  const { id } = req.params

  try {
    
    const payload = {
      data: {
        attributes: {
          payment_method,
          client_key,
          return_url
        }
      }
    }

    const { data: paymentAttach } = await paymongo.paymentIntents.attach(id, payload)

    res.json(paymentAttach)
  } catch (error) {
    res.json(error)
    console.log(error)
  }
})

module.exports = router;
