'use client'

import { useState } from 'react'
import Game from './components/Game'
import styles from './page.module.css'

export default function Home() {
  const [isOnline, setIsOnline] = useState(false)

  // useEffect(() => {
  //   // Check initial online status
  //   setIsOnline(navigator.onLine)

  //   // Add event listeners for online/offline status
  //   const handleOnline = () => setIsOnline(true)
  //   const handleOffline = () => setIsOnline(false)

  //   window.addEventListener('online', handleOnline)
  //   window.addEventListener('offline', handleOffline)

  //   return () => {
  //     window.removeEventListener('online', handleOnline)
  //     window.removeEventListener('offline', handleOffline)
  //   }
  // }, [])

  return (
    <main className={styles.main}>
      {!isOnline && (
        <div className={styles.offlineContainer}>
          <h1>Sorry, Membit is down :(</h1>
          <Game />
        </div>
      )}
      {isOnline && (
        <div className={styles.onlineContainer}>
          <h1>You&apos;re Online!</h1>
          <p>Go offline to play the bunny game</p>
        </div>
      )}
    </main>
  )
}
