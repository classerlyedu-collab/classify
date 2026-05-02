import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import { useSelectedGameMode } from "../../../hooks/selected-game-mode.hook";
import { gameMode, SELECT_GAME_MODE } from "../../../store/constants";
import { LayoutScreen } from "./layout.screen";
import { NavbarGames } from "../../../components";

export const ModeSelectScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useSelectedGameMode();
  const location = useLocation();

  const handlePress = (route: string, mode: string) => {
    dispatch({ type: SELECT_GAME_MODE, payload: mode });
    navigate(route, {state:location.state});
  }

  return (
    <LayoutScreen hideNavbar>

      <div className="mt-5 px-5 flex-1" >
        <NavbarGames title="Select Mode" route="/Play_Games" />

        <div className="flex gap-2 flex-col w-3/4 m-auto p-5 justify-center items-center rounded-2xl flex-1" >
          <button
            onClick={() => handlePress('/difficulty-level', gameMode.timeLimit)}
            type="button" className="text-gray-900 focus:animate-ping bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 lg:w-1/4">Time Limit</button>

          <button
            onClick={() => handlePress('/difficulty-level', gameMode.minSwaps)}
            type="button" className="text-gray-900 focus:animate-ping bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 lg:w-1/4">Minimum Swaps</button>

        </div>
      </div>

    </LayoutScreen>
  );
};
