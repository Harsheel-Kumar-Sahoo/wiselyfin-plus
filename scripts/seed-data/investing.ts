import type { SeedPath } from "./types.js";

export const investing: SeedPath = {
  slug: "investing",
  order: 2,
  icon: "TrendingUp",
  title: "Investing",
  description: "Understand SIPs, mutual funds, risk and shares, in simple words.",
  completionCoins: 75,
  lessons: [
    {
      slug: "sip-and-mutual-funds",
      order: 1,
      title: "SIPs and mutual funds",
      body: `A mutual fund collects money from many people and invests it in a mix of assets, such as shares or bonds. A professional fund manager makes the investment decisions. In India, mutual funds are regulated by SEBI, the Securities and Exchange Board of India.

A SIP, or Systematic Investment Plan, is a way to invest in a mutual fund. You choose a fixed amount, for example every month, and that amount is invested automatically on a date you pick. You can start with a small amount.

A SIP builds a habit. Because you invest regularly, you buy more units when prices are low and fewer units when prices are high. Over time this can smooth out the price you pay. It does not remove risk, and it does not guarantee profit.

Returns from mutual funds are not fixed. The value of your investment can go up and down. Before investing, read the fund's documents, check its costs and its risk level, and invest only money you will not need soon.`,
      questions: [
        {
          prompt: "What is a SIP?",
          options: [
            "A loan from a mutual fund company",
            "A fixed amount invested regularly in a mutual fund",
            "A guaranteed savings scheme from the government",
            "A type of credit card",
          ],
          correctIndex: 1,
          explanation: "A SIP means investing a fixed amount at regular intervals, such as every month.",
        },
        {
          prompt: "Which body regulates mutual funds in India?",
          options: [
            "SEBI",
            "NPCI",
            "A credit bureau",
            "The local bank branch",
          ],
          correctIndex: 0,
          explanation: "SEBI, the Securities and Exchange Board of India, regulates mutual funds.",
        },
        {
          prompt: "Which statement about mutual fund returns is correct?",
          options: [
            "They are fixed and guaranteed",
            "They can go up and down",
            "They always beat inflation every year",
            "They never change",
          ],
          correctIndex: 1,
          explanation: "Mutual fund returns are not guaranteed. The value of your investment can rise or fall.",
        },
      ],
    },
    {
      slug: "risk-and-diversification",
      order: 2,
      title: "Risk and diversification",
      body: `Every investment carries some risk. Risk means the chance that you earn less than you expected, or that you lose some of your money. In general, options that can give higher returns also carry higher risk.

Diversification means not putting all your money in one place. If you invest everything in a single company and it does badly, you lose a lot. If you spread your money across different types of investments, a problem in one place hurts you less.

Time also matters. Money you need within a year or two should not sit in risky investments, because prices can fall just when you need to withdraw. Money you will not touch for many years can usually handle more ups and downs.

Be careful with anyone who promises very high returns with no risk. Genuine investments do not offer that. Such promises are a common sign of a scam. Before you invest, ask who regulates the product and check that the seller is registered.`,
      questions: [
        {
          prompt: "What does diversification mean?",
          options: [
            "Putting all your money in one company",
            "Spreading your money across different investments",
            "Keeping all your money in cash at home",
            "Borrowing money to invest",
          ],
          correctIndex: 1,
          explanation: "Diversification spreads your money so that one bad investment hurts you less.",
        },
        {
          prompt: "Someone promises very high returns with no risk. What is the best response?",
          options: [
            "Invest quickly before the offer ends",
            "Treat it as a warning sign and check carefully",
            "Invest all your savings",
            "Share the offer with all your friends",
          ],
          correctIndex: 1,
          explanation: "No genuine investment offers high returns with no risk. Such promises are a common scam sign.",
        },
        {
          prompt: "You need your money in one year. Which is generally the better choice?",
          options: [
            "A very risky investment that can fall sharply",
            "Lending it to a stranger",
            "Putting it all in one share",
            "A safer option where the value is less likely to drop",
          ],
          correctIndex: 3,
          explanation: "Money needed soon should be kept in safer options, because risky ones can fall just when you need to withdraw.",
        },
      ],
    },
    {
      slug: "shares-and-stock-market",
      order: 3,
      title: "Shares and the stock market",
      body: `When you buy a share of a company, you own a very small part of that company. If the company grows and earns well, the value of your share may rise. If it does badly, the value may fall.

Shares are bought and sold on stock exchanges. In India, the two main exchanges are the National Stock Exchange, called NSE, and the Bombay Stock Exchange, called BSE. You need a demat account and a trading account with a registered broker to buy and sell shares.

Share prices change every day. They move because of company results, news, the economy and the mood of buyers and sellers. Short-term movements are very hard to predict, even for experts.

Investing in shares is different from gambling only if you do your homework: learn about the business, spread your money, and think in years, not days. Never borrow money to buy shares, and never invest on tips from social media or messaging groups.`,
      questions: [
        {
          prompt: "What do you own when you buy a share of a company?",
          options: [
            "A loan you gave to the company",
            "A very small part of the company",
            "A guaranteed monthly income",
            "A government bond",
          ],
          correctIndex: 1,
          explanation: "A share represents a small ownership part of a company.",
        },
        {
          prompt: "Which are the two main stock exchanges in India?",
          options: [
            "NPCI and SEBI",
            "UPI and BHIM",
            "NSE and BSE",
            "CIBIL and Equifax",
          ],
          correctIndex: 2,
          explanation: "The National Stock Exchange (NSE) and the Bombay Stock Exchange (BSE) are the two main exchanges.",
        },
        {
          prompt: "Which is a sensible habit when investing in shares?",
          options: [
            "Borrowing money to buy more shares",
            "Following tips from messaging groups",
            "Putting all your money in one share",
            "Learning about the business and thinking long term",
          ],
          correctIndex: 3,
          explanation: "Doing your own research and thinking in years helps. Borrowing and following tips raise your risk a lot.",
        },
      ],
    },
  ],
};