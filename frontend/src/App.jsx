import { useState } from 'react'
import UploadResume from './UploadResume'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <UploadResume/>
    </>
  )
}

export default App
