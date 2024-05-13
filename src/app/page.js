// pages/index.tsx
import React from "react"
import MapboxMap from "../components/Mapbox"

const Home = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <MapboxMap />
    </div>
  )
}

export default Home
