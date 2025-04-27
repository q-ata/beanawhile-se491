import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

const PageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Flex h="100vh" align="center" justify="center" bg="gray.50">
      {children}
    </Flex>
  );
};

export default PageWrapper;
