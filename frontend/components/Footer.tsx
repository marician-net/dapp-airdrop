'use client';
import { Flex, Text } from "@chakra-ui/react";

function Footer() {
  return (
    <Flex
        justifyContent="center"
        alignItems="center"
        p="2rem"
    >
        <Text>All rights reserved &copy; Rudy RD {new Date().getFullYear()}</Text>       

    </Flex>
  )
}

export default Footer