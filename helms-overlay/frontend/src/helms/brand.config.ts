export type HelmsBrandConfig = {
  productName: string;
  productFullName: string;
  slogan: string;
  defaultLocale: "zh-CN";
  logoPath: string;
  logoMarkPath: string;
  faviconPath: string;
  docsUrl: string;
  supportEmail: string;
  attribution: string;
};

export const helmsBrandConfig: HelmsBrandConfig = {
  productName: "Helms",
  productFullName: "Helms AI数字员工工作台",
  slogan: "面向企业的AI数字员工工作台",
  defaultLocale: "zh-CN",
  logoPath: "/helms/logo.svg",
  logoMarkPath: "/helms/logo-mark.svg",
  faviconPath: "/helms/favicon.svg",
  docsUrl: "/docs",
  supportEmail: "",
  attribution:
    "Helms 基于开源项目 Clawith 进行品牌化、汉化和企业场景包装，并保留 Clawith 及第三方开源许可声明。",
};

