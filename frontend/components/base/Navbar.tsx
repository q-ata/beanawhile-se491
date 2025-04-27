import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { Box, Flex, Heading, HStack, Button } from "@chakra-ui/react";

import AuthContext from "../../contexts/AuthContext";

const Navbar = () => {
  const history = useHistory();

  const { signout } = useContext(AuthContext);

  return (
    <Box width="100%" p="16px 32px">
      <Flex alignItems="center" justifyContent="space-between" gap="16px">
        <Button variant="ghost" onClick={() => history.push("/home")}>
          <Heading fontSize="xl">&#129752; Beanawhile</Heading>
        </Button>
        <HStack spacing="8px">
          <Button variant="ghost" onClick={() => history.push("/my-travel")}>
            My travel plans
          </Button>
          <Button
            variant="ghost"
            onClick={() => history.push("/friends-travel")}
          >
            Friends' travel plans
          </Button>
          <Button variant="ghost" onClick={() => history.push("/friends")}>
            Friends
          </Button>
          <Button variant="ghost" onClick={() => history.push("/settings")}>
            Settings
          </Button>
          <Button variant="ghost" onClick={() => signout()}>
            Sign out
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar;
