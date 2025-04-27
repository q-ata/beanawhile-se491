import React, { useContext, useState } from "react";
import { Redirect } from "react-router-dom";
import {
  Button,
  Box,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Stack,
  Text,
  FormErrorMessage,
  List,
  ListItem,
  ListIcon,
} from "@chakra-ui/react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdCheckCircle, MdError } from "react-icons/md";
import { useHistory } from "react-router-dom";

import PageWrapper from "../components/base/PageWrapper";
import AuthContext from "../contexts/AuthContext";
import { validateEmail } from "../utils/validators";

const isValidName = (name: string) => {
  return name.length > 0;
};

const isValidPassword = (pw: string) => {
  return [pw.length >= 8, /\w/.test(pw) && /\d/.test(pw)];
};

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [nameValid, setNameValid] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  // const [areaCode, setAreaCode] = useState(0);
  // const [phone, setPhone] = useState("");

  const [email, setEmail] = useState("");
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordValid, setPasswordValid] = useState([false, false]);

  const [signupError, setSignupError] = useState("");

  const enableSubmit =
    name.length > 0 &&
    // phone.length > 0 &&
    emailValid &&
    !passwordValid.includes(false);

  const history = useHistory();

  const { isAuthenticated, signup } = useContext(AuthContext);

  if (isAuthenticated) {
    return <Redirect to="/my-travel" />;
  }

  return (
    <PageWrapper>
      <Stack mx="auto" w="md" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">It's Beanawhile, sign up!</Heading>
          <Text fontSize="lg" color="gray.500">
            The world&apos;s tallest &#129752; plant was over 45 feet tall
          </Text>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p="32px">
          <Stack spacing="12px">
            <FormControl
              id="name"
              isRequired
              isInvalid={nameTouched && !nameValid}
            >
              <FormLabel>Name</FormLabel>
              <Input
                type="text"
                onChange={(e) => {
                  if (!nameTouched) setNameTouched(true);
                  setName(e.target.value);
                  setNameValid(isValidName(e.target.value));
                }}
              />
              <FormErrorMessage>Name cannot be empty.</FormErrorMessage>
            </FormControl>
            <FormControl
              id="email"
              isRequired
              isInvalid={emailTouched && !emailValid}
            >
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                onChange={(e) => {
                  if (!emailTouched) setEmailTouched(true);
                  setEmail(e.target.value);
                  setEmailValid(validateEmail(e.target.value));
                }}
              />
              <FormErrorMessage>Enter a valid email.</FormErrorMessage>
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordValid(isValidPassword(e.target.value));
                  }}
                />
                <InputRightElement h={"full"}>
                  <IconButton
                    aria-label={`${showPassword ? "Hide" : "Show"} password`}
                    variant={"ghost"}
                    onClick={() =>
                      setShowPassword((showPassword) => !showPassword)
                    }
                    icon={showPassword ? <FaEye /> : <FaEyeSlash />}
                  />
                </InputRightElement>
              </InputGroup>
              <List spacing={0} style={{ marginTop: "10px" }}>
                <ListItem>
                  <ListIcon
                    as={passwordValid[0] ? MdCheckCircle : MdError}
                    color={passwordValid[0] ? "green.500" : "red.500"}
                  />
                  At least 8 characters in length.
                </ListItem>
                <ListItem>
                  <ListIcon
                    as={passwordValid[1] ? MdCheckCircle : MdError}
                    color={passwordValid[1] ? "green.500" : "red.500"}
                  />
                  Contains letters and numbers.
                </ListItem>
              </List>
            </FormControl>
            <Stack pt="16px" pb="12px">
              <Button
                bg="blue.400"
                color="white"
                _hover={{
                  bg: "blue.500",
                }}
                disabled={!enableSubmit}
                onClick={async (e) => {
                  const res = await signup(
                    name,
                    // areaCode,
                    // phone,
                    email,
                    password
                  );
                  if (res.ok) {
                    // TODO: SMS/Email verification?
                    history.push(`/signin?newuser=true&username=${email}`);
                  } else {
                    setSignupError(res.error);
                  }
                }}
              >
                Sign up
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
              Bean here before?{" "}
              <Link color="blue.400" href="/signin">
                Sign in
              </Link>
            </Text>
          </Stack>
        </Box>
      </Stack>
    </PageWrapper>
  );
};

export default SignUpPage;
