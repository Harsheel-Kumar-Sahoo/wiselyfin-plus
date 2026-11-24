import type { SeedPath } from "./types.js";

export const scamAwareness: SeedPath = {
  slug: "scam-awareness",
  order: 4,
  icon: "ShieldAlert",
  title: "Scam Awareness",
  description: "Learn to spot and avoid UPI fraud, phishing, fake loan apps and KYC scams.",
  completionCoins: 75,
  lessons: [
    {
      slug: "upi-fraud",
      order: 1,
      title: "UPI fraud: how it works and how to stop it",
      body: `UPI fraud usually works by tricking you into approving a payment yourself. The fraudster does not need to break into anything. They only need you to enter your PIN.

A common trick is the collect request. A stranger sends a payment request, and a message tells you to approve it to receive money. Remember: you never enter your PIN to receive money. If a screen asks for your PIN, you are sending money.

Another trick is a fake refund or a fake buyer. Someone says they will pay you for an item you listed, and asks you to scan a QR code or approve a request. Scanning a QR code is also only for paying, not for receiving.

Protect yourself with simple habits. Read every screen before you enter your PIN, check the name and the amount, decline requests from people you do not know, and never share your PIN or OTP. If money is lost, call your bank at once and report it on the national cyber crime portal or the helpline 1930. Check the official portal for current details, as they can change.`,
      questions: [
        {
          prompt: "A stranger says, \"Scan this QR code to receive your payment.\" What should you do?",
          options: [
            "Scan it quickly so you do not miss the payment",
            "Refuse, because scanning a QR code is used to pay, not to receive",
            "Share the QR code with a friend",
            "Enter your PIN to confirm",
          ],
          correctIndex: 1,
          explanation: "Receiving money never needs a QR scan or a PIN from you. This is a common trick to take your money.",
        },
        {
          prompt: "When a screen asks for your UPI PIN, what is usually happening?",
          options: [
            "You are receiving money",
            "You are sending money",
            "Your account is being checked for free",
            "Nothing important",
          ],
          correctIndex: 1,
          explanation: "The PIN is asked only when money is leaving your account.",
        },
        {
          prompt: "You think you were cheated through UPI. What is the best first step?",
          options: [
            "Wait a week to see what happens",
            "Contact your bank at once and report the fraud",
            "Send more money to get the first amount back",
            "Delete the app",
          ],
          correctIndex: 1,
          explanation: "Acting fast gives the best chance of stopping the payment. Contact your bank and report it officially.",
        },
      ],
    },
    {
      slug: "phishing-links-and-messages",
      order: 2,
      title: "Phishing: fake messages, calls and links",
      body: `Phishing means pretending to be a trusted company to steal your details. The message may look like it is from your bank, a courier, a government office or a well-known shop.

Warning signs include urgency, such as your account will be blocked today, a link that does not match the real website, spelling mistakes, and requests for your PIN, OTP, password or card details. Real banks do not ask for these by phone, message or email.

Do not click links in unexpected messages. Instead, open the official app or type the website address yourself. Check the address carefully, because fake sites often copy a real name with small changes.

If you already clicked or shared something, act fast. Contact your bank, change your passwords, and report the message. Do not feel ashamed: these messages are designed to fool careful people too.`,
      questions: [
        {
          prompt: "Which is a warning sign of a phishing message?",
          options: [
            "It uses your full name only",
            "It creates urgency, such as saying your account will be blocked today",
            "It arrives during the day",
            "It has no links",
          ],
          correctIndex: 1,
          explanation: "Fraudsters create urgency so that you act before you think.",
        },
        {
          prompt: "A message from your \"bank\" has a link. What is the safest action?",
          options: [
            "Click it and log in",
            "Open the bank's official app or type its website address yourself",
            "Forward it to friends",
            "Reply with your OTP",
          ],
          correctIndex: 1,
          explanation: "Go to the official app or site directly, never through a link in an unexpected message.",
        },
        {
          prompt: "Will a real bank ask for your OTP or PIN by phone or message?",
          options: [
            "Yes, to verify you",
            "Yes, but only on weekends",
            "No, never",
            "Only if you call them first",
          ],
          correctIndex: 2,
          explanation: "Real banks never ask for your PIN or OTP. Anyone who asks is a fraudster.",
        },
      ],
    },
    {
      slug: "fake-loan-apps",
      order: 3,
      title: "Fake loan apps",
      body: `Some loan apps promise instant money with no checks. Many are illegal or cruel. They may charge huge hidden fees, take much more than you borrowed, or threaten you.

A fake loan app often asks for permission to read your contacts, photos and messages. Later, it may send shame messages to your contacts to force you to pay. Giving these permissions is a major warning sign.

Before taking a loan, check that the lender is a registered bank or a registered non-banking finance company. The Reserve Bank of India, called RBI, publishes lists of registered lenders on its website. Check the current list there. Read the interest rate, all fees and the repayment terms before you accept.

Never pay a fee in advance to get a loan. If an app threatens you or your contacts, do not give in. Keep screenshots and report it to the cyber crime portal or the helpline 1930, and tell someone you trust.`,
      questions: [
        {
          prompt: "A loan app asks to read your contacts and photos. What does this suggest?",
          options: [
            "It is a normal part of every loan",
            "It is a warning sign of a risky or fake app",
            "It will lower your interest rate",
            "It is required by law",
          ],
          correctIndex: 1,
          explanation: "Such permissions are used to pressure borrowers. Do not allow them.",
        },
        {
          prompt: "How can you check whether a lender is genuine?",
          options: [
            "Trust the app store rating alone",
            "Check that it is a registered lender on the RBI website",
            "Ask the app itself",
            "Look at how fast it gives money",
          ],
          correctIndex: 1,
          explanation: "RBI publishes registered lenders. Check the current list on its official website.",
        },
        {
          prompt: "A lender asks for a fee before giving you a loan. What should you do?",
          options: [
            "Pay it, because it is normal",
            "Treat it as a scam sign and do not pay",
            "Pay half now and half later",
            "Ask a friend to pay",
          ],
          correctIndex: 1,
          explanation: "Genuine lenders do not demand advance fees to release a loan.",
        },
      ],
    },
    {
      slug: "kyc-scams",
      order: 4,
      title: "KYC scams",
      body: `KYC means Know Your Customer. Banks and wallets do ask you to keep your details updated. Fraudsters use this fact to scare you.

In a KYC scam, you get a message or call saying your account will be frozen unless you update your KYC right now. It asks you to click a link, install an app, or share an OTP. The app may let the fraudster see your screen and your messages.

Do not install apps or click links sent by unknown people. Do not share OTPs, PINs, Aadhaar or PAN details in reply to unexpected messages. If you are unsure, visit your bank branch or use the official app, and ask them directly.

Remember the rule: a real update will not demand an OTP or PIN, and will not rush you.`,
      questions: [
        {
          prompt: "A message says your account will be frozen unless you update KYC through a link. What should you do?",
          options: [
            "Click the link at once",
            "Ignore the link and check with your bank through its official app or branch",
            "Send your OTP to the number",
            "Install the app it suggests",
          ],
          correctIndex: 1,
          explanation: "Real updates are done in the official app or at the branch, not through rushed links.",
        },
        {
          prompt: "Why is installing an app sent by a stranger risky?",
          options: [
            "It uses mobile data",
            "It may let the fraudster see your screen and messages",
            "It changes your wallpaper",
            "It is always slow",
          ],
          correctIndex: 1,
          explanation: "Some apps give remote access, so the fraudster can see your OTPs and bank apps.",
        },
        {
          prompt: "Which is a safe way to deal with a KYC request you are unsure about?",
          options: [
            "Reply with your Aadhaar number",
            "Visit the branch or use the official app and ask directly",
            "Share your PAN in a message",
            "Wait for them to call again",
          ],
          correctIndex: 1,
          explanation: "Always verify through the official channel you already trust.",
        },
      ],
    },
  ],
};