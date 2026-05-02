import { pool } from '../config/db.js';

const seedPaymentMethods = async () => {
  try {
    console.log('🌱 Seeding payment methods...');

    const methods = [
      {
        name: 'Bank Transfer',
        description: 'Direct bank transfer to our account',
        instructions: `<p><strong>Bank:</strong> Example Bank</p>
          <p><strong>Account Name:</strong> The Blueground</p>
          <p><strong>Account Number:</strong> 1234567890</p>
          <p><strong>Reference:</strong> Use your Booking ID</p>`,
      },
      {
        name: 'Cash Payment',
        description: 'Pay in cash at our office',
        instructions: `<p>Cash payments can be made at our office during business hours (Mon-Fri, 9AM-5PM).</p>
          <p>Please bring your Booking ID confirmation email.</p>
          <p><strong>Office Address:</strong> 123 Main Street, Suite 100</p>`,
      },
      {
        name: 'Credit/Debit Card via Remitly',
        description: 'Send money via Remitly app or website',
        instructions: `<h3>How to pay by Credit/Debit Card via Remitly</h3>
          <p><strong>1.</strong> Download the Remitly app or visit <a href="https://www.remitly.com/">remitly.com</a></p>
          <p><strong>2.</strong> Select <strong>Spain</strong> as destination</p>
          <p><strong>3.</strong> Enter the total booking amount</p>
          <p><strong>4.</strong> Choose <strong>Bank Deposit</strong></p>
          <p><strong>5.</strong> Enter recipient details:</p>
          <p><strong>Account Holder:</strong> Zaira Lopez PEREZ<br/>
          <strong>Bank:</strong> BBVA Bank<br/>
          <strong>IBAN:</strong> ES29 0182 5332 1800 0108 3292<br/>
          <strong>SWIFT:</strong> BBVAESMMXXX</p>
          <p><strong>6.</strong> Pay via Google Pay, Apple Pay, or card</p>
          <p><strong>7.</strong> Send us the payment proof via email</p>`,
      },
      {
        name: 'Western Union',
        description: 'Send payment via Western Union',
        instructions: `<p><strong>Recipient Name:</strong> John Doe</p>
          <p><strong>Country:</strong> Spain</p>
          <p>Send the exact amount and share the MTCN number with us via email.</p>
          <p>Please include your Booking ID in the message field.</p>`,
      },
      {
        name: 'Security Deposit Method',
        description: 'Refundable security deposit via escrow',
        instructions: `<p>The security deposit is held in escrow and fully refundable at the end of your tenancy.</p>
          <p><strong>Deposit Amount:</strong> As specified in your booking</p>
          <p>The deposit will be returned within 14 days of check-out, minus any deductions for damages.</p>
          <p>Payment can be made via any of our other accepted methods.</p>`,
      },
    ];

    for (const method of methods) {
      const [result] = await pool.query(
        `INSERT INTO payment_methods (name, description, instructions, is_active)
         VALUES (?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE name=VALUES(name)`,
        [method.name, method.description, method.instructions]
      );
      console.log(`✅ Added: ${method.name}`);
    }

    console.log('✅ All payment methods seeded!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedPaymentMethods();
