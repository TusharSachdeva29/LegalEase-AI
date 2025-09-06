"use client";

import dynamic from "next/dynamic";
import React from "react";

const WithSidebar = dynamic(
  () => import("@/components/leftsidebar").then((mod) => mod.WithSidebar),
  { ssr: false }
);

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return <WithSidebar>{children}</WithSidebar>;
}
