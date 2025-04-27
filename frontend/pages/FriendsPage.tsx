import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Heading,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  MdCheckCircle,
  MdRemoveCircle,
  MdDelete,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";

import NavbarPageWrapper from "../components/base/NavbarPageWrapper";
import Table from "../components/base/Table";
import {
  sendFriendRequest,
  viewIncomingFriendReqs,
  viewOutgoingFriendReqs,
  removeFriendRequest,
  approveFriendRequest,
  denyFriendRequest,
  viewFriends,
  removeFriend,
  viewCloseFriends,
  addCloseFriend,
  removeCloseFriend,
} from "../utils/client";

type FriendInfo = {
  name: string;
  email: string;
};

const sentRequestColumnHelper = createColumnHelper<FriendInfo>();

const incomingRequestColumnHelper = createColumnHelper<FriendInfo>();

const closeFriendColumnHelper = createColumnHelper<FriendInfo>();

const friendColumnHelper = createColumnHelper<FriendInfo>();

const FriendsPage = () => {
  const [requestEmail, setRequestEmail] = useState("");
  const [requestError, setRequestError] = useState("");

  const [sentRequestData, setSentRequestData] = useState<FriendInfo[]>([]);
  const [incomingRequestData, setIncomingRequestData] = useState<FriendInfo[]>(
    []
  );

  const [closeFriendData, setCloseFriendData] = useState<FriendInfo[]>([]);
  const [friendData, setFriendData] = useState<FriendInfo[]>([]);

  const [outgoingChange, setOutgoingChange] = useState(false);
  const [incomingChange, setIncomingChange] = useState(false);
  const [friendsChange, setFriendsChange] = useState(false);

  const sentRequestColumns = [
    sentRequestColumnHelper.accessor("name", {
      cell: (info: any) => info.getValue(),
      header: "Name",
    }),
    sentRequestColumnHelper.accessor("email", {
      cell: (info: any) => info.getValue(),
      header: "Email",
    }),
    sentRequestColumnHelper.accessor("email", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Remove request`}
          variant="ghost"
          icon={<MdDelete />}
          onClick={() => {
            removeFriendRequest(info.getValue()).then((res) => {
              if (res.ok) {
                setOutgoingChange(true);
              } else {
                // TODO: error handling
              }
            });
          }}
        />
      ),
      header: "Remove",
    }),
  ];

  const incomingRequestColumns = [
    incomingRequestColumnHelper.accessor("name", {
      cell: (info: any) => info.getValue(),
      header: "Name",
    }),
    incomingRequestColumnHelper.accessor("email", {
      cell: (info: any) => info.getValue(),
      header: "Email",
    }),
    incomingRequestColumnHelper.accessor("email", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Approve request`}
          variant="ghost"
          icon={<MdCheckCircle />}
          onClick={() => {
            approveFriendRequest(info.getValue()).then((res) => {
              if (res.ok) {
                setIncomingChange(true);
                setFriendsChange(true);
              } else {
                // TODO: error handling
              }
            });
          }}
        />
      ),
      header: "Approve",
    }),
    incomingRequestColumnHelper.accessor("email", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Deny request`}
          variant="ghost"
          icon={<MdRemoveCircle />}
          onClick={() => {
            denyFriendRequest(info.getValue()).then((res) => {
              if (res.ok) {
                setIncomingChange(true);
              } else {
                // TODO: error handling
              }
            });
          }}
        />
      ),
      header: "Deny",
    }),
  ];

  const closeFriendColumns = [
    closeFriendColumnHelper.accessor("name", {
      cell: (info: any) => info.getValue(),
      header: "Name",
    }),
    closeFriendColumnHelper.accessor("email", {
      cell: (info: any) => info.getValue(),
      header: "Email",
    }),
    closeFriendColumnHelper.accessor("email", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Make friend`}
          variant="ghost"
          icon={<MdArrowDownward />}
          onClick={() => {
            removeCloseFriend(info.getValue()).then((res) => {
              if (res.ok) {
                setFriendsChange(true);
              } else {
                // TODO: error handling
              }
            });
          }}
        />
      ),
      header: "Make friend",
    }),
  ];

  const friendColumns = [
    friendColumnHelper.accessor("name", {
      cell: (info: any) => info.getValue(),
      header: "Name",
    }),
    friendColumnHelper.accessor("email", {
      cell: (info: any) => info.getValue(),
      header: "Email",
    }),
    friendColumnHelper.accessor("email", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Make close friend`}
          variant="ghost"
          icon={<MdArrowUpward />}
          onClick={() => {
            addCloseFriend(info.getValue()).then((res) => {
              if (res.ok) {
                setFriendsChange(true);
              } else {
                // TODO: error handling
              }
            });
          }}
        />
      ),
      header: "Make close friend",
    }),
    friendColumnHelper.accessor("email", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Remove friend`}
          variant="ghost"
          icon={<MdDelete />}
          onClick={() => {
            removeFriend(info.getValue()).then((res) => {
              if (res.ok) {
                setFriendsChange(true);
              } else {
                // TODO: error handling
              }
            });
          }}
        />
      ),
      header: "Remove",
    }),
  ];

  const updateOutgoing = () => {
    viewOutgoingFriendReqs().then((res) => {
      if (res.ok) {
        setSentRequestData([...res.content]);
        setOutgoingChange(false);
      } else {
        // TODO error handling
      }
    });
  };

  const updateIncoming = () => {
    viewIncomingFriendReqs().then((res) => {
      if (res.ok) {
        setIncomingRequestData([...res.content]);
        setIncomingChange(false);
      } else {
        // TODO error handling
      }
    });
  };

  const updateFriends = () => {
    viewFriends().then((allFriendsResult) => {
      if (allFriendsResult.ok) {
        viewCloseFriends().then((closeFriendsResult) => {
          if (closeFriendsResult.ok) {
            const allFriends = [...allFriendsResult.content];
            const closeFriends = [...closeFriendsResult.content];

            const closeFriendEmails = new Set(
              closeFriends.map((friend) => friend.email)
            );
            const friends = allFriends.filter(
              (friend) => !closeFriendEmails.has(friend.email)
            );

            setFriendData(friends);
            setCloseFriendData(closeFriends);
            setFriendsChange(false);
          } else {
            // TODO error handling
          }
        });
      } else {
        // TODO error handling
      }
    });
  };

  useEffect(() => {
    if (!outgoingChange) return;
    updateOutgoing();
  }, [outgoingChange]);

  useEffect(() => {
    if (!incomingChange) return;
    updateIncoming();
  }, [incomingChange]);

  useEffect(() => {
    if (!friendsChange) return;
    updateFriends();
  }, [friendsChange]);

  useEffect(() => {
    updateOutgoing();
    updateIncoming();
    updateFriends();
  }, []);

  return (
    <NavbarPageWrapper>
      <Stack mx="auto" p="12px" spacing="32px">
        <Stack align="center" spacing="8px">
          <Heading fontSize="4xl">Friends</Heading>
          <Text fontSize="lg" color="gray.500">
            It's great &#129752; friends with these folks!
          </Text>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p="32px">
          <Stack spacing="32px">
            <Stack spacing="16px">
              <Heading fontSize="xl">Send Friend Request</Heading>
              <Stack direction="row" spacing="16px">
                <Input
                  type="email"
                  placeholder="Email"
                  onChange={(e) => {
                    setRequestEmail(e.target.value);
                  }}
                  value={requestEmail}
                />
                <Button
                  bg="blue.400"
                  color="white"
                  _hover={{
                    bg: "blue.500",
                  }}
                  disabled={requestEmail.length === 0}
                  onClick={() => {
                    sendFriendRequest(requestEmail).then((res) => {
                      if (res.ok) {
                        setRequestError("");
                        setRequestEmail("");
                        setOutgoingChange(true);
                      } else {
                        setRequestError(res.error);
                      }
                    });
                  }}
                >
                  Send
                </Button>
              </Stack>
              {requestError.length === 0 ? (
                <></>
              ) : (
                <Text color="red.500">{requestError}</Text>
              )}
            </Stack>
            <Stack spacing="16px">
              <Heading fontSize="xl">Sent Requests</Heading>
              <Table columns={sentRequestColumns} data={sentRequestData} />
            </Stack>
            <Stack spacing="16px">
              <Heading fontSize="xl">Incoming Requests</Heading>
              <Table
                columns={incomingRequestColumns}
                data={incomingRequestData}
              />
            </Stack>
            <Stack spacing="16px">
              <Heading fontSize="xl">Close Friends</Heading>
              <Table columns={closeFriendColumns} data={closeFriendData} />
            </Stack>
            <Stack spacing="16px">
              <Heading fontSize="xl">Friends</Heading>
              <Table columns={friendColumns} data={friendData} />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </NavbarPageWrapper>
  );
};

export default FriendsPage;
