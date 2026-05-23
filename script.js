class Game {
	constructor() {
		this.svg = document.getElementById('game')
		this.toastSymbolId = '#toast'
		this.scoreEl = document.getElementById('score')
		this.livesEl = document.getElementById('lives')
		this.finalScoreInfoEl = document.getElementById('final-score-info')
		this.gameOverScreenEl = document.getElementById('game-over-screen')
		this.toasts = []
		this.score = 0
		this.initialSpawnInterval = 800 
		this.minSpawnInterval = 400 
		this.spawnInterval = this.initialSpawnInterval
		this.remainingLives = 3
		this.gameOver = false
		this.gameStartTime = performance.now()
		this.spawnTimer = null 

		this.loop = this.loop.bind(this)
		this.spawnToast()
		this.startSpawnTimer() 
		this.updateLives()
		requestAnimationFrame(this.loop)

		this.victoryScreenEl = document.getElementById('victory-screen')
		this.winScore = 15
		this.hasWon = false

		document.body.addEventListener("click", () => {
			const music = document.getElementById("bgMusic")
			music.play().catch(() => {})
		}, { once: true })
		
		this.restartBtn = document.getElementById('restart-btn')
		
		this.restartBtn.addEventListener('click', () => {
			this.restartGame()
		})
	}

	startSpawnTimer() {
		if (this.spawnTimer) {
			clearInterval(this.spawnTimer)
		}

		
		const gameTimeSeconds = (performance.now() - this.gameStartTime) / 1000
		this.spawnInterval = Math.max(this.minSpawnInterval, this.initialSpawnInterval - Math.floor(gameTimeSeconds / 10) * 100)

		this.spawnTimer = setInterval(() => {
			if (!this.gameOver) {
				this.spawnToast()
			}
		}, this.spawnInterval)
	}

	spawnToast() {
		if (this.gameOver) return

		const startX = Math.random() * 350 + 25
		const endX = Math.random() * 350 + 25
		const peakY = 200 + Math.random() * 50

		const toast = document.createElementNS('http://www.w3.org/2000/svg', 'use')
		toast.setAttribute('href', this.toastSymbolId)
		toast.setAttribute('class', 'toast')
		toast.setAttribute('x', startX)
		toast.setAttribute('y', 600)
		this.svg.appendChild(toast)

		const toastObj = {
			el: toast,
			startX,
			endX,
			startY: 600, 
			peakY,
			startTime: performance.now(),
			duration: 3000,
			clicked: false,
			upwardSpeedY: -8, 
			upwardSpeedX: (Math.random() - 0.5) * 5,
			reachedBottom: false
		}

		toast.addEventListener('pointerdown', (e) => {
			if (!this.gameOver && !toastObj.clicked) {
				this.score += 1
				this.scoreEl.textContent = this.score.toString().padStart(3, '0')
				
				// 💖 heart burst on final toast
				if (this.score === this.winScore) {
					this.createHeartBurst(e.clientX, e.clientY)
				}

				this.checkWin()

				toastObj.clicked = true
				toastObj.el.setAttribute('pointer-events', 'none')
				toastObj.el.classList.add('toast--clicked')
			}
		})

		this.toasts.push(toastObj)

		if (this.score === this.winScore - 2) {
			toast.classList.add('final-toast')
		}
	}

	checkGameOver() {
		if (this.remainingLives <= 0) {
			this.gameOver = true
			clearInterval(this.spawnTimer)
			
			this.gameOverScreenEl.setAttribute('visibility','visible')
			this.gameOverScreenEl.style.display = "block"
			
			this.gameOverScreenEl.style.pointerEvents = "all"
			
			this.finalScoreInfoEl.textContent = `Final Score: ${this.score}`
		}
	}

	loop(timestamp) {
		if (this.gameOver) {
			requestAnimationFrame(this.loop)
			return
		}

		this.toasts = this.toasts.filter(toast => {
			if (toast.clicked) {
				const currentY = parseFloat(toast.el.getAttribute('y'))
				const currentX = parseFloat(toast.el.getAttribute('x'))
				const newY = currentY + toast.upwardSpeedY
				const newX = currentX + toast.upwardSpeedX 

				toast.el.setAttribute('y', newY)
				toast.el.setAttribute('x', newX)

				if (newY < -100 || newX < -100 || newX > 550) { 
					toast.el.remove()
					return false
				}
			} else {
				const t = (timestamp - toast.startTime) / toast.duration

				if (t > 1) {
					if (!toast.reachedBottom) {
						this.remainingLives--
						this.updateLives()
						this.checkGameOver()
						toast.reachedBottom = true
					}
					toast.el.remove()
					return false
				}

				const x = toast.startX + (toast.endX - toast.startX) * t
				const y = toast.startY - (4 * t * (1 - t)) * (toast.startY - toast.peakY)

				toast.el.setAttribute('x', x)
				toast.el.setAttribute('y', y)
			}

			return true
		})

		requestAnimationFrame(this.loop)
	}

	updateLives(){
		this.livesEl.textContent = "❤️".repeat(this.remainingLives)
	}

	checkWin() {
		if (this.score >= this.winScore && !this.hasWon) {
			this.hasWon = true
			this.gameOver = true
			
			clearInterval(this.spawnTimer)
			
			this.victoryScreenEl.setAttribute('visibility', 'visible')
			
			setTimeout(() => {
				document.getElementById("love-screen").classList.remove("hidden")
				document.getElementById("love-screen").style.display = "flex"
			}, 1500)
		}
	}

	createHeartBurst(x, y) {
		for (let i = 0; i < 6; i++) {
			const heart = document.createElement("div")
			heart.textContent = "💖"
			heart.className = "heart-particle"
			
			heart.style.left = x + "px"
			heart.style.top = y + "px"
			
			document.body.appendChild(heart)
			
			setTimeout(() => heart.remove(), 1000)
		}
	}

	restartGame() {
		this.score = 0
    	this.remainingLives = 3
    	this.gameOver = false
    	this.hasWon = false

    	// Reset UI
    	this.scoreEl.textContent = "000"
    	this.updateLives()

    	this.gameOverScreenEl.setAttribute('visibility', 'hidden')
    	this.gameOverScreenEl.style.display = "none"

    	this.victoryScreenEl.setAttribute('visibility', 'hidden')

    	// Remove all toasts
    	this.toasts.forEach(t => t.el.remove())
    	this.toasts = []

    	// Reset timers
    	this.gameStartTime = performance.now()
    	this.startSpawnTimer()

    	// Restart loop
    	requestAnimationFrame(this.loop)
	}
}

