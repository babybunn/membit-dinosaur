'use client'
import { useEffect, useRef, useState } from 'react'

export default function DinoGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationIdRef = useRef<number | null>(null)

  const [gameOver, setGameOver] = useState(false)
  // const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)

  // Game constants
  const gravity = 0.6
  const jumpStrength = 12
  const groundHeight = 100

  // Dino state
  const dino = useRef({
    x: 50,
    y: 0,
    width: 40,
    height: 40,
    velocityY: 0,
    onGround: true,
  })

  // Obstacles stored in ref (mutable)
  const obstacles = useRef<Array<{ x: number; y: number; width: number; height: number }>>([])
  const frame = useRef(0)
  const speed = useRef(6)

  // Create and load babybun image
  const babybunImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.src = '/membit.png'
    img.onload = () => {
      babybunImageRef.current = img
    }
  }, [])

  // Jump handler
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp') && dino.current.onGround && !gameOver) {
      dino.current.velocityY = -jumpStrength
      dino.current.onGround = false
    }
    if (e.code === 'Enter' && gameOver) {
      restartGame()
    }
  }

  const restartGame = () => {
    setGameOver(false)
    setScore(0)
    obstacles.current = [] // ✅ clear obstacles
    frame.current = 0
    speed.current = 6
    dino.current.y = canvasRef.current!.height - groundHeight - dino.current.height

    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current) // ✅ stop old loop if still running
    }
    gameLoop() // ✅ start fresh loop
  }

  // Main game loop
  const gameLoop = () => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    frame.current++

    // Draw ground
    ctx.fillStyle = '#888'
    ctx.fillRect(0, canvas.height - groundHeight, canvas.width, groundHeight)

    // Update dino
    dino.current.velocityY += gravity
    dino.current.y += dino.current.velocityY
    if (dino.current.y >= canvas.height - groundHeight - dino.current.height) {
      dino.current.y = canvas.height - groundHeight - dino.current.height
      dino.current.velocityY = 0
      dino.current.onGround = true
    }
    // Draw babybun
    if (babybunImageRef.current) {
      ctx.drawImage(
        babybunImageRef.current,
        dino.current.x,
        dino.current.y,
        dino.current.width,
        dino.current.height
      )
    } else {
      // Fallback to black rectangle if image not loaded
      ctx.fillStyle = 'black'
      ctx.fillRect(dino.current.x, dino.current.y, dino.current.width, dino.current.height)
    }

    // Spawn obstacles
    if (frame.current % 120 === 0) {
      const height = 40
      obstacles.current.push({
        x: canvas.width,
        y: canvas.height - groundHeight - height,
        width: 20,
        height,
      })
    }

    // if (gameOver) {
    //   console.log('GameOver')
    //   return
    // }

    // Update obstacles
    for (let i = 0; i < obstacles.current.length; i++) {
      const obstacle = obstacles.current[i]
      obstacle.x -= speed.current
      ctx.fillStyle = 'green'
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

      // Collision check
      if (
        dino.current.x < obstacle.x + obstacle.width &&
        dino.current.x + dino.current.width > obstacle.x &&
        dino.current.y < obstacle.y + obstacle.height &&
        dino.current.y + dino.current.height > obstacle.y
      ) {
        setGameOver(true)
        if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
        return
      }

      // Remove off-screen
      if (obstacle.x + obstacle.width < 0) {
        obstacles.current.splice(i, 1)
        i--
      }
    }

    // Increase difficulty & score
    setScore((s) => s + 1)
    if (frame.current % 500 === 0) speed.current += 0.5

    animationIdRef.current = requestAnimationFrame(gameLoop)
  }

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.width = 800
    canvas.height = 300
    dino.current.y = canvas.height - groundHeight - dino.current.height

    window.addEventListener('keydown', handleKeyDown)
    gameLoop()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col items-center gap-2 relative">
      <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <p className="mt-2 text-lg">Score: {score}</p>
      </div>
      <canvas ref={canvasRef} className="border border-gray-400" />

      {gameOver && (
        <button onClick={restartGame} className="mt-4 bg-red-500 text-white px-4 py-2 rounded">
          Restart
        </button>
      )}
    </div>
  )
}
