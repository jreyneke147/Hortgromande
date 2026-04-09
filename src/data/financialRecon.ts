export const FINANCIAL_MONTHS = [
  'Augustus',
  'September',
  'October',
  'November',
  'Desember',
  'Januarie',
] as const;

export type FinancialMonth = (typeof FINANCIAL_MONTHS)[number];

export interface FinancialReconRow {
  incomeExpense: 'Inkomste' | 'Uitgawe';
  creditor: string;
  details: string;
  amounts: Partial<Record<FinancialMonth, number>>;
  grandTotal: number;
}

export interface FinancialReconEntity {
  id: string;
  name: string;
  periodLabel: string;
  rows: FinancialReconRow[];
}

export const FINANCIAL_RECON_ENTITIES: FinancialReconEntity[] = [
  {
    id: 'mistico-trading-pty-ltd',
    name: 'Mistico Trading (Pty) Ltd',
    periodLabel: 'Augustus tot Januarie',
    rows: [
      {
        incomeExpense: 'Inkomste',
        creditor: 'SFG deposit',
        details: 'Inkomste',
        amounts: {
          Augustus: 105788.36,
          September: 1340485.65,
          October: 560000,
          November: 975000,
          Desember: 900000,
        },
        grandTotal: 3881274.01,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Lone',
        details: 'Bonus',
        amounts: { Desember: 58949.31 },
        grandTotal: 58949.31,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: '',
        details: 'Workers pay',
        amounts: {
          Augustus: 105788.36,
          September: 668145.03,
          October: 70872.26,
          November: 300398.87,
          Desember: 260078.1,
          Januarie: 51879.4,
        },
        grandTotal: 1457162.02,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: '',
        details: 'Workers pay/Vakansie verlof',
        amounts: { Desember: 187598.97 },
        grandTotal: 187598.97,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Wenkem',
        details: 'Chemikaliee',
        amounts: { September: 116950, October: 114044.5, Desember: 907784.71 },
        grandTotal: 1138779.21,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Phatshoane Henny',
        details: 'Santam Oesversekering',
        amounts: { September: 150000, November: 300000, Desember: 150000 },
        grandTotal: 600000,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Salaries',
        details: 'Salaries',
        amounts: { September: 84628.3, October: 88960.22, November: 90059.02, Desember: 90059.02 },
        grandTotal: 353706.56,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Compensation Fund',
        details: 'COIDA',
        amounts: { September: 102016.75, November: 163226.8, Desember: 81613.4 },
        grandTotal: 346856.95,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Wages',
        details: 'Workers pay',
        amounts: { October: 176099.02 },
        grandTotal: 176099.02,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Eskom',
        details: 'Electricity',
        amounts: { September: 51917.73, October: 41155.94, November: 30598.62, Desember: 30598.62 },
        grandTotal: 154270.91,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Oscar',
        details: 'Crate Hire',
        amounts: { November: 143600.65 },
        grandTotal: 143600.65,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'SSK',
        details: 'Fuel',
        amounts: { September: 38085, October: 40060, November: 39680 },
        grandTotal: 117825,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Langkloof Agri',
        details: 'Chemikaliee',
        amounts: { Desember: 111949.31 },
        grandTotal: 111949.31,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'SARS',
        details: 'PAYE',
        amounts: { September: 38184.89, November: 17828.78, Januarie: 29931.49 },
        grandTotal: 85945.16,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Rodney Potts',
        details: 'Bye korwe',
        amounts: { September: 22550, October: 33200 },
        grandTotal: 55750,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Moore',
        details: 'Bookkeeping',
        amounts: { October: 36160.34, November: 11252.75 },
        grandTotal: 47413.09,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'S Haddad',
        details: 'Parte',
        amounts: { October: 18843.6 },
        grandTotal: 18843.6,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: '',
        details: 'Parte',
        amounts: { September: 8024.51 },
        grandTotal: 8024.51,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'GEORGE MUNISIPALITEIT',
        details: 'Utility Bill',
        amounts: { November: 26159.2 },
        grandTotal: 26159.2,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Nipun Project',
        details: 'Workers',
        amounts: { September: 8465 },
        grandTotal: 8465,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Nashua',
        details: 'Printer',
        amounts: { September: 3723.7, November: 3723.7 },
        grandTotal: 7447.4,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Dr AE Van Greunen',
        details: 'Werkers Dokter',
        amounts: { November: 6720 },
        grandTotal: 6720,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'SIZA',
        details: 'Audit',
        amounts: { September: 6267.5 },
        grandTotal: 6267.5,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Oscar Motors',
        details: 'Parte/Herstelwerk',
        amounts: { September: 6090 },
        grandTotal: 6090,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Scale Solutions',
        details: 'Kalibreer Skaal',
        amounts: { September: 3578.17 },
        grandTotal: 3578.17,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Avontuur Boerevereniging',
        details: 'Ledegeld',
        amounts: { November: 3200 },
        grandTotal: 3200,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Office Solutions',
        details: 'Office Supplies',
        amounts: { November: 1828.4 },
        grandTotal: 1828.4,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Direkteurs Fooi',
        details: 'Wilfred October',
        amounts: { September: 400, November: 1343.95 },
        grandTotal: 1743.95,
      },
      {
        incomeExpense: 'Uitgawe',
        creditor: 'Vergadering Fooi',
        details: 'Wilfred October/Patrick Cornelius',
        amounts: { September: 601 },
        grandTotal: 601,
      },
    ],
  },
];
