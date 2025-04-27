import React, { useEffect, useState } from "react";
import { Checkbox, IconButton, Input, Text, Stack } from "@chakra-ui/react";
import { createColumnHelper } from "@tanstack/react-table";
import { MdMessage } from "react-icons/md";

import Table from "../base/Table";
import { getFriendsOverlappingTravelInfo } from "../../utils/client";
import { TravelInfo } from "../../utils/types";

const columnHelper = createColumnHelper<TravelInfo>();

const FriendsTravelTable = () => {
  const [overlappingData, setOverlappingData] = useState<TravelInfo[]>([]);
  const [filterFriend, setFilterFriend] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  useEffect(() => {
    getFriendsOverlappingTravelInfo().then((res) => {
      if (res.ok) {
        setOverlappingData(
          res.content
            .map((friend) => {
              return friend.overlap.map((overlap) => {
                const startDate = new Date(overlap.start_date);
                const endDate = new Date(overlap.end_date);

                return {
                  friend: friend.name,
                  location: overlap.location,
                  startDate: new Date(
                    startDate.getTime() + startDate.getTimezoneOffset() * 60000
                  ),
                  endDate: new Date(
                    endDate.getTime() + endDate.getTimezoneOffset() * 60000
                  ),
                  email: friend.email,
                };
              });
            })
            .reduce((a, b) => a.concat(b))
        );
      } else {
        // TODO: error handling
      }
    });
  }, []);

  const columns = [
    columnHelper.accessor("friend", {
      cell: (info: any) => info.getValue(),
      header: "Friend",
    }),
    columnHelper.accessor("location", {
      cell: (info: any) => info.getValue().name,
      header: "Location",
    }),
    columnHelper.accessor("startDate", {
      cell: (info: any) => info.getValue().toLocaleDateString(),
      header: "From",
    }),
    columnHelper.accessor("endDate", {
      cell: (info: any) => info.getValue().toLocaleDateString(),
      header: "To",
    }),
    columnHelper.accessor("friend", {
      cell: (info: any) => (
        <IconButton
          aria-label={`Contact ${info.getValue()}`}
          variant="ghost"
          icon={<MdMessage />}
          onClick={() => {
            alert("no");
          }}
        />
      ),
      header: "Contact",
    }),
  ];

  return (
    <Stack align="center" spacing="16px">
      <Stack direction="row" spacing="8px">
        <Input
          type="text"
          value={filterFriend}
          placeholder="Filter friends"
          onChange={(e) => setFilterFriend(e.target.value)}
        />
        <Input
          type="text"
          value={filterLocation}
          placeholder="Filter locations"
          onChange={(e) => setFilterLocation(e.target.value)}
        />
        <Input type="text" placeholder="Start date" />
        <Input type="text" placeholder="End date" />
      </Stack>
      <Stack direction="row" spacing="32px">
        <Stack direction="row" align="center" spacing="8px">
          <Text>Only show entries where friends will be within </Text>
          <Input w="80px" type="number" value="100" />
          <Text>km away</Text>
        </Stack>
        <Checkbox>Show all entries</Checkbox>
      </Stack>
      <Table
        columns={columns}
        data={overlappingData.filter((item) => {
          if (
            filterFriend.length > 0 &&
            !item.friend.toLowerCase().includes(filterFriend)
          )
            return false;
          if (
            filterLocation.length > 0 &&
            !item.location.name.toLowerCase().includes(filterLocation)
          )
            return false;
          return true;
        })}
      />
    </Stack>
  );
};

export default FriendsTravelTable;
