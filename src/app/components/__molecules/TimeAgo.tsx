"use client";

import ReactTimeAgo from "react-time-ago";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

TimeAgo.addDefaultLocale(en);

type Props = {
  date: any;
};

export default function TimeAgoText({ date }: Props) {
  if (!date) return <span>Just now</span>;

  const jsDate = date?.toDate ? date.toDate() : new Date(date);

  return <ReactTimeAgo date={jsDate} locale="en-US" />;
}
