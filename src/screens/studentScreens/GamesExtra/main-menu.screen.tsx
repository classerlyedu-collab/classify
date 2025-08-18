import styled from "styled-components";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../../../components/studentComponents/GamesExtra/button.component";
import { LayoutScreen } from "./layout.screen";
import { NavbarGames } from "../../../components";
import { RouteName } from "../../../routes/RouteNames";

const Container = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1em;
  background: black
`;

export const StyledButton = styled(Button)`
  min-width: 10em;
`;

export const BodyContent = () => {

  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <Container>
      <div className="mt-5 px-5 w-full h-full" >

        <NavbarGames title="Games" route={RouteName.GAMES} />

        <div className="flex flex-col w-3/4 m-auto p-5 justify-center items-center rounded-2xl flex-1" >
          <button
            onClick={() => navigate('/mode-select', {state:location.state})}
            type="button" className="text-gray-900 bg-gradient-to-r from-lime-200 via-lime-400 to-lime-500 hover:shadow-2xl hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 md:w-32">Lets Play</button>


          {/* <StyledButton>Settings</StyledButton> */}
        </div>
      </div>
    </Container>
  );
};

export const MainMenuScreen = () => {
  return <LayoutScreen hideNavbar body={<BodyContent />} />;
};
