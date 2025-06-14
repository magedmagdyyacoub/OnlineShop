const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const paypal = require("@paypal/checkout-server-sdk");
const authenticateToken = require("../middleware/auth");

// PayPal setup
const paypalClient = new paypal.core.PayPalHttpClient(
  new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

// POST /api/checkout
router.post("/", authenticateToken, async (req, res) => {
  const { items, customer, paymentMethod } = req.body;
  const { name, address, email, phone } = customer || {};
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  if (!name || !address || !email || !phone) {
    return res.status(400).json({ message: "Please provide all customer info" });
  }

  if (!paymentMethod) {
    return res.status(400).json({ message: "Payment method is required" });
  }

  try {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalAmountCents = Math.round(totalAmount * 100); // Stripe uses cents

    // STRIPE Checkout Session
    if (paymentMethod === "stripe") {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map(item => ({
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
      success_url: 'http://localhost:3000/order-success?session_id={CHECKOUT_SESSION_ID}',
        cancel_url: "http://localhost:3000/checkout",
        customer_email: email,
      });

      return res.status(200).json({ sessionUrl: session.url });
    }

    // PAYPAL
    if (paymentMethod === "paypal") {
      const request = new paypal.orders.OrdersCreateRequest();
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [{
          amount: {
            currency_code: "USD",
            value: totalAmount.toFixed(2),
          },
        }],
        application_context: {
          return_url: "http://localhost:5173/order-success",
          cancel_url: "http://localhost:5173/checkout",
        },
      });

      const order = await paypalClient.execute(request);
      const approvalUrl = order.result.links.find(link => link.rel === "approve").href;

      return res.status(200).json({ approvalUrl });
    }

    // CASH
    const orderResult = await pool.query(`
      INSERT INTO orders (user_id, name, address, email, phone, total_price, payment_method, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
    `, [
      userId,
      name,
      address,
      email,
      phone,
      totalAmount,
      "cash",
      "Pending"
    ]);

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(`
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES ($1, $2, $3, $4)
      `, [orderId, item.product_id, item.quantity, item.price]);
    }

    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return res.status(200).json({ message: "Order placed successfully (cash)!" });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ message: "Server error during checkout" });
  }
});

// routes/checkout.js (add this route below your existing POST '/')
router.post("/confirm", authenticateToken, async (req, res) => {
  const { paymentMethod, paymentId, items, customer } = req.body;
  const { name, address, email, phone } = customer || {};
  const userId = req.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }
  if (!name || !address || !email || !phone) {
    return res.status(400).json({ message: "Missing customer info" });
  }

  try {
    let paymentConfirmed = false;

    if (paymentMethod === "stripe") {
      // Verify Stripe payment status using paymentId (session ID)
      const session = await stripe.checkout.sessions.retrieve(paymentId);
      if (session.payment_status === "paid") {
        paymentConfirmed = true;
      }
    } else if (paymentMethod === "paypal") {
      // Verify PayPal order status using paymentId (order ID)
      const request = new paypal.orders.OrdersGetRequest(paymentId);
      const order = await paypalClient.execute(request);
      if (order.result.status === "COMPLETED") {
        paymentConfirmed = true;
      }
    } else {
      // For cash, paymentConfirmed is true already, but you won't call this endpoint for cash
      paymentConfirmed = true;
    }

    if (!paymentConfirmed) {
      return res.status(400).json({ message: "Payment not confirmed" });
    }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Save order in DB
    const orderResult = await pool.query(
      `INSERT INTO orders (user_id, name, address, email, phone, total_price, payment_method, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [userId, name, address, email, phone, totalAmount, paymentMethod, "Completed"]
    );
    const orderId = orderResult.rows[0].id;

    // Save order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // Clear user's cart
    await pool.query("DELETE FROM cart_items WHERE user_id = $1", [userId]);

    return res.status(200).json({ message: "Order stored successfully" });
  } catch (err) {
    console.error("Error confirming payment:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
