import { EventTypeEnum } from "./event-tracking";
export interface ClickTarget {
  nodeName: string;
  className: string;
  analyticsLabel?: string;
}
export type EventTypes = Array<EventTypeEnum>;
export interface AnalyticsHistoryItem {
  meta: {
    rid: string;
    ts: number;
  };
  properties: any;
  event: EventTypes;
}
