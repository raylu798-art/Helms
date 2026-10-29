import { helmsBrandConfig } from "./brand.config";
import { helmsTerminologyZhCN } from "./terminology.zh-CN";

export const helmsUIText = {
  appTitle: helmsBrandConfig.productFullName,
  homeWelcome: "欢迎使用 Helms AI数字员工工作台",
  homeDescription: "统一管理企业数字员工、工作区、工具、技能和自动任务。",
  emptyAgentTitle: `还没有${helmsTerminologyZhCN.agent}`,
  emptyAgentDescription: `创建第一个${helmsTerminologyZhCN.agent}，开始体验企业 AI 协作流程。`,
  chatPlaceholder: `向${helmsTerminologyZhCN.agent}描述你的任务`,
  attribution: helmsBrandConfig.attribution,
} as const;

