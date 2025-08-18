import React, { ReactNode } from "react";
import styled from "styled-components";
import { animated, useTransition, config } from "@react-spring/web";
import { useLocation, Location } from "react-router-dom";
import { Navbar } from "../../../components/studentComponents/GamesExtra/navbar.component";

// Styled components
const LayoutContainer = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: black;
`;

const StyledScreenContainer = styled(animated.div)`
  flex: 1;
`;

// ScreenContainer props type
interface ScreenContainerProps {
  children: ReactNode;
}

// LayoutScreen props type
interface LayoutScreenProps {
  children?: ReactNode;
  body?: ReactNode;
  hideNavbar?: boolean;
  navbar?: ReactNode;
}

// ScreenContainer component
const ScreenContainer: React.FC<ScreenContainerProps> = ({ children }) => {
  const location = useLocation();

  const transitions = useTransition<Location, { transform: string }>(location, {
    from: { transform: "translate3d(100vw, 100vw, 0)" },
    enter: { transform: "translate3d(0, 0, 0)" },
    leave: { transform: "translate3d(-100vw, -100vw, 0)" },
    config: config.stiff,
  });

  return (
    <>
      {transitions((style, item) => (
        <StyledScreenContainer key={item.key} style={style}>
          {children}
        </StyledScreenContainer>
      ))}
    </>
  );
};

// LayoutScreen component
export const LayoutScreen: React.FC<LayoutScreenProps> = ({ children, body, hideNavbar, navbar }) => {
  return (
    <LayoutContainer>
      {!hideNavbar && <Navbar>{navbar}</Navbar>}
      <ScreenContainer>{children || body}</ScreenContainer>
    </LayoutContainer>
  );
};