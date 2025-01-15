export interface Scheme {
  Scheme_Name: string;
  Net_Asset_Value: string;
  Scheme_Type: string;
  Scheme_Category: string;
}

export interface FundSchemesResponse {
  data: Scheme[];
}
