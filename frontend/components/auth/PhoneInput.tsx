import React, { useState, useEffect } from "react";

import {
  Input,
  InputGroup,
  Stack,
  Text,
  InputLeftAddon,
  Select,
  Flex,
} from "@chakra-ui/react";

import { COUNTRY_CODES } from "../../utils/constants";

class AreaCode {
  code: string;
  country: string;
  flag: string;

  constructor(code: string, country: string, flag: string) {
    this.code = code;
    this.country = country;
    this.flag = flag;
  }
}

const AREA_CODES = new Map<number, AreaCode>(
  COUNTRY_CODES.map((c, i) => [i, new AreaCode(c.code, c.country, c.flag)])
);

const PhoneInput = ({
  setAreaCode,
  setPhone,
}: {
  setAreaCode: (a: number) => void;
  setPhone: (a: string) => void;
}) => {
  const [_areaCode, _setAreaCode] = useState(0);
  const [_phone, _setPhone] = useState("");

  useEffect(() => {
    setAreaCode(_areaCode);
  }, [_areaCode]);
  useEffect(() => {
    setPhone(_phone);
  }, [_phone]);

  const ac = AREA_CODES.get(_areaCode)!;

  return (
    <Stack direction="row" spacing="2px">
      <InputGroup width="70px">
        <Select
          top="10px"
          left="0"
          zIndex={1}
          bottom={0}
          opacity={0}
          height="100%"
          position="absolute"
          onChange={(e) => _setAreaCode(parseInt(e.target.value))}
        >
          {Array.from(AREA_CODES).map((val) => {
            return (
              <option
                value={val[0]}
              >{`${val[1].country} +${val[1].code}`}</option>
            );
          })}
        </Select>
        <Flex pl={2} width="100%" alignItems="center">
          <Text fontSize="lg">{ac.flag}</Text>
        </Flex>
      </InputGroup>
      <InputGroup>
        <InputLeftAddon pointerEvents="none" children={`+${ac.code}`} />
        <Input
          type="tel"
          value={_phone}
          onChange={(e) => {
            if (e.target.value.length === 0 || /\d/.test(e.target.value)) {
              _setPhone(e.target.value);
            }
          }}
        />
      </InputGroup>
    </Stack>
  );
};

export default PhoneInput;
