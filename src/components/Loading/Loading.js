import React from "react";
import styled from "styled-components";
import HashLoader from "react-spinners/HashLoader";
import { css } from "@emotion/react";
function Loading() {
  return (
    <LoadingArea>
      <HashLoader color={"#ea4c89"} loading={true} css={override} size={150} />
    </LoadingArea>
  );
}
const LoadingArea = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f2d184;
`;
const override = css`
  display: block;
  margin: 0 auto;
  border-color: pink;
`;
export default Loading;
