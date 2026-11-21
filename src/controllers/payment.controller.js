import { getStripe } from "../config/stripe.js";
import { getCollections } from "../config/collections.js";
// Create Stripe Checkout Session
export const createCheckoutSession = async (req, res) => {
  try {
    const { role, email, id } = req.user;

    if (!["student", "tutor"].includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Only students and tutors can upgrade to Pro.",
      });
    }

    const amount = role === "student" ? 1000 : 1500;
    const clientURL = process.env.CLIENT_URL || "http://localhost:3000";

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      client_reference_id: id,
      metadata: {
        userId: id,
        userEmail: email,
        role,
        plan: "pro",
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${role === "student" ? "Student" : "Tutor"} Pro Plan`,
              description: "Upgrade your MentorLagbe account to Pro.",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${clientURL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientURL}/payment/cancel`,
    });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error("Create checkout session error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create checkout session.",
    });
  }
};

// Handle successful Stripe payment
export const handleStripeWebhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(503).send("Stripe webhook is not configured.");
  }

  try {
    const stripe = getStripe();

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      if (session.payment_status !== "paid") {
        return res.status(200).json({ received: true });
      }

      const { userId, userEmail, role, plan } = session.metadata;

      if (
        !userId ||
        !userEmail ||
        !["student", "tutor"].includes(role) ||
        plan !== "pro"
      ) {
        return res.status(400).send("Invalid payment metadata.");
      }

      const { users, payments } = getCollections();

      await payments.updateOne(
        { sessionId: session.id },
        {
          $setOnInsert: {
            sessionId: session.id,
            paymentIntent: session.payment_intent,
            userId,
            userEmail,
            role,
            plan,
            amount: session.amount_total,
            currency: session.currency,
            status: "paid",
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );

      await users.updateOne(
        { email: userEmail, role },
        { $set: { plan: "pro" } },
      );
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error.message);
    res.status(400).send("Webhook verification failed.");
  }
};
