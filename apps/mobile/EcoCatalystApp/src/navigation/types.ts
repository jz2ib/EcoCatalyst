export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Scanner: undefined;
  ScannerMain: undefined;
  Footprint: undefined;
  FootprintMain: undefined;
  FootprintAnalytics: undefined;
  GoalSetting: undefined;
  Diet: undefined;
  Profile: undefined;
  AlternativeProducts: { productId: string; productName: string };
  AlternativeDetails: { alternativeId: string; originalProductId: string; alternative: any };
};
