import { FavouriteGames, GamesStudent, NewGames, NotificationsGames, RecentlyViewedGames, WelcomeGames } from "../../../components";


const Games = () => {

    return (
        <iframe
            loading="lazy"
            className='w-full h-screen'
            src={`https://kids.poki.com/`}
            title="Games Platform"
            allow="fullscreen">

        </iframe>
    )
};

export default Games;

// <div className="grid grid-cols-12 gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit" >

{/* <div className="col-span-12 lg:col-span-8 h-fit" >
        <WelcomeGames />
    </div>

    <div className="col-span-12 h-fit" >
        <GamesStudent />
    </div> */}

// </div>
// <div className="grid grid-cols-12 gap-3 md:gap-5 w-full mb-2 md:mb-6 h-fit" >

// {/* welcome, games, New Games, Recently Viewed Games  */}
// <div className="grid grid-cols-1 gap-3 md:gap-5 col-span-12 lg:col-span-8 h-fit" >

//     {/* Welcome */}
//     <div className="col-span-1 h-fit" >
//         <WelcomeGames />
//     </div>

//     {/* Games */}
//     <div className="col-span-1 h-fit" >
//         <GamesStudent />
//     </div>

//     {/* New games & recently Viewed games */}
//     <div className="grid grid-cols-10 gap-3 md:gap-5 col-span-1 h-fit" >

//         {/* New games */}
//         <div className="col-span-10 md:col-span-4 lg:col-span-10 xl:col-span-4 h-fit" >
//             <NewGames />
//         </div>

//         {/* recently Viewed games */}
//         <div className="col-span-10 md:col-span-6 lg:row-start-1 xl:row-start-auto lg:col-span-10 xl:col-span-6 h-fit" >
//             <RecentlyViewedGames />
//         </div>

//     </div>

// </div>

// {/* notifications, favorite games  */}
// <div className="grid grid-cols-2 gap-3 md:gap-5 col-span-12 lg:col-span-4 h-fit" >

//     {/* notifications */}
//     <div className="col-span-2 sm:col-span-1 lg:col-span-2 h-fit" >
//         <NotificationsGames />
//     </div>

//     {/* favorite games */}
//     <div className="col-span-2 sm:col-span-1 lg:col-span-2 h-fit" >
//         <FavouriteGames />
//     </div>

// </div>

// </div>
