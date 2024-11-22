import { useEffect, useState } from 'react'

export const useMatchMedia = (breakpoint, initialValue = false) => {
  const [isMatch, setIsMatch] = useState(initialValue)

  useEffect(() => {
    const media = window?.matchMedia(breakpoint)

    const handleChange = e => {
      setIsMatch(e.matches)
    }

    //set isMatch value on first load
    setIsMatch(media?.matches)

    //set isMatch value on change
    media.onchange = e => handleChange(e)
  }, [])

  return [isMatch]
}