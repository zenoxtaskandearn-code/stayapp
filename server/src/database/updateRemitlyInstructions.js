import { pool } from '../config/db.js';

const updateRemitly = async () => {
  try {
    const html = `<h3 style="color: #f85030;">How to pay by Credit/Debit Card via Remitly</h3>
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>1. Download/Open the Remitly App:</strong><br />
Go to the <a href="https://apps.apple.com/us/app/remitly-send-money-transfer/id674258465" target="_blank" rel="noreferrer noopener">App Store</a> (for iPhone) or <a href="https://play.google.com/store/apps/details?id=com.remitly.androidapp&pcampaignid=web_share" target="_blank" rel="noreferrer noopener">Google Play Store</a> (for Android) and download <strong>Remitly</strong>, or visit&nbsp;<a href="https://www.remitly.com/" target="_blank" rel="noreferrer noopener">https://www.remitly.com/</a>.<br />
Log in if you already have an account, or create one if you&rsquo;re a new user.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>2. Select Destination Country (Spain):</strong><br />
Once logged in, select&nbsp;<strong>Spain</strong>&nbsp;as the country where you&rsquo;re sending money.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>3. Enter Transfer Amount (<span style="color: #f85030;">Please enter the total amount due for your booking</span>):</strong><br />
Input the total amount as the amount you want to send. Review the&nbsp;<strong>exchange rate</strong>,&nbsp;<strong>fees</strong>, and final amount in&nbsp;<strong>Euros (EUR)</strong>.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>4. Select Delivery Method:</strong><br />
Choose&nbsp;<strong>Bank Deposit</strong>&nbsp;for a direct transfer into the recipient&rsquo;s bank account.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>5. Enter Recipient&rsquo;s Bank Details:</strong><br />
<span style="color: #f85030;"><strong>Account Holder:&nbsp;</strong>Zaira Lopez PEREZ<br />
<strong>Bank Name:</strong> BBVA Bank<br />
<strong>Bank Address:</strong> C/Sauceda 28, Madrid, 28050, SPAIN<br />
<strong>IBAN:&nbsp;</strong>ES29 0182 5332 1800 0108 3292<br />
<strong>SWIFT/BIC:</strong> BBVAESMMXXX</span></p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>6. Choose Your Payment Method:</strong><br />
<strong>Google Pay (for Android)</strong>&nbsp;or&nbsp;<strong>Apple Pay (for iPhone):</strong><br />
If you&rsquo;ve set up one of these payment methods, simply select it and follow the on-screen prompts to complete the payment.<br /><br />
<strong>Debit/Credit Card:</strong><br />
If using a card, enter the&nbsp;<strong>card number</strong>,&nbsp;<strong>expiration date</strong>, and&nbsp;<strong>CVV</strong>.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>7. Review the Payment Summary:</strong><br />
Carefully review all details, including the&nbsp;<strong>recipient&rsquo;s information</strong>, the&nbsp;<strong>transfer amount</strong>, <strong>the exchange rate</strong>, and any&nbsp;<strong>fees</strong>&nbsp;applied by Remitly.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>8. Complete the Transfer:</strong><br />
Once you&rsquo;re sure everything is correct, click&nbsp;<strong>Send Money</strong>&nbsp;to finalize the transaction.</p>
<hr />
<p style="color: #222222; font-family: Arial, sans-serif; font-size: 15px;"><strong>9. Confirm Your Payment:</strong><br />
Once the payment has been completed, please send us the proof of payment by replying to this email so we can proceed with your reservation.</p>`;

    await pool.query(
      `UPDATE payment_methods SET instructions = ? WHERE name = 'Credit/Debit Card via Remitly'`,
      [html]
    );
    console.log('✅ Remitly payment instructions updated!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateRemitly();
