import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage/HomePage'
import FormPage from '../pages/FormPage/FormPage'
import RespondPage from '../pages/RespondPage/RespondPage'
import ResponsesPage from '../pages/ResponsesPage/ResponsesPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/form" element={<FormPage />} />
        <Route path="/form/:id" element={<FormPage />} />
        <Route path="/form/:id/edit" element={<FormPage />} />
        <Route path="/form/:id/respond" element={<RespondPage />} />
        <Route path="/form/:id/responses" element={<ResponsesPage />} />
      </Routes>
    </BrowserRouter>
  )
}