export interface Paystub {
  id: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  payDate: string;
  pdfUrl?: string;
}
