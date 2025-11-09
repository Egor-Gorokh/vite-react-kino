import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQuery } from './baseQuery.ts'

export const baseApi = createApi({
    reducerPath: 'baseApi',
    tagTypes: ['Movies'],
    baseQuery: baseQuery,
    endpoints: () => ({}),
})