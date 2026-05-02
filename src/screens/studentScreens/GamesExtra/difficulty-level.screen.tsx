import { LayoutScreen } from "./layout.screen";
import { DifficultyChooser } from "../../../components/studentComponents/GamesExtra/difficulty-chooser.component";
import { NavbarGames } from "../../../components";
import { useLocation } from "react-router-dom";

export const DifficultyLevelScreen = () => {
  const location = useLocation();
  
  return (
    <LayoutScreen hideNavbar>

      <div className="mt-5 px-5 flex-1" >
        <NavbarGames title="Difficulty Level" route="/mode-select" />

        <div className="flex gap-2 flex-col w-3/4 m-auto p-5 justify-center items-center rounded-2xl flex-1" >
          <DifficultyChooser level={1} state={location.state}>
            <button
              type="button" className="text-gray-900 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 focus:animate-ping dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 lg:w-1/4">Easy</button>
          </DifficultyChooser>

          <DifficultyChooser level={2} state={location.state}>
            <button
              type="button" className="text-gray-900 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 focus:animate-ping dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 lg:w-1/4">Medium</button>
          </DifficultyChooser>

          <DifficultyChooser level={3} state={location.state}>
            <button
              type="button" className="text-gray-900 bg-gradient-to-r from-teal-400 via-teal-500 to-teal-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-lime-300 focus:animate-ping dark:focus:ring-lime-800 font-medium rounded-lg text-base px-5 py-2.5 text-center me-2 mb-2 animate-pulse hover:animate-none w-3/4 lg:w-1/4">Hard</button>
          </DifficultyChooser>

        </div>
      </div>
    </LayoutScreen >
  );
};
