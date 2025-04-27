import React, { useEffect, useState } from "react";
import {
  Button,
  Box,
  Heading,
  Stack,
  Text,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel
} from "@chakra-ui/react";

import NavbarPageWrapper from "../components/base/NavbarPageWrapper";
import ContactInfo from "../components/settings/ContactInfo";
import Profile from "../components/settings/Profile";
import Preferences from "../components/settings/Preferences";

import {
  getUser,
  GetUserResponse,
  updateSettings
} from "../utils/client";

const SettingsPage = () => {
  const [user, setUser] = useState<GetUserResponse>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // TODO: We should be able to refactor the auth to re-use the response from
    // the getUser request it makes
    getUser().then((user) => {
      if (user.ok) {
        setUser(user.content!!);
      }
    });
  }, []);

  if (!user) return <></>

  return (
    <NavbarPageWrapper>
      <Stack mx="auto" w="xl" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">Settings</Heading>
          <Text fontSize="lg" color="gray.500">
            Let&apos;s make sure it&apos;s all &#129752; configured!
          </Text>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p="32px">
          <Stack spacing="12px">
            <Tabs orientation="vertical">
              <TabList>
                <Tab>Profile</Tab>
                <Tab>Preferences</Tab>
                <Tab>Contact Info</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Profile user={user} setUser={setUser} />
                </TabPanel>
                <TabPanel>
                  <Preferences user={user} setUser={setUser} />
                </TabPanel>
                <TabPanel>
                  <ContactInfo user={user} setUser={setUser} />
                </TabPanel>
              </TabPanels>
            </Tabs>

            <Button
              bg="blue.400"
              color="white"
              _hover={{
                bg: "blue.500",
              }}
              onClick={async () => {
                const res = await updateSettings(user);
                if (res.ok) {
                  setSuccess(true);
                  setError("");
                }
                else {
                  setSuccess(false);
                  setError(res.error);
                }
              }}
            >
              Update
            </Button>
            <Text textAlign="center" color="green.500" display={success ? "inline-block" : "none"}>
              Settings updated successfully!
            </Text>
            <Text textAlign="center" color="red.500" display={error.length === 0 ? "inline-block" : "none"}>
              {error}
            </Text>
          </Stack>
        </Box>
      </Stack>
    </NavbarPageWrapper>
  );
};

export default SettingsPage;
