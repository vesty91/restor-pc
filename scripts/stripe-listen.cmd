@echo off
REM Lance le relay webhook Stripe vers le site local (events Vague 1).
REM Garder cette fenetre ouverte pendant les tests boutique.
cd /d "%~dp0.."
for /f "usebackq tokens=1,* delims==" %%A in (`findstr /B "STRIPE_SECRET_KEY=" .env.local`) do set STRIPE_API_KEY=%%B
echo Forwarding Stripe webhooks -^> http://localhost:3000/api/stripe/webhook
echo Events: checkout.session.* / charge.refunded / charge.dispute.*
stripe listen --api-key %STRIPE_API_KEY% --forward-to localhost:3000/api/stripe/webhook --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,charge.refunded,charge.dispute.created,charge.dispute.closed
