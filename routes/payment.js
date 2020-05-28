var express = require("express");
var router = express.Router();
var Paymongo = require("paymongo");

// const paymongo = new Paymongo(
//   process.env.SECRET_KEY || "sk_test_amdL4FT9xNotTy5YSV3LsZRS"
// );
const paymongo = new Paymongo("sk_test_F7QK6Qjb827V8jtFYyNqrioA");

router.post("/", async function (request, response) {
  // const expiry = request.body.expiry;
  // const expiryArray = expiry.split('/');

  // const tokenData = {
  //   data: {
  //     attributes: {
  //       billing: {
  //         name: request.body.name,
  //         email: request.body.email,
  //       },
  //       number: request.body.number,
  //       exp_month: parseInt(expiryArray[0]),
  //       exp_year: parseInt(expiryArray[1]),
  //       cvc: request.body.cvc,
  //     }
  //   }
  // }

  // paymongo
  // .createToken(tokenData)
  // .then(res => {
  //   generated_token = res.data.id;
  //   const amount = request.body.paymentAmount;
  //   const decimal = request.body.decimal;
  //   const strAmount = amount.toString() + decimal;
  //   const totalAmount = parseInt(strAmount);

  //   paymongo
  //     .createPayment({
  //       data: {
  //         attributes: {
  //           amount: totalAmount,
  //           currency: request.body.currency,
  //           description: request.body.description,
  //           statement_descriptor: request.body.statement_descriptor,
  //           source: {
  //             id: generated_token,
  //             type: 'token'
  //           }
  //         }
  //       }
  //     })
  //     .then(res => {
  //       const data = { error: false, res }
  //       response.json(data);
  //     })
  //     .catch(error => {
  //       const data = { error : error.message }
  //       response.json(data);
  //     });
  // })
  // .catch(error => {
  //   const data = { error : error.message }
  //   response.json(data);
  // });

  // get the data from client side { payment_method_ID, amount, decimal }
  const { pmID, amount, decimal } = request.body;
  const strAmount = amount.toString() + decimal;
  const totalAmount = parseInt(strAmount);

  // Initiate data for Payment Intents
  var data = {
    data: {
      attributes: {
        amount: totalAmount, // 10000 or 100 in money value is the smallest allowed amount.
        currency: "PHP", // Three-letter ISO currency code. Only supports PHP for now.
        payment_method_allowed: ["card"], // The only available value for now is 'card'.
      },
    },
  };
  try {
    // Request for Payment Intent
    const result = await paymongo.paymentIntents.create(data);
    if (result) {
      // Initiate data for payment attachment
      const paymentAttachData = {
        data: {
          attributes: {
            payment_method: pmID,
          },
        },
      };
      const paymentIntentData = result.data;
      const paymentIntentID = result.data.id;
      const resultAttach = await paymongo.paymentIntents.attach(
        paymentIntentID,
        paymentAttachData
      );
      if (resultAttach) {
        var paymentIntentAttach = resultAttach.data;

        var paymentIntentAttachStatus = paymentIntentAttach.attributes.status;

        if (paymentIntentAttachStatus === "awaiting_next_action") {
          response.json({
            data: {
              status: "warning",
              msg: "Requesting for 3ds",
              payment_intent_data: paymentIntentData,
              payment_intent_attach_data: paymentIntentAttach,
            },
          });
          // render your modal for 3D Secure Authentication since next_action has a value. You can access the next action via paymentIntent.attributes.next_action.
        } else if (paymentIntentAttachStatus === "succeeded") {
          response.json({
            data: {
              status: "success",
              msg: "Payment Received",
              payment_intent_data: paymentIntentData,
              payment_intent_attach_data: paymentIntentAttach,
            },
          });
          // You already received your customer's payment. You can show a success message from this condition.
        } else if (paymentIntentAttachStatus === "awaiting_payment_method") {
          response.json({
            data: {
              status: "error",
              msg: "There was an error",
              payment_intent_data: paymentIntentData,
              payment_intent_attach_data: paymentIntentAttach,
            },
          });
          // The PaymentIntent encountered a processing error. You can refer to paymentIntent.attributes.last_payment_error to check the error and render the appropriate error message.
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