const game = new Game()

let scale = 1
let minScale = 0.5
let maxScale = 3

let posX = 0
let posY = 0

let isDragging = false
let startX, startY

// Apply transform
function updateTransform() {
    letter.style.transform =
        `translate(calc(-50% + ${posX}px), calc(-50% + ${posY}px)) scale(${scale})`

		if (scale === minScale) {
			posX = 0
			posY = 0
		}
}

// 🖱️ MOUSE WHEEL ZOOM (FIXED)
letter.addEventListener("wheel", (e) => {
    e.preventDefault()

    const zoomSpeed = 0.1

    // 🔥 FIX: adjust properly instead of stacking weirdly
    let newScale = scale + (e.deltaY < 0 ? zoomSpeed : -zoomSpeed)

    // Clamp between min & max
    scale = Math.min(Math.max(newScale, minScale), maxScale)

    updateTransform()
}, { passive: false }) // ⚠️ IMPORTANT

// 🖱️ DRAG WITH MOUSE
letter.addEventListener("mousedown", (e) => {
    isDragging = true
    startX = e.clientX - posX
    startY = e.clientY - posY
    letter.style.cursor = "grabbing"
})

window.addEventListener("mousemove", (e) => {
    if (!isDragging) return

    posX = e.clientX - startX
    posY = e.clientY - startY

    updateTransform()
})

window.addEventListener("mouseup", () => {
    isDragging = false
    letter.style.cursor = "grab"
})

// 📱 TOUCH PINCH ZOOM
let initialDistance = null

letter.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches)
    }
})

letter.addEventListener("touchmove", (e) => {
    if (e.touches.length === 2) {
        e.preventDefault()

        let newDistance = getDistance(e.touches)

        if (initialDistance) {
            let zoomFactor = newDistance / initialDistance

            let newScale = scale * zoomFactor

            scale = Math.min(Math.max(newScale, minScale), maxScale)

            updateTransform()
        }

        initialDistance = newDistance
    }
}, { passive: false })

function getDistance(touches) {
    let dx = touches[0].clientX - touches[1].clientX
    let dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
}

let lastTap = 0

letterImg.addEventListener("touchend", (e) => {
    const now = Date.now()
    if (now - lastTap < 300) {
        scale = scale === 1 ? 2 : 1
        posX = 0
        posY = 0
        updateTransform()
    }
    lastTap = now
})