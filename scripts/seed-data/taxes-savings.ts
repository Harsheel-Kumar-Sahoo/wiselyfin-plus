import type { SeedPath } from "./types.js";

export const taxesSavings: SeedPath = {
  slug: "taxes-and-savings",
  order: 3,
  icon: "PiggyBank",
  title: "Taxes and Savings",
  description: "Build an emergency fund, know your savings options, understand insurance and income tax basics.",
  completionCoins: 75,
  lessons: [
    {
      slug: "emergency-fund",
      order: 1,
      title: "Your emergency fund",
      body: `An emergency fund is money kept aside for sudden problems, such as a medical bill, a job loss or an urgent repair. It is not for shopping or holidays.

A common guideline is to save enough to cover a few months of your essential expenses. Many people aim for three to six months. Your own number depends on your income, your family and how stable your job is.

Keep this money where you can reach it quickly and where its value will not fall suddenly. A savings account or a liquid option works better than a risky investment, because you may need the money on short notice.

Build it slowly. Even a small amount each month adds up. When you use the fund, try to refill it. Having this cushion means you do not have to borrow at a high interest rate when trouble comes.`,
      questions: [
        {
          prompt: "What is an emergency fund for?",
          options: [
            "Buying the latest phone",
            "Sudden problems such as a medical bill or job loss",
            "Planning a holiday",
            "Paying for online shopping sales",
          ],
          correctIndex: 1,
          explanation: "It is a cushion for unexpected problems, not for planned wants.",
        },
        {
          prompt: "A common guideline for the size of an emergency fund is:",
          options: [
            "One week of expenses",
            "Three to six months of essential expenses",
            "Ten years of expenses",
            "Exactly one lakh rupees for everyone",
          ],
          correctIndex: 1,
          explanation: "Many people aim for three to six months of essential expenses, adjusted to their own situation.",
        },
        {
          prompt: "Where is the best place to keep an emergency fund?",
          options: [
            "In a very risky investment",
            "Lent to a friend",
            "Somewhere you can reach quickly and the value will not drop suddenly",
            "In a plan that locks the money for many years",
          ],
          correctIndex: 2,
          explanation: "You may need the money at short notice, so it should be easy to reach and not risky.",
        },
      ],
    },
    {
      slug: "fd-ppf-and-savings-options",
      order: 2,
      title: "Savings options: savings account, FD and PPF",
      body: `A savings account keeps your money safe and easy to withdraw. It pays a modest interest. It is a good place for money you may need soon.

A fixed deposit, or FD, is an arrangement with a bank. You deposit money for a fixed period and the bank pays interest at a rate fixed when you start. If you take the money out before the period ends, the bank may charge a penalty. Interest on an FD is taxable as income.

The Public Provident Fund, or PPF, is a long-term savings scheme backed by the Government of India. It has a long lock-in period, so it suits goals that are many years away, such as retirement. The interest rate is set by the government and can change from time to time.

Deposits in banks are covered by deposit insurance up to a limit per depositor per bank, through DICGC. Interest rates, lock-in rules and insurance limits can change, so always check the current figures on the official websites of the bank, the India Post or the Government before you decide.`,
      questions: [
        {
          prompt: "What is a fixed deposit (FD)?",
          options: [
            "Money you deposit for a fixed period at an interest rate fixed when you start",
            "A share in a company",
            "A loan from a bank",
            "A type of insurance policy",
          ],
          correctIndex: 0,
          explanation: "In an FD you deposit money for a fixed period, and the rate is fixed at the start.",
        },
        {
          prompt: "Which option has a long lock-in period and is backed by the Government of India?",
          options: [
            "A savings account",
            "A credit card",
            "A share on the NSE",
            "The Public Provident Fund (PPF)",
          ],
          correctIndex: 3,
          explanation: "PPF is a long-term government-backed scheme with a long lock-in period.",
        },
        {
          prompt: "Why should you check interest rates and rules on official sources?",
          options: [
            "They can change over time",
            "They never change",
            "Only banks need to know them",
            "They are the same for every scheme",
          ],
          correctIndex: 0,
          explanation: "Rates, lock-in rules and insurance limits can change, so use current official information.",
        },
      ],
    },
    {
      slug: "insurance-basics",
      order: 3,
      title: "Insurance basics",
      body: `Insurance protects you from a big financial loss. You pay a small amount called a premium. If the bad event happens, the insurance company pays according to the policy.

Health insurance pays for hospital costs, up to the amount you are covered for. A single serious illness can cost more than years of savings, so health cover is one of the most important protections. Read what is covered, what is not covered and any waiting periods before you buy.

Term life insurance pays money to your family, called the nominee, if you die during the policy period. It is meant for people whose family depends on their income. A pure term plan is simple and usually costs less than plans that mix insurance with investment.

Buy insurance directly or from a registered person, and tell the truth in the form. Wrong information can lead to a rejected claim. Insurance in India is regulated by IRDAI, the Insurance Regulatory and Development Authority of India.`,
      questions: [
        {
          prompt: "What is a premium?",
          options: [
            "The money the insurance company pays you after a claim",
            "The amount you pay to keep an insurance policy",
            "A tax paid on your salary",
            "The interest on a loan",
          ],
          correctIndex: 1,
          explanation: "A premium is what you pay to the insurer to keep your cover active.",
        },
        {
          prompt: "What does term life insurance do?",
          options: [
            "Pays for your hospital bills",
            "Gives you a fixed return every year",
            "Pays your family if you die during the policy period",
            "Protects your phone from damage",
          ],
          correctIndex: 2,
          explanation: "Term life insurance pays the nominee if the insured person dies during the policy term.",
        },
        {
          prompt: "Which body regulates insurance in India?",
          options: [
            "NSE",
            "IRDAI",
            "BSE",
            "TransUnion CIBIL",
          ],
          correctIndex: 1,
          explanation: "IRDAI, the Insurance Regulatory and Development Authority of India, regulates insurance.",
        },
      ],
    },
    {
      slug: "income-tax-basics",
      order: 4,
      title: "Income tax basics",
      body: `Income tax is a tax you pay to the government on your income. The more you earn, the higher the rate on the upper part of your income. These rates are called tax slabs, and the government can change them. Always check the current slabs on the official Income Tax Department website.

Your PAN, or Permanent Account Number, is your tax identity. Banks and employers use it to report your income and tax.

TDS means tax deducted at source. Your employer, or a bank paying you interest, may cut some tax before paying you and deposit it with the government. This tax is counted towards your total tax. You can see it in your Annual Information Statement and tax credit statement on the income tax portal.

Most people who earn above a certain limit must file an income tax return, called an ITR, every year. Even if your employer cut TDS, filing a return can help you claim a refund if too much tax was cut. Do not wait until the last day, because due dates and rules are announced by the department and can change.`,
      questions: [
        {
          prompt: "What is a PAN used for?",
          options: [
            "Opening a social media account",
            "Your tax identity for reporting income and tax",
            "Entering a UPI PIN",
            "Buying mutual funds only",
          ],
          correctIndex: 1,
          explanation: "PAN is your tax identity. Banks and employers use it to report your income and tax.",
        },
        {
          prompt: "What does TDS stand for?",
          options: [
            "Total Deposit Savings",
            "Tax Due Statement",
            "Tax deducted at source",
            "Transfer of Debit Slips",
          ],
          correctIndex: 2,
          explanation: "TDS is tax deducted at source, cut by the payer and deposited with the government.",
        },
        {
          prompt: "Where should you check the current tax slabs and due dates?",
          options: [
            "In a messaging group",
            "On the official Income Tax Department website",
            "In an old textbook only",
            "From any random video",
          ],
          correctIndex: 1,
          explanation: "Slabs and due dates can change, so use the official source.",
        },
      ],
    },
  ],
};