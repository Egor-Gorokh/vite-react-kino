
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const baseQuery = fetchBaseQuery({
    baseUrl: 'https://api.themoviedb.org/3/',
    prepareHeaders: (headers) => {
        headers.set('accept', 'application/json')
        headers.set('Authorization', `Bearer ${import.meta.env.VITE_API_KEY}`)
        return headers
    },
})