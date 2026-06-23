"use client"

import { createApi, BaseQueryFn } from "@reduxjs/toolkit/query/react"
import { apiFetch } from "@/lib/api"
import { Assignment } from "../slices/studentSlice"

const customBaseQuery: BaseQueryFn<
  { url: string; method?: string; body?: any; headers?: any },
  unknown,
  unknown
> = async ({ url, method = "GET", body, headers }) => {
  try {
    const result = await apiFetch(url, {
      method,
      body: body ? JSON.stringify(body) : undefined,
      headers,
    })
    return { data: result }
  } catch (error: any) {
    return { 
      error: { 
        status: error.status || 500, 
        data: error.message || "An unexpected error occurred" 
      } 
    }
  }
}

export const studentApi = createApi({
  reducerPath: "studentApi",
  baseQuery: customBaseQuery,
  tagTypes: ["Homework"],
  endpoints: (builder) => ({
    getHomework: builder.query<Assignment[], void>({
      query: () => ({ url: "/academics/assignments" }),
      providesTags: ["Homework"],
    }),
  }),
})

export const { useGetHomeworkQuery } = studentApi
