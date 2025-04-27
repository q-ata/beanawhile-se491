import React, { ReactNode } from "react";
import PageWrapper from "./PageWrapper";
import Navbar from "./Navbar";
import { Flex } from "@chakra-ui/react";

const NavbarPageWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <PageWrapper>
      <Flex
        h="100%"
        w="100%"
        direction="column"
        justifyContent="flex-start"
        gap="32px"
        overflow="auto"
        paddingBottom="32px"
      >
        <Navbar />
        {children}
      </Flex>
    </PageWrapper>
  );
};

export default NavbarPageWrapper;
