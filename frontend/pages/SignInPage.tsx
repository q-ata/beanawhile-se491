import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";

import PageWrapper from "../components/base/PageWrapper";
import AuthContext from "../contexts/AuthContext";
// import { login } from "../utils/client";

const SignInPage = () => {
  const params = new URLSearchParams(window.location.search);

  const [username, setUsername] = useState(
    params.get("newuser") === "true" ? params.get("username") : ""
  );
  const [password, setPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const { isAuthenticated, signin } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Redirect to="/home" />;
  }

  return (
    <PageWrapper>
      <Stack mx="auto" w="md" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">It's Beanawhile, sign in!</Heading>
          <Text fontSize="lg" color="gray.500">
            The world&apos;s tallest &#129752; plant was over 45 feet tall
          </Text>
          {params.get("newuser") === "true" ? (
            <Text fontSize="lg" color="green.500">
              Your account was created! Please log in.
            </Text>
          ) : (
            <></>
          )}
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p="32px">
          <Stack spacing="12px">
            <FormControl id="email">
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </FormControl>
            <FormControl id="password">
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormControl>
            <Text color="blue.400">Forgot password?</Text>
            <Stack py="12px">
              <Button
                bg="blue.400"
                color="white"
                _hover={{
                  bg: "blue.500",
                }}
                onClick={async () => {
                  const res = await signin(username, password);
                  if (res.ok) {
                  } else {
                    setSignupError("Invalid credentials.");
                  }
                }}
              >
                Sign in
              </Button>
              {signupError.length > 0 ? (
                <Text align="center" fontSize="md" color="red.500">
                  {signupError}
                </Text>
              ) : (
                <></>
              )}
            </Stack>
            <Text align="center">
              Haven't bean here before?{" "}
              <Link color="blue.400" href="/signup">
                Sign up
              </Link>
            </Text>
          </Stack>
        </Box>
      </Stack>
    </PageWrapper>
  );
};

export default SignInPage;
