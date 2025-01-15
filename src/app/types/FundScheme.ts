// src/app/types/FundScheme.ts

export interface Scheme {
  Scheme_Code: number;
  ISIN_Div_Payout_ISIN_Growth: string;
  ISIN_Div_Reinvestment: string;
  Scheme_Name: string;
  Net_Asset_Value: number;
  Date: string;
  Scheme_Type: string;
  Scheme_Category: string;
  Mutual_Fund_Family: string;
}

export interface FundSchemesResponse {
  status: string;
  data: Scheme[];
}