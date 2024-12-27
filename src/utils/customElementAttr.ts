/**
 * 自定义设置和获取视图组件标签名
 * 通过给组件打标签来避免组件做自定义交互时，来回嵌套传组件tagName值,
 * 或者在pinia store内定义tagName
 */
import { ContainerNameEnum } from "@/enums";
const customTagNameAttr = "data-custom-name";
export const setCustomTagName = (
  el: HTMLDivElement,
  name: ContainerNameEnum | string
) => {
  el.setAttribute(customTagNameAttr, name);
};
export const getCustomTagName = (el: HTMLDivElement): string | null =>
  el.getAttribute(customTagNameAttr);
