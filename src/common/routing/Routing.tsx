import {Route, Routes} from "react-router-dom";
import {PageNotFound} from "../components/PageNotFound/PageNotFound.tsx";
import {MainPage} from "../../app/ui/MainPage/MainPage.tsx";
import { Favorites} from "../components/Favorites/Favorites.tsx";
import {CategoryMovies} from "../components/CategoryMovies/CategoryMovies.tsx";
import {FilteredMovies} from "../components/FilteredMovies/FilteredMovies.tsx";

import {SearchPage} from "../components/SearchPage/SearchPage.tsx";
import {MovieDetails} from "../components/MovieDetails/MovieDetails.tsx";

export const Path = {
    Main: '/',
    CategoryMovies: '/categoryMovies',
    FilteredMovies: '/filteredMovies',
    Search: '/search',
    Favorites: '/favorites',
    NotFound: '*',
} as const

export const Routing = () => (
    <Routes>
        <Route path={Path.Main} element={<MainPage/>}/>
        <Route path={Path.CategoryMovies} element={<CategoryMovies/>}/>
        <Route path={Path.FilteredMovies} element={<FilteredMovies/>}/>
        <Route path={Path.Search} element={<SearchPage/>}/>
        <Route path={Path.Favorites} element={<Favorites/>}/>
        <Route path="/movie/:id" element={<MovieDetails />} />

        <Route path={Path.NotFound} element={<PageNotFound/>}/>

    </Routes>
)