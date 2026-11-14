import type { SeedPath } from "./types.js";

export const beginner: SeedPath = {
  slug: "beginner",
  order: 1,
  icon: "Sprout",
  title: "Beginner",
  description: "Learn how money works: budgeting, inflation, safe UPI use and credit scores.",
  completionCoins: 50,
  lessons: [
    {
      slug: "budgeting-basics",
      order: 1,
      title: "Budgeting basics: where does your money go?",
      body: `A budget is a simple plan for your money. It tells you how much you expect to earn, how much you will spend, and how much you will save.

Start by writing down your monthly income. Then list your spending in two groups. Needs are things you must pay for, such as rent, groceries, electricity, transport to work and loan EMIs. Wants are things you enjoy but could live without, such as eating out, new gadgets or streaming subscriptions.

A popular guideline is the 50/30/20 rule. About 50 percent of income goes to needs, about 30 percent to wants, and about 20 percent to savings and paying off debt. This is only a starting point, not a law. If your rent is high, your numbers will look different, and that is fine.

The most useful habit is to pay yourself first. As soon as your income arrives, move your savings amount to a separate account. Spend what is left, instead of saving whatever is left over.`,
      questions: [
        {
          prompt: "What is a budget?",
          options: [
            "A bank loan with a low interest rate",
            "A plan for how you will earn, spend and save money",
            "A government tax form",
            "A list of things you want to buy",
          ],
          correctIndex: 1,
          explanation: "A budget is a plan that matches your spending and saving to your income.",
        },
        {
          prompt: "In the 50/30/20 guideline, what is the 20 percent meant for?",
          options: [
            "Eating out and entertainment",
            "Rent and groceries",
            "Savings and paying off debt",
            "Gifts for friends and family",
          ],
          correctIndex: 2,
          explanation: "The 20 percent is for savings and paying off debt. Needs are about 50 percent and wants about 30 percent.",
        },
        {
          prompt: "Which of these is a need?",
          options: [
            "Rent for your home",
            "A new video game",
            "Eating out every weekend",
            "A new phone cover",
          ],
          correctIndex: 0,
          explanation: "Rent is a need because you must pay it to have a place to live. The others are wants.",
        },
      ],
    },
    {
      slug: "what-is-inflation",
      order: 2,
      title: "What is inflation?",
      body: `Inflation means prices rise over time. A snack that cost 10 rupees some years ago may cost more today. Because of inflation, the same amount of money buys less as years pass.

This matters for savings. Suppose your money earns 4 percent a year, but prices rise 6 percent a year. Your balance grows, but what it can actually buy becomes smaller. We call this a fall in purchasing power.

To protect your money, aim for returns that are higher than inflation over the long term. Different options carry different levels of risk, and none of them is guaranteed to beat inflation every year. You will learn about some of them in the Investing path.

Inflation is not always bad news. A small, steady rise in prices is common in growing economies. The risk is for people who keep all their money idle and never let it grow.`,
      questions: [
        {
          prompt: "What does inflation mean?",
          options: [
            "Prices in general rise over time",
            "Prices in general fall over time",
            "The bank adds money to your account",
            "The government changes the currency",
          ],
          correctIndex: 0,
          explanation: "Inflation is a general rise in prices over time, so money buys less.",
        },
        {
          prompt: "Your savings earn 4 percent a year and prices rise 6 percent a year. What happens to what your money can buy?",
          options: [
            "It stays exactly the same",
            "It goes up",
            "It goes down",
            "It doubles",
          ],
          correctIndex: 2,
          explanation: "Prices grow faster than your savings, so your purchasing power falls even though your balance grows.",
        },
        {
          prompt: "Which statement is correct?",
          options: [
            "Keeping all money idle at home is the safest way to protect it from inflation",
            "Inflation only affects rich people",
            "Over the long term, it helps to aim for returns above inflation",
            "Inflation stops once you open a bank account",
          ],
          correctIndex: 2,
          explanation: "Returns above inflation protect purchasing power. Idle money loses value, and inflation affects everyone.",
        },
      ],
    },
    {
      slug: "using-upi-safely",
      order: 3,
      title: "Using UPI safely",
      body: `UPI lets you send and receive money from your phone using apps such as BHIM or the payment apps from banks and other companies. UPI was developed by the National Payments Corporation of India, called NPCI.

Your UPI PIN is a secret code. You enter it only when you send money or approve a payment. You never need to enter your PIN to receive money. If anyone tells you to enter your PIN to get a refund, a prize or a payment, it is a scam.

Never share your UPI PIN, your card details or an OTP with anyone. This includes people who say they are from your bank, from a delivery company or from customer care. Real bank staff do not ask for them.

Before you pay, check the name of the person or shop shown on your screen. Be careful with payment requests from people you do not know, and decline them. If you think you were cheated, contact your bank at once, and report it on the national cyber crime portal or by calling 1930. Check the portal to confirm the details, as they can change.`,
      questions: [
        {
          prompt: "When do you need to enter your UPI PIN?",
          options: [
            "To receive money",
            "Only when you send money or approve a payment",
            "To check the news in the app",
            "Whenever someone asks for it",
          ],
          correctIndex: 1,
          explanation: "You enter the PIN only to send money or approve a payment, never to receive money.",
        },
        {
          prompt: "A stranger says, \"Enter your UPI PIN to receive your refund.\" What should you do?",
          options: [
            "Enter the PIN quickly",
            "Share the PIN so they can send it",
            "Refuse, because this is a scam",
            "Ask them to call back tomorrow and then enter it",
          ],
          correctIndex: 2,
          explanation: "Receiving money never needs your PIN. This is a common trick to take money from your account.",
        },
        {
          prompt: "Who should you share your OTP or UPI PIN with?",
          options: [
            "Anyone who says they are from your bank",
            "A delivery person at your door",
            "A friend who asks nicely",
            "No one",
          ],
          correctIndex: 3,
          explanation: "These codes are secret. Real banks and companies never ask for them.",
        },
      ],
    },
    {
      slug: "understanding-credit-scores",
      order: 4,
      title: "Understanding credit scores",
      body: `A credit score is a number that shows how reliably you have repaid loans and credit card bills in the past. Lenders look at it to decide whether to give you a loan, and sometimes at what interest rate.

In India, credit scores are given by credit bureaus such as TransUnion CIBIL, Experian, Equifax and CRIF High Mark. Scores are commonly shown on a scale from 300 to 900. A higher score is better. Many lenders treat a score of around 750 or above as good, but each lender sets its own rules.

Three habits help most. First, always pay EMIs and credit card bills on time. Second, use only a small part of your credit card limit. Using most of your limit again and again can lower your score. Third, do not apply for many loans or cards in a short time.

You can check your own credit report from the bureaus. Look for mistakes, such as a loan you never took, and ask the bureau to correct them. Check the bureau websites for how often you can get a free report, as this can change.`,
      questions: [
        {
          prompt: "What does a credit score show?",
          options: [
            "How much money you have in the bank",
            "How reliably you have repaid loans and card bills",
            "How much tax you paid",
            "How many apps are on your phone",
          ],
          correctIndex: 1,
          explanation: "A credit score summarises your history of repaying credit.",
        },
        {
          prompt: "Which habit helps your credit score?",
          options: [
            "Paying EMIs and card bills late",
            "Using your full card limit every month",
            "Applying for many loans at once",
            "Paying EMIs and card bills on time",
          ],
          correctIndex: 3,
          explanation: "On-time payments are one of the biggest factors in a good score.",
        },
        {
          prompt: "In India, credit scores are commonly shown on which scale?",
          options: [
            "300 to 900",
            "1 to 10",
            "0 to 100",
            "1000 to 5000",
          ],
          correctIndex: 0,
          explanation: "Most Indian bureaus show scores between 300 and 900, and a higher score is better.",
        },
      ],
    },
  ],
};