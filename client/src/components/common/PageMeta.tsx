import React from "react";
import { HelmetProvider, Helmet } from "react-helmet-async";

const PageMeta = ({
  title = "Wingz Impex",
  description = "Wingz Impex admin dashboard"
}: {
  title?: string;
  description?: string;
}) => (
  <Helmet>
    <title>{title}</title>
    <meta name="description" content={description} />
  </Helmet>
);

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;
